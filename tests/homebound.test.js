import { describe, it, expect, beforeEach } from 'vitest';
import { initialState, loadState, saveState, dateAfter, STORAGE_KEY } from '../src/storage.js';
import { evaluatePlanMatch, findSuggestedMatches } from '../src/matching.js';
import {
  escapeHtml,
  maskStudentId,
  getPublicStudentView,
  upsertTravelPlan,
  setTravelPlanStatus,
  deleteTravelPlan,
  updateStudentProfile,
  sendConnectionRequest,
  respondToConnectionRequest,
  cancelConnectionRequest,
  sendMessageToConnection,
  getConversationMessages
} from '../src/domain.js';

function createMemoryStorage(throwOnSet = false) {
  const store = new Map();
  return {
    getItem: key => (store.has(key) ? store.get(key) : null),
    setItem: (key, val) => {
      if (throwOnSet) throw new Error('QuotaExceededError');
      store.set(key, String(val));
    },
    removeItem: key => store.delete(key)
  };
}

describe('Student Profiles & Privacy', () => {
  let state;
  beforeEach(() => {
    state = initialState();
  });

  it('updates student profile fields and persists to directory safely', () => {
    const res = updateStudentProfile(state, 'you', {
      name: 'Nidhi Sharma',
      branch: 'Computer Engineering',
      year: '4th Year',
      hometown: 'Jaipur',
      nearby: 'Ajmer, Alwar',
      languages: 'English, Hindi',
      preferences: 'Day travel, Light luggage',
      intro: 'Heading home for semester break.'
    });
    expect(res.ok).toBe(true);
    expect(state.user.name).toBe('Nidhi Sharma');
    expect(state.user.nearby).toEqual(['Ajmer', 'Alwar']);
    const dir = state.students.find(s => s.id === 'you');
    expect(dir.name).toBe('Nidhi Sharma');
    expect(dir.email).toBeUndefined();
    expect(dir.studentId).toBeUndefined();
  });

  it('rejects invalid profile inputs and unauthorized edits', () => {
    const invalidName = updateStudentProfile(state, 'you', { name: 'A' });
    expect(invalidName.ok).toBe(false);

    const unauthorized = updateStudentProfile(state, 'u2', { name: 'Hacker' });
    expect(unauthorized.ok).toBe(false);
  });

  it('masks student IDs and strips private contact info from public views', () => {
    expect(maskStudentId('102303456')).toBe('10*******');
    const pub = getPublicStudentView({
      ...state.user,
      phone: '9876543210',
      address: 'Hostel J Room 101'
    });
    expect(pub.email).toBeUndefined();
    expect(pub.studentId).toBeUndefined();
    expect(pub.phone).toBeUndefined();
    expect(pub.address).toBeUndefined();
    expect(pub.name).toBe('Nidhi');
  });

  it('escapes HTML/JS injection payloads safely', () => {
    const payload = '<script>alert("xss")</script><img src=x onerror=alert(1)>';
    const escaped = escapeHtml(payload);
    expect(escaped).not.toContain('<script>');
    expect(escaped).toContain('&lt;script&gt;');
  });
});

describe('Travel Plan Management', () => {
  let state;
  beforeEach(() => {
    state = initialState();
  });

  it('creates, edits, pauses, reactivates, completes, and deletes travel plans', () => {
    const createRes = upsertTravelPlan(state, 'you', {
      from: 'TIET, Patiala',
      destination: 'Amritsar',
      nearby: ['Jalandhar'],
      date: dateAfter(10),
      flexible: false,
      time: 'Morning',
      seats: 2,
      note: 'Morning departure'
    });
    expect(createRes.ok).toBe(true);
    const planId = createRes.plan.id;

    const editRes = upsertTravelPlan(state, 'you', {
      from: 'TIET, Patiala',
      destination: 'Amritsar',
      nearby: ['Jalandhar', 'Ludhiana'],
      date: dateAfter(10),
      flexible: true,
      time: 'Afternoon',
      seats: 3,
      note: 'Updated departure'
    }, planId);
    expect(editRes.ok).toBe(true);
    expect(editRes.plan.time).toBe('Afternoon');

    expect(setTravelPlanStatus(state, 'you', planId, 'paused').ok).toBe(true);
    expect(state.plans.find(p => p.id === planId).status).toBe('paused');

    expect(setTravelPlanStatus(state, 'you', planId, 'active').ok).toBe(true);
    expect(state.plans.find(p => p.id === planId).status).toBe('active');

    expect(setTravelPlanStatus(state, 'you', planId, 'completed').ok).toBe(true);
    expect(state.plans.find(p => p.id === planId).status).toBe('completed');

    expect(deleteTravelPlan(state, 'you', planId).ok).toBe(true);
    expect(state.plans.some(p => p.id === planId)).toBe(false);
  });

  it('prevents past travel dates, duplicate active listings, and cross-account edits', () => {
    const pastRes = upsertTravelPlan(state, 'you', {
      from: 'TIET, Patiala',
      destination: 'Delhi',
      date: dateAfter(-2),
      time: 'Morning',
      seats: 1
    });
    expect(pastRes.ok).toBe(false);

    // Duplicate active plan for same destination & date as p-1 (Jaipur, dateAfter(7))
    const dupRes = upsertTravelPlan(state, 'you', {
      from: 'TIET, Patiala',
      destination: 'Jaipur',
      date: dateAfter(7),
      time: 'Evening',
      seats: 2
    });
    expect(dupRes.ok).toBe(false);

    // Cross-account access control
    expect(deleteTravelPlan(state, 'you', 'p-2').ok).toBe(false);
    expect(setTravelPlanStatus(state, 'you', 'p-2', 'paused').ok).toBe(false);
  });
});

describe('Travel Partner Matching Engine', () => {
  let state;
  beforeEach(() => {
    state = initialState();
  });

  it('matches exact destinations, nearby destinations, and flexible dates accurately', () => {
    const matches = findSuggestedMatches(state, 'you');
    const matchedIds = matches.map(m => m.plan.id);

    // p-5 is Jaipur on exact same date; p-3 is Ajmer (nearby) on +1 day with flexible date
    expect(matchedIds).toContain('p-5');
    expect(matchedIds).toContain('p-3');
    // p-2 (Delhi), p-4 (Chandigarh), p-6 (Lucknow) should not match Jaipur/Ajmer
    expect(matchedIds).not.toContain('p-2');
    expect(matchedIds).not.toContain('p-4');
    // Own plan p-1 must be excluded
    expect(matchedIds).not.toContain('p-1');

    const exactMatch = matches.find(m => m.plan.id === 'p-5').match;
    const nearbyMatch = matches.find(m => m.plan.id === 'p-3').match;
    expect(exactMatch.exactDestination).toBe(true);
    expect(exactMatch.labels).toContain('Exact Destination Match');
    expect(nearbyMatch.exactDestination).toBe(false);
    expect(nearbyMatch.labels).toContain('Nearby Destination');
    expect(exactMatch.score).toBeGreaterThan(nearbyMatch.score);
  });

  it('excludes incompatible dates and paused/completed plans without duplicates', () => {
    const planA = { id: 'a', owner: 'you', from: 'TIET', destination: 'Jaipur', nearby: [], date: dateAfter(5), flexible: false, time: 'Morning', status: 'active' };
    const planFarDate = { id: 'b', owner: 'u2', from: 'TIET', destination: 'Jaipur', nearby: [], date: dateAfter(8), flexible: true, time: 'Morning', status: 'active' };
    expect(evaluatePlanMatch(planA, planFarDate)).toBeNull();

    // Pause p-5 and verify it disappears from matches
    setTravelPlanStatus(state, 'u5', 'p-5', 'paused');
    const updatedMatches = findSuggestedMatches(state, 'you');
    expect(updatedMatches.some(m => m.plan.id === 'p-5')).toBe(false);
    // Ensure no duplicate plan IDs
    const ids = updatedMatches.map(m => m.plan.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('Connection Requests & Messaging', () => {
  let state;
  beforeEach(() => {
    state = initialState();
  });

  it('sends, cancels, prevents duplicates, and handles accept/reject with ownership checks', () => {
    const sendRes = sendConnectionRequest(state, 'you', 'p-5');
    expect(sendRes.ok).toBe(true);
    const reqId = sendRes.request.id;

    // Duplicate request blocked
    expect(sendConnectionRequest(state, 'you', 'p-5').ok).toBe(false);

    // Sender cannot accept their own outgoing request
    expect(respondToConnectionRequest(state, 'you', reqId, 'accepted').ok).toBe(false);

    // Sender can cancel pending request
    expect(cancelConnectionRequest(state, 'you', reqId).ok).toBe(true);
    expect(state.requests.find(r => r.id === reqId).status).toBe('cancelled');

    // Recipient accepts incoming demo request r-demo
    expect(respondToConnectionRequest(state, 'you', 'r-demo', 'accepted').ok).toBe(true);
    expect(state.requests.find(r => r.id === 'r-demo').status).toBe('accepted');
  });

  it('isolates messages per accepted connection and blocks unconnected messaging', () => {
    // Before accepting r-demo, messaging u2 is blocked
    expect(sendMessageToConnection(state, 'you', 'u2', 'Hello!').ok).toBe(false);

    // Accept connection with u2
    respondToConnectionRequest(state, 'you', 'r-demo', 'accepted');
    const msgRes = sendMessageToConnection(state, 'you', 'u2', 'Confirmed for Jaipur!');
    expect(msgRes.ok).toBe(true);

    const threadU2 = getConversationMessages(state, 'you', 'u2');
    const threadU3 = getConversationMessages(state, 'you', 'u3');
    expect(threadU2.some(m => m.text === 'Confirmed for Jaipur!')).toBe(true);
    expect(threadU3).toEqual([]);
  });
});

describe('LocalStorage Persistence & Resilience', () => {
  it('persists across reloads without overwriting unrelated records and recovers from corruption', () => {
    const storage = createMemoryStorage();
    const state = initialState();
    upsertTravelPlan(state, 'you', {
      from: 'TIET, Patiala',
      destination: 'Shimla',
      date: dateAfter(15),
      time: 'Morning',
      seats: 2
    });
    saveState(state, storage);

    const reloaded = loadState(storage);
    expect(reloaded.plans.some(p => p.destination === 'Shimla')).toBe(true);
    expect(reloaded.students.length).toBe(state.students.length);

    // Corrupted JSON fallback
    storage.setItem(STORAGE_KEY, '{corrupted_json:::');
    let errorReported = false;
    const recovered = loadState(storage, () => { errorReported = true; });
    expect(errorReported).toBe(true);
    expect(recovered.user.id).toBe('you');

    // QuotaExceededError handled gracefully
    const fullStorage = createMemoryStorage(true);
    let saveError = false;
    const saved = saveState(state, fullStorage, () => { saveError = true; });
    expect(saved).toBe(false);
    expect(saveError).toBe(true);
  });
});
