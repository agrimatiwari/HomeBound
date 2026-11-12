import { dateAfter } from './storage.js';

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[ch]));
}

export function sanitizeText(value, maxLen = 120) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, maxLen);
}

export function parseCommaList(value, maxItems = 10, maxItemLen = 40) {
  return [...new Set(
    String(value ?? '')
      .split(',')
      .map(item => sanitizeText(item, maxItemLen))
      .filter(Boolean)
  )].slice(0, maxItems);
}

export function maskStudentId(rawId) {
  const clean = sanitizeText(rawId, 24);
  if (clean.length <= 2) return '****';
  return `${clean.slice(0, 2)}${'*'.repeat(Math.max(4, clean.length - 2))}`;
}

export function isValidThaparEmail(email) {
  return /^[^\s@]+@(?:thapar\.edu|thapar\.edu\.in)$/i.test(String(email ?? '').trim());
}

/**
 * Returns only public-safe fields of a student profile.
 * Never exposes full Thapar IDs, private emails, phone numbers, or residential addresses.
 */
export function getPublicStudentView(student) {
  if (!student) return null;
  return {
    id: student.id,
    name: student.name,
    branch: student.branch,
    year: student.year,
    hometown: student.hometown,
    nearby: [...(student.nearby || [])],
    languages: [...(student.languages || [])],
    intro: student.intro,
    preferences: [...(student.preferences || [])],
    verified: Boolean(student.verified)
  };
}

export function validatePlanInput(input, minDate = dateAfter(0)) {
  const from = sanitizeText(input.from, 70);
  const destination = sanitizeText(input.destination, 50);
  const date = String(input.date || '').trim();
  const time = ['Morning', 'Afternoon', 'Evening', 'Anytime'].includes(input.time) ? input.time : 'Anytime';
  const seats = Number(input.seats);
  const nearby = Array.isArray(input.nearby) ? input.nearby : parseCommaList(input.nearby);
  const note = sanitizeText(input.note, 180);

  if (!from || from.length < 2) return { ok: false, error: 'Please enter a valid starting location.' };
  if (!destination || destination.length < 2) return { ok: false, error: 'Please enter a valid destination city.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(new Date(`${date}T12:00:00`).getTime())) {
    return { ok: false, error: 'Please choose a valid travel date.' };
  }
  if (date < minDate) {
    return { ok: false, error: 'Travel date cannot be in the past.' };
  }
  if (!Number.isInteger(seats) || seats < 1 || seats > 5) {
    return { ok: false, error: 'Potential travel partners must be between 1 and 5.' };
  }

  return {
    ok: true,
    data: {
      from,
      destination,
      nearby,
      date,
      flexible: Boolean(input.flexible),
      time,
      seats,
      note
    }
  };
}

export function upsertTravelPlan(state, actorId, input, planId = null, minDate = dateAfter(0)) {
  if (!actorId) return { ok: false, error: 'You must be signed in to manage travel plans.' };
  const validation = validatePlanInput(input, minDate);
  if (!validation.ok) return validation;

  const { data } = validation;

  if (planId) {
    const idx = state.plans.findIndex(p => p.id === planId);
    if (idx === -1) return { ok: false, error: 'Travel plan not found.' };
    if (state.plans[idx].owner !== actorId) {
      return { ok: false, error: 'Access denied: you can only edit your own travel plans.' };
    }

    // Prevent duplicate active listing for same user, destination, and date
    const dup = state.plans.find(p =>
      p.id !== planId &&
      p.owner === actorId &&
      (p.status || 'active') === 'active' &&
      p.destination.toLowerCase() === data.destination.toLowerCase() &&
      p.date === data.date
    );
    if (dup) return { ok: false, error: 'You already have an active travel plan to this destination on that date.' };

    state.plans[idx] = { ...state.plans[idx], ...data };
    return { ok: true, plan: state.plans[idx], isNew: false };
  }

  // Prevent duplicate active listing on create
  const duplicate = state.plans.find(p =>
    p.owner === actorId &&
    (p.status || 'active') === 'active' &&
    p.destination.toLowerCase() === data.destination.toLowerCase() &&
    p.date === data.date
  );
  if (duplicate) {
    return { ok: false, error: 'You already have an active travel plan to this destination on that date.' };
  }

  const createdPlan = {
    id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    owner: actorId,
    ...data,
    status: 'active',
    created: Date.now()
  };
  state.plans.push(createdPlan);
  return { ok: true, plan: createdPlan, isNew: true };
}

export function setTravelPlanStatus(state, actorId, planId, nextStatus) {
  const allowed = ['active', 'paused', 'completed'];
  if (!allowed.includes(nextStatus)) return { ok: false, error: 'Invalid plan status.' };
  const plan = state.plans.find(p => p.id === planId);
  if (!plan) return { ok: false, error: 'Travel plan not found.' };
  if (plan.owner !== actorId) {
    return { ok: false, error: 'Access denied: you can only manage your own travel plans.' };
  }
  plan.status = nextStatus;
  return { ok: true, plan };
}

export function deleteTravelPlan(state, actorId, planId) {
  const plan = state.plans.find(p => p.id === planId);
  if (!plan) return { ok: false, error: 'Travel plan not found.' };
  if (plan.owner !== actorId) {
    return { ok: false, error: 'Access denied: you can only delete your own travel plans.' };
  }
  state.plans = state.plans.filter(p => p.id !== planId);
  state.requests = state.requests.filter(r => r.planId !== planId);
  return { ok: true };
}

export function updateStudentProfile(state, actorId, input) {
  if (!state.user || state.user.id !== actorId) {
    return { ok: false, error: 'Access denied: you can only edit your own profile.' };
  }
  const name = sanitizeText(input.name, 60);
  if (!name || name.length < 2) {
    return { ok: false, error: 'Student name must be at least 2 characters.' };
  }
  const branch = sanitizeText(input.branch, 60) || state.user.branch;
  const year = sanitizeText(input.year, 30) || state.user.year;
  const hometown = sanitizeText(input.hometown, 50);
  const nearby = Array.isArray(input.nearby) ? input.nearby : parseCommaList(input.nearby);
  const languages = Array.isArray(input.languages) ? input.languages : parseCommaList(input.languages);
  const preferences = Array.isArray(input.preferences) ? input.preferences : parseCommaList(input.preferences);
  const intro = sanitizeText(input.intro, 250);

  Object.assign(state.user, { name, branch, year, hometown, nearby, languages, preferences, intro });
  const directoryEntry = state.students.find(s => s.id === actorId);
  if (directoryEntry) {
    Object.assign(directoryEntry, getPublicStudentView(state.user));
  }
  return { ok: true, user: state.user };
}

export function sendConnectionRequest(state, fromId, planId) {
  if (!fromId) return { ok: false, error: 'Sign in required.' };
  const plan = state.plans.find(p => p.id === planId);
  if (!plan) return { ok: false, error: 'Travel plan not found.' };
  if ((plan.status || 'active') !== 'active') {
    return { ok: false, error: 'This travel plan is no longer active.' };
  }
  if (plan.owner === fromId) {
    return { ok: false, error: 'You cannot send a connection request to your own plan.' };
  }

  const existing = state.requests.find(r => r.from === fromId && r.to === plan.owner && r.planId === plan.id);
  if (existing && (existing.status === 'pending' || existing.status === 'accepted')) {
    return { ok: false, error: 'A connection request already exists for this travel plan.' };
  }

  if (existing) {
    existing.status = 'pending';
    existing.created = Date.now();
    return { ok: true, request: existing };
  }

  const request = {
    id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    from: fromId,
    to: plan.owner,
    planId: plan.id,
    status: 'pending',
    created: Date.now()
  };
  state.requests.push(request);
  return { ok: true, request };
}

export function respondToConnectionRequest(state, actorId, requestId, nextStatus) {
  if (!['accepted', 'declined'].includes(nextStatus)) {
    return { ok: false, error: 'Invalid response status.' };
  }
  const req = state.requests.find(r => r.id === requestId);
  if (!req) return { ok: false, error: 'Connection request not found.' };
  if (req.to !== actorId) {
    return { ok: false, error: 'Access denied: only the recipient can accept or decline this request.' };
  }
  if (req.status !== 'pending') {
    return { ok: false, error: 'Only pending requests can be accepted or declined.' };
  }
  req.status = nextStatus;
  return { ok: true, request: req };
}

export function cancelConnectionRequest(state, actorId, requestId) {
  const req = state.requests.find(r => r.id === requestId);
  if (!req) return { ok: false, error: 'Connection request not found.' };
  if (req.from !== actorId) {
    return { ok: false, error: 'Access denied: only the sender can cancel this request.' };
  }
  if (req.status !== 'pending') {
    return { ok: false, error: 'Only pending requests can be cancelled.' };
  }
  req.status = 'cancelled';
  return { ok: true, request: req };
}

export function getAcceptedConnections(state, userId) {
  const ids = state.requests
    .filter(r => r.status === 'accepted' && (r.from === userId || r.to === userId))
    .map(r => (r.from === userId ? r.to : r.from));
  return [...new Set(ids)];
}

export function sendMessageToConnection(state, fromId, recipientId, rawText) {
  const text = sanitizeText(rawText, 350);
  if (!text) return { ok: false, error: 'Message cannot be empty.' };
  if (!recipientId || recipientId === fromId) return { ok: false, error: 'Invalid recipient.' };
  const connected = getAcceptedConnections(state, fromId);
  if (!connected.includes(recipientId)) {
    return { ok: false, error: 'Messaging is restricted to accepted connections.' };
  }
  const message = {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    connection: recipientId,
    from: fromId,
    to: recipientId,
    text,
    time: Date.now()
  };
  state.messages.push(message);
  return { ok: true, message };
}

export function getConversationMessages(state, userId, partnerId) {
  if (!userId || !partnerId || !Array.isArray(state.messages)) return [];
  return state.messages
    .filter(m => {
      if (!m || typeof m.text !== 'string') return false;
      if (m.to) {
        return (m.from === userId && m.to === partnerId) || (m.from === partnerId && m.to === userId);
      }
      return m.connection === partnerId && (m.from === userId || m.from === partnerId);
    })
    .sort((a, b) => (a.time || 0) - (b.time || 0));
}
