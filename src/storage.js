export const STORAGE_KEY = 'homebound-state-v1';

export function dateAfter(days, baseDate = new Date()) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function initialState(baseDate = new Date()) {
  return {
    user: {
      id: 'you',
      name: 'Nidhi',
      email: 'nidhi.demo@thapar.edu',
      studentId: '1023****',
      branch: 'Computer Engineering',
      year: '3rd Year',
      hometown: 'Jaipur',
      nearby: ['Ajmer', 'Kishangarh'],
      languages: ['English', 'Hindi', 'Punjabi'],
      intro: 'Curious about new places, playlists, and good conversations. I usually plan ahead and like an easy-going journey.',
      preferences: ['Day travel', 'Planned ahead', 'Light luggage'],
      verified: true,
      isDemo: true
    },
    plans: [
      { id: 'p-1', owner: 'you', from: 'TIET, Patiala', destination: 'Jaipur', nearby: ['Ajmer', 'Kishangarh'], date: dateAfter(7, baseDate), flexible: true, time: 'Morning', seats: 2, status: 'active', note: 'Planning a daytime trip during the break.', created: Date.now() },
      { id: 'p-2', owner: 'u2', from: 'TIET, Patiala', destination: 'Delhi', nearby: ['Gurugram', 'Noida'], date: dateAfter(2, baseDate), flexible: false, time: 'Afternoon', seats: 2, status: 'active', note: 'Prefer an early afternoon departure.', created: Date.now() - 1000 },
      { id: 'p-3', owner: 'u3', from: 'TIET, Patiala', destination: 'Ajmer', nearby: ['Jaipur', 'Kishangarh'], date: dateAfter(8, baseDate), flexible: true, time: 'Morning', seats: 1, status: 'active', note: 'Flexible by a day, would love to coordinate in advance.', created: Date.now() - 2000 },
      { id: 'p-4', owner: 'u4', from: 'TIET, Patiala', destination: 'Chandigarh', nearby: ['Mohali', 'Panchkula'], date: dateAfter(6, baseDate), flexible: false, time: 'Evening', seats: 3, status: 'active', note: 'Looking to connect with fellow students heading north.', created: Date.now() - 3000 },
      { id: 'p-5', owner: 'u5', from: 'TIET, Patiala', destination: 'Jaipur', nearby: ['Alwar', 'Ajmer'], date: dateAfter(7, baseDate), flexible: false, time: 'Morning', seats: 2, status: 'active', note: 'Same-day plans are easiest for me.', created: Date.now() - 4000 },
      { id: 'p-6', owner: 'u6', from: 'TIET, Patiala', destination: 'Lucknow', nearby: ['Kanpur'], date: dateAfter(12, baseDate), flexible: true, time: 'Anytime', seats: 1, status: 'active', note: 'Open to discussing travel preferences with another student.', created: Date.now() - 5000 }
    ],
    students: [
      { id: 'you', name: 'Nidhi', branch: 'Computer Engineering', year: '3rd Year', hometown: 'Jaipur', nearby: ['Ajmer', 'Kishangarh'], languages: ['English', 'Hindi', 'Punjabi'], intro: 'Curious about new places, playlists, and good conversations. I usually plan ahead and like an easy-going journey.', preferences: ['Day travel', 'Planned ahead', 'Light luggage'], verified: true },
      { id: 'u2', name: 'Mehak Bansal', branch: 'Electrical Engineering', year: '2nd Year', hometown: 'Delhi', nearby: ['Noida', 'Gurugram'], languages: ['Hindi', 'English'], intro: 'I enjoy planning ahead and discovering new cafés once I am home.', preferences: ['Day travel', 'Quiet journey'], verified: true },
      { id: 'u3', name: 'Rohan Mehta', branch: 'Mechanical Engineering', year: '4th Year', hometown: 'Ajmer', nearby: ['Jaipur', 'Kishangarh'], languages: ['Hindi', 'English'], intro: 'Final-year student, happy to coordinate with other students going towards Rajasthan.', preferences: ['Flexible dates', 'Light luggage'], verified: true },
      { id: 'u4', name: 'Simran Kaur', branch: 'Civil Engineering', year: '3rd Year', hometown: 'Chandigarh', nearby: ['Mohali', 'Panchkula'], languages: ['Punjabi', 'Hindi', 'English'], intro: 'I like relaxed, well-planned travel and meeting fellow students.', preferences: ['Evening travel', 'Planned ahead'], verified: true },
      { id: 'u5', name: 'Diya Kapoor', branch: 'Computer Engineering', year: '2nd Year', hometown: 'Jaipur', nearby: ['Ajmer', 'Alwar'], languages: ['Hindi', 'English'], intro: 'Heading home for the break and looking to connect with students on a similar route.', preferences: ['Day travel', 'Flexible dates'], verified: true },
      { id: 'u6', name: 'Kabir Verma', branch: 'Electronics Engineering', year: '3rd Year', hometown: 'Lucknow', nearby: ['Kanpur', 'Prayagraj'], languages: ['Hindi', 'English'], intro: 'A music lover who prefers getting travel plans sorted early.', preferences: ['Flexible dates', 'Quiet journey'], verified: true }
    ],
    requests: [
      { id: 'r-demo', from: 'u2', to: 'you', planId: 'p-1', status: 'pending', created: Date.now() }
    ],
    messages: [
      { id: 'm1', connection: 'u2', from: 'u2', text: 'Hi Nidhi! I noticed you are heading towards Jaipur. Would be nice to compare our plans.', time: Date.now() - 3600000 },
      { id: 'm2', connection: 'u2', from: 'you', text: 'Hi Mehak! Sure — my date is flexible by a day. What are you thinking?', time: Date.now() - 3000000 }
    ],
    preferences: { theme: 'light', emailUpdates: true },
    currentPage: 'dashboard',
    lastUser: null
  };
}

/**
 * Normalizes and validates loaded state to protect against malformed or corrupted LocalStorage.
 * Preserves existing user data while ensuring required schema structures exist.
 */
export function normalizeState(raw, fallback = initialState()) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return fallback;

  const validPlans = Array.isArray(raw.plans)
    ? raw.plans
        .filter(p => p && typeof p === 'object' && typeof p.id === 'string' && typeof p.owner === 'string' && typeof p.destination === 'string' && typeof p.date === 'string')
        .map(p => ({
          ...p,
          from: String(p.from || 'TIET, Patiala').trim(),
          destination: String(p.destination).trim(),
          nearby: Array.isArray(p.nearby) ? p.nearby.map(String) : [],
          flexible: Boolean(p.flexible),
          time: ['Morning', 'Afternoon', 'Evening', 'Anytime'].includes(p.time) ? p.time : 'Anytime',
          seats: Math.min(5, Math.max(1, Number(p.seats) || 1)),
          status: ['active', 'paused', 'completed', 'cancelled'].includes(p.status) ? p.status : 'active',
          note: String(p.note || '').slice(0, 180)
        }))
    : fallback.plans;

  const validStudents = Array.isArray(raw.students)
    ? raw.students.filter(s => s && typeof s === 'object' && typeof s.id === 'string' && typeof s.name === 'string')
    : fallback.students;

  const validRequests = Array.isArray(raw.requests)
    ? raw.requests
        .filter(r => r && typeof r === 'object' && typeof r.id === 'string' && typeof r.from === 'string' && typeof r.to === 'string')
        .map(r => ({
          ...r,
          status: ['pending', 'accepted', 'declined', 'cancelled'].includes(r.status) ? r.status : 'pending'
        }))
    : fallback.requests;

  const validMessages = Array.isArray(raw.messages)
    ? raw.messages.filter(m => m && typeof m === 'object' && typeof m.id === 'string' && typeof m.connection === 'string' && typeof m.from === 'string' && typeof m.text === 'string')
    : fallback.messages;

  let validUser = null;
  if (raw.user !== null) {
    if (raw.user && typeof raw.user === 'object' && typeof raw.user.id === 'string' && typeof raw.user.name === 'string') {
      validUser = {
        ...fallback.user,
        ...raw.user,
        nearby: Array.isArray(raw.user.nearby) ? raw.user.nearby : [],
        languages: Array.isArray(raw.user.languages) ? raw.user.languages : [],
        preferences: Array.isArray(raw.user.preferences) ? raw.user.preferences : []
      };
    } else {
      validUser = fallback.user;
    }
  }

  return {
    user: validUser,
    plans: validPlans,
    students: validStudents,
    requests: validRequests,
    messages: validMessages,
    preferences: {
      theme: raw.preferences?.theme === 'dark' ? 'dark' : 'light',
      emailUpdates: raw.preferences?.emailUpdates !== false
    },
    currentPage: typeof raw.currentPage === 'string' ? raw.currentPage : 'dashboard',
    lastUser: raw.lastUser && typeof raw.lastUser === 'object' ? raw.lastUser : null
  };
}

export function loadState(storage = globalThis.localStorage, onError = null) {
  try {
    if (!storage) return initialState();
    const saved = storage.getItem(STORAGE_KEY);
    if (!saved) return initialState();
    const parsed = JSON.parse(saved);
    return normalizeState(parsed, initialState());
  } catch (error) {
    if (onError) onError('Saved data was corrupted or unreadable. Loaded a clean prototype state.');
    return initialState();
  }
}

export function saveState(state, storage = globalThis.localStorage, onError = null) {
  try {
    if (!storage) return false;
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    if (onError) onError('Changes could not be saved (storage unavailable or quota exceeded).');
    return false;
  }
}
