const icons = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  route: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h2a4 4 0 0 0 4-4V9a4 4 0 0 1 4-4"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  message: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a7 7 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a7 7 0 0 1-1.6-.9l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-1.9l-1.4-1.1 1.4-2.4 1.7.7a7 7 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a7 7 0 0 1 1.6.9l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 1.9z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/><path d="m9 12 2 2 4-4"/>',
  plane: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  arrow: '<path d="M5 12h14m-7-7 7 7-7 7"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
  moon: '<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>',
  spark: '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3z"/><path d="m19 14 1 2.5 2.5 1-2.5 1L19 21l-1-2.5-2.5-1 2.5-1z"/>',
  close: '<path d="m18 6-12 12M6 6l12 12"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5m5 5H9"/>'
};
const icon = (name, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.spark}</svg>`;
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const today = new Date();
const dateAfter = days => { const date = new Date(today); date.setDate(date.getDate() + days); return date.toISOString().slice(0, 10); };

function initialState() {
  return {
    user: {
      id: 'you', name: 'Nidhi', email: 'nidhi.demo@thapar.edu', studentId: '1023****',
      branch: 'Computer Engineering', year: '3rd Year', hometown: 'Jaipur',
      nearby: ['Ajmer', 'Kishangarh'], languages: ['English', 'Hindi', 'Punjabi'],
      intro: 'Curious about new places, playlists, and good conversations. I usually plan ahead and like an easy-going journey.',
      preferences: ['Day travel', 'Planned ahead', 'Light luggage'], verified: true, isDemo: true
    },
    plans: [
      { id: 'p-1', owner: 'you', from: 'TIET, Patiala', destination: 'Jaipur', nearby: ['Ajmer', 'Kishangarh'], date: dateAfter(7), flexible: true, time: 'Morning', seats: 2, note: 'Planning a daytime trip during the break.', created: Date.now() },
      { id: 'p-2', owner: 'u2', from: 'TIET, Patiala', destination: 'Delhi', nearby: ['Gurugram', 'Noida'], date: dateAfter(2), flexible: false, time: 'Afternoon', seats: 2, note: 'Prefer an early afternoon departure.', created: Date.now() - 1000 },
      { id: 'p-3', owner: 'u3', from: 'TIET, Patiala', destination: 'Ajmer', nearby: ['Jaipur', 'Kishangarh'], date: dateAfter(8), flexible: true, time: 'Morning', seats: 1, note: 'Flexible by a day, would love to coordinate in advance.', created: Date.now() - 2000 },
      { id: 'p-4', owner: 'u4', from: 'TIET, Patiala', destination: 'Chandigarh', nearby: ['Mohali', 'Panchkula'], date: dateAfter(6), flexible: false, time: 'Evening', seats: 3, note: 'Looking to connect with fellow students heading north.', created: Date.now() - 3000 },
      { id: 'p-5', owner: 'u5', from: 'TIET, Patiala', destination: 'Jaipur', nearby: ['Alwar', 'Ajmer'], date: dateAfter(7), flexible: false, time: 'Morning', seats: 2, note: 'Same-day plans are easiest for me.', created: Date.now() - 4000 },
      { id: 'p-6', owner: 'u6', from: 'TIET, Patiala', destination: 'Lucknow', nearby: ['Kanpur'], date: dateAfter(12), flexible: true, time: 'Anytime', seats: 1, note: 'Open to discussing travel preferences with another student.', created: Date.now() - 5000 }
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
    preferences: { theme: 'light', emailUpdates: true }, currentPage: 'dashboard', lastUser: null
  };
}
function loadState() {
  try {
    const saved = localStorage.getItem('homebound-state-v1');
    if (saved) return { ...initialState(), ...JSON.parse(saved) };
  } catch (error) {
    console.error('Could not load HomeBound demo data:', error);
    toast('Saved data could not be loaded. A fresh demo has started.');
  }
  return initialState();
}
let state = loadState();
let discoveryQuery = '';
let dateFilter = '';
let discoveryTab = 'matches';
let requestTab = 'received';
let activeConversation = '';
let toastTimer;
function persist() {
  try { localStorage.setItem('homebound-state-v1', JSON.stringify(state)); }
  catch (error) { console.error('Could not save HomeBound demo data:', error); toast('Changes could not be saved in this browser.'); }
}
function toast(message) {
  const element = document.getElementById('toast');
  if (!element) return;
  element.textContent = message;
  element.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove('show'), 2800);
}
const person = id => state.students.find(student => student.id === id) || (state.user.id === id ? state.user : null);
const fullName = id => person(id)?.name || 'Thapar student';
const initials = name => name.split(/\s+/).slice(0, 2).map(part => part[0] || '').join('').toUpperCase();
const niceDate = value => new Date(`${value}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
const daysApart = (a, b) => Math.round(Math.abs(new Date(`${a}T12:00:00`) - new Date(`${b}T12:00:00`)) / 86400000);
const timeCompatible = (a, b) => a === 'Anytime' || b === 'Anytime' || a === b || (a === 'Morning' && b === 'Afternoon') || (a === 'Afternoon' && b === 'Morning');
function dateMatch(a, b) { return a.date === b.date || ((a.flexible || b.flexible) && daysApart(a.date, b.date) <= 1); }
function getMatch(planA, planB) {
  const destinationsA = [planA.destination, ...(planA.nearby || [])];
  const destinationsB = [planB.destination, ...(planB.nearby || [])];
  const common = destinationsA.find(city => destinationsB.some(candidate => candidate.toLowerCase() === city.toLowerCase()));
  if (!common || !dateMatch(planA, planB)) return null;
  const exact = planA.destination.toLowerCase() === planB.destination.toLowerCase();
  const dateExact = planA.date === planB.date;
  const timing = timeCompatible(planA.time, planB.time);
  return { exact, dateExact, timing, city: common, score: (exact ? 4 : 2) + (dateExact ? 2 : 1) + (timing ? 1 : 0), reason: `${exact ? 'Same destination' : `Nearby destination: ${common}`} · ${dateExact ? 'same date' : 'flexible date'}${timing ? ' · compatible time' : ''}` };
}
function getMyPlans() { return state.plans.filter(plan => plan.owner === state.user.id); }
function pendingReceived() { return state.requests.filter(req => req.to === state.user.id && req.status === 'pending'); }
function navItem(page, label, iconName, count = 0) {
  return `<button class="nav-item ${state.currentPage === page ? 'active' : ''}" data-page="${page}" aria-label="${label}">${icon(iconName)}<span class="nav-label">${label}</span>${count ? `<span class="nav-count">${count}</span>` : ''}</button>`;
}
function logo() { return `<div class="brand-mark">${icon('route')}</div><div class="brand-copy"><div class="brand-name">HomeBound</div><div class="brand-caption">Your campus travel circle</div></div>`; }
function headerName() { return `<div class="top-user"><div class="avatar small">${esc(initials(state.user.name))}</div><div class="top-user-copy"><strong>${esc(state.user.name)}</strong><span>Thapar student</span></div></div>`; }
function shell(content) {
  return `<div class="app-shell">
    <aside class="sidebar"><div class="brand">${logo()}</div><div class="nav-caption">Workspace</div><nav class="nav-list">${navItem('dashboard', 'Dashboard', 'home')}${navItem('discover', 'Find partners', 'search')}${navItem('plans', 'My travel plans', 'route')}${navItem('requests', 'Connections', 'users', pendingReceived().length)}${navItem('messages', 'Messages', 'message')}${navItem('profile', 'My profile', 'user')}${navItem('settings', 'Settings', 'settings')}</nav>
      <div class="sidebar-bottom"><div class="safety-mini"><strong>${icon('shield')} Travel thoughtfully</strong><p>Connect here, then verify plans through trusted university channels.</p></div><div class="sidebar-profile"><div class="avatar small">${esc(initials(state.user.name))}</div><div class="profile-meta"><strong>${esc(state.user.name)}</strong><span>${state.user.verified ? 'Verified student' : 'Verification pending'}</span></div><button class="profile-button" data-page="settings" aria-label="Settings">${icon('settings')}</button></div></div></aside>
    <div class="main-area"><header class="topbar"><div class="breadcrumb">Campus community <span aria-hidden="true">/</span> <strong>${esc(pageTitle(state.currentPage))}</strong></div><div class="top-actions"><button class="icon-button" data-action="toggle-theme" aria-label="Toggle theme">${icon(state.preferences.theme === 'dark' ? 'sun' : 'moon')}</button>${headerName()}</div></header><main class="content">${content}</main></div>
    <nav class="mobile-nav">${navItem('dashboard', 'Home', 'home')}${navItem('discover', 'Discover', 'search')}${navItem('plans', 'Plans', 'route')}${navItem('requests', 'Connect', 'users', pendingReceived().length)}${navItem('messages', 'Messages', 'message')}${navItem('profile', 'Profile', 'user')}${navItem('settings', 'Settings', 'settings')}</nav>
  </div>`;
}
function pageTitle(page) { return ({ dashboard: 'Dashboard', discover: 'Find travel partners', plans: 'My travel plans', requests: 'Connection requests', messages: 'Messages', profile: 'My profile', settings: 'Settings' })[page] || 'Dashboard'; }
function verifiedBadge() { return `<span class="badge badge-verified">${icon('check')} Verified Thapar student</span>`; }
function matchCard(plan, match, showConnect = true) {
  const student = person(plan.owner);
  if (!student) return '';
  const request = state.requests.find(req => req.from === state.user.id && req.to === plan.owner && req.planId === plan.id);
  const label = request ? (request.status === 'pending' ? 'Request sent' : request.status === 'accepted' ? 'Connected' : 'Request declined') : 'Connect';
  return `<article class="card match-card"><div class="match-top"><div class="avatar">${esc(initials(student.name))}</div><div class="match-person"><strong>${esc(student.name)}</strong><span class="muted-line">${esc(student.branch)} · ${esc(student.year)}</span><div class="match-badges">${verifiedBadge()}${match ? `<span class="badge ${match.exact ? 'badge-exact' : 'badge-nearby'}">${match.exact ? 'Exact match' : 'Nearby match'}</span>` : ''}</div></div></div>
    <div class="match-route"><div class="route-point"><span>Travelling from</span><strong>${esc(plan.from)}</strong></div><span class="route-arrow">${icon('arrow')}</span><div class="route-point"><span>Destination</span><strong>${esc(plan.destination)}</strong></div></div>
    <div class="match-details"><span class="detail-item">${icon('calendar')}${niceDate(plan.date)}${plan.flexible ? ' · flexible' : ''}</span><span class="detail-item">${icon('clock')}${esc(plan.time)}</span><span class="detail-item">${icon('users')}Looking for ${plan.seats}</span></div>
    ${match ? `<div class="match-note"><strong>Why this matches:</strong> ${esc(match.reason)}. ${match.timing ? 'Departure times align well.' : 'Departure times may need a conversation.'}</div>` : `<div class="preference-chips">${student.preferences.map(item => `<span class="chip">${esc(item)}</span>`).join('')}</div>`}
    <div class="match-actions"><span class="muted-line">${esc(student.hometown)} · ${student.languages.slice(0, 2).map(esc).join(', ')}</span>${showConnect ? `<button class="button ${request && request.status !== 'declined' ? 'button-secondary' : 'button-primary'}" data-action="connect" data-plan="${esc(plan.id)}" ${request && request.status !== 'declined' ? 'disabled' : ''}>${request && request.status !== 'declined' ? label : `${icon('users')} Connect`}</button>` : ''}</div></article>`;
}
function dashboardPage() {
  const mine = getMyPlans();
  const matches = suggestedMatches().slice(0, 2);
  const upcoming = mine.filter(plan => plan.date >= dateAfter(0)).sort((a, b) => a.date.localeCompare(b.date))[0];
  return `<section class="welcome-panel"><div class="welcome-copy"><div class="eyebrow">Good to have you here</div><h1>Where are you headed, ${esc(state.user.name.split(' ')[0])}?</h1><p>Find fellow Thapar students going your way, and make the journey feel a little more familiar.</p><button class="button" data-page="create-plan">${icon('plus')} Share a travel plan</button></div><div class="welcome-art" aria-hidden="true"><div class="sun"></div><div class="hill"></div></div></section>
  <div class="stats-grid"><div class="card stat-card"><div class="stat-icon">${icon('route')}</div><div><div class="stat-number">${mine.length}</div><div class="stat-label">Active travel plans</div></div></div><div class="card stat-card"><div class="stat-icon orange">${icon('spark')}</div><div><div class="stat-number">${suggestedMatches().length}</div><div class="stat-label">Suggested matches</div></div></div><div class="card stat-card"><div class="stat-icon blue">${icon('users')}</div><div><div class="stat-number">${pendingReceived().length}</div><div class="stat-label">Pending requests</div></div></div></div>
  <div class="dashboard-grid"><section><div class="section-row"><h2>Matches for your plans</h2><button class="text-link" data-page="discover">See all matches →</button></div><div class="stack">${matches.length ? matches.map(item => matchCard(item.plan, item.match)).join('') : emptyState('No matches just yet', 'Add a travel plan and we will look for fellow students heading your way.', 'plus', 'Create a plan', 'create-plan')}</div></section>
  <aside><div class="section-row"><h2>Your next trip</h2><button class="text-link" data-page="plans">View plans</button></div>${upcoming ? `<article class="card upcoming-card"><div class="upcoming-top"><div class="date-block"><span>${new Date(`${upcoming.date}T12:00:00`).toLocaleDateString('en-IN', { month: 'short' })}</span><strong>${new Date(`${upcoming.date}T12:00:00`).getDate()}</strong></div><div class="upcoming-dest"><span>Next travel plan</span><strong>${esc(upcoming.destination)}</strong><span>${esc(upcoming.from)}</span></div>${icon('plane')}</div><div class="upcoming-meta"><span>${upcoming.flexible ? 'Date is flexible' : 'Fixed date'}</span><span>${esc(upcoming.time)}</span></div></article>` : emptyState('No upcoming plans', 'Create a plan to find students with similar travel dates.', 'calendar', 'Create a plan', 'create-plan')}
  <div class="safety-banner">${icon('shield')}<span><strong>A quick safety reminder</strong><br>HomeBound helps students discover potential travel partners. It does not verify travel arrangements or provide transport. Verify plans through trusted university channels and consult trusted adults before making arrangements.</span></div></aside></div>`;
}
function suggestedMatches() {
  const mine = getMyPlans();
  return state.plans.filter(plan => plan.owner !== state.user.id).map(plan => {
    const match = mine.map(myPlan => getMatch(myPlan, plan)).filter(Boolean).sort((a, b) => b.score - a.score)[0];
    return match ? { plan, match } : null;
  }).filter(Boolean).sort((a, b) => b.match.score - a.match.score);
}
function emptyState(title, text, glyph = 'spark', buttonLabel = '', buttonPage = '') {
  return `<div class="card empty-state"><div class="empty-icon">${icon(glyph)}</div><h3>${esc(title)}</h3><p>${esc(text)}</p>${buttonLabel ? `<button class="button button-primary" data-page="${buttonPage}">${icon('plus')}${esc(buttonLabel)}</button>` : ''}</div>`;
}
function discoverPage() {
  const allPlans = state.plans.filter(plan => plan.owner !== state.user.id);
  const mine = getMyPlans();
  const plans = allPlans.map(plan => ({ plan, match: mine.map(minePlan => getMatch(minePlan, plan)).filter(Boolean).sort((a, b) => b.score - a.score)[0] }))
    .filter(item => discoveryTab === 'matches' ? item.match : true)
    .filter(item => !dateFilter || item.plan.date === dateFilter || (item.plan.flexible && daysApart(item.plan.date, dateFilter) <= 1))
    .filter(item => !discoveryQuery || [item.plan.destination, item.plan.nearby.join(' '), person(item.plan.owner)?.hometown, person(item.plan.owner)?.name].join(' ').toLowerCase().includes(discoveryQuery.toLowerCase()))
    .sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0));
  return `<div class="page-heading"><div><div class="eyebrow">Find your travel circle</div><h1>Find travel partners</h1><p class="subheading">Discover verified Thapar students heading to the same or nearby places.</p></div><button class="button button-primary" data-page="create-plan">${icon('plus')} Add your plan</button></div>
  <div class="tabs"><button class="tab-button ${discoveryTab === 'matches' ? 'active' : ''}" data-action="discovery-tab" data-tab="matches">Matches for me</button><button class="tab-button ${discoveryTab === 'all' ? 'active' : ''}" data-action="discovery-tab" data-tab="all">All travel plans</button></div>
  <div class="card toolbar"><label class="search-box">${icon('search')}<input class="input" type="search" id="discovery-search" placeholder="Search a city or student" value="${esc(discoveryQuery)}" aria-label="Search a city or student"></label><input class="input select" type="date" id="discovery-date" value="${esc(dateFilter)}" aria-label="Filter by travel date"><button class="button button-secondary" data-action="clear-filters">Clear filters</button></div>
  ${plans.length ? `<div class="content-grid">${plans.map(item => matchCard(item.plan, item.match)).join('')}</div>` : emptyState('No travel plans found', discoveryTab === 'matches' && !mine.length ? 'Create your own travel plan to see compatible students here.' : 'Try a different city or date, or check all travel plans.', 'search', discoveryTab === 'matches' && !mine.length ? 'Create a plan' : '', discoveryTab === 'matches' && !mine.length ? 'create-plan' : '')}`;
}
function planCard(plan) {
  return `<article class="card plan-card"><div class="upcoming-top"><div class="date-block"><span>${new Date(`${plan.date}T12:00:00`).toLocaleDateString('en-IN', { month: 'short' })}</span><strong>${new Date(`${plan.date}T12:00:00`).getDate()}</strong></div><div class="upcoming-dest"><span>${plan.flexible ? 'Flexible date' : 'Travel date'}</span><strong>${esc(plan.destination)}</strong><span>From ${esc(plan.from)}</span></div><span class="badge badge-verified">Active</span></div><div class="match-details"><span class="detail-item">${icon('clock')}${esc(plan.time)}</span><span class="detail-item">${icon('users')}Looking for ${plan.seats}</span></div>${plan.nearby.length ? `<div class="preference-chips">${plan.nearby.map(city => `<span class="chip">${esc(city)}</span>`).join('')}</div>` : ''}${plan.note ? `<div class="match-note">${esc(plan.note)}</div>` : ''}<div class="plan-card-actions"><button class="button button-secondary" data-action="edit-plan" data-plan="${esc(plan.id)}">Edit plan</button><button class="button button-danger" data-action="delete-plan" data-plan="${esc(plan.id)}">Remove</button></div></article>`;
}
function plansPage() {
  const mine = getMyPlans().sort((a, b) => a.date.localeCompare(b.date));
  return `<div class="page-heading"><div><div class="eyebrow">Your journeys</div><h1>My travel plans</h1><p class="subheading">Manage the plans you have shared with the Thapar community.</p></div><button class="button button-primary" data-page="create-plan">${icon('plus')} Create a plan</button></div>${mine.length ? `<div class="content-grid">${mine.map(planCard).join('')}</div>` : emptyState('No travel plans yet', 'Share where you are heading so other students can discover a potential match.', 'route', 'Create your first plan', 'create-plan')}`;
}
function planForm(plan = null) {
  return `<div class="page-heading"><div><div class="eyebrow">${plan ? 'Update your journey' : 'Let others find your route'}</div><h1>${plan ? 'Edit travel plan' : 'Create a travel plan'}</h1><p class="subheading">Share only the details fellow students need to discover a possible match.</p></div></div><form class="card form-card" id="plan-form" data-id="${plan ? esc(plan.id) : ''}"><div class="inline-alert">HomeBound is for discovering potential travel partners only. It does not arrange transport or verify travel plans.</div><div class="form-grid">
  <div class="field"><label for="plan-from">Starting point</label><input class="input" id="plan-from" name="from" value="${esc(plan?.from || 'TIET, Patiala')}" required maxlength="70"></div>
  <div class="field"><label for="plan-destination">Destination city</label><input class="input" id="plan-destination" name="destination" value="${esc(plan?.destination || '')}" required maxlength="50" placeholder="e.g. Jaipur"></div>
  <div class="field full"><label for="plan-nearby">Nearby destinations you are comfortable with</label><input class="input" id="plan-nearby" name="nearby" value="${esc((plan?.nearby || []).join(', '))}" maxlength="120" placeholder="e.g. Ajmer, Kishangarh"><span class="hint">Separate city names with commas.</span></div>
  <div class="field"><label for="plan-date">Travel date</label><input class="input" id="plan-date" name="date" type="date" min="${dateAfter(0)}" value="${esc(plan?.date || '')}" required></div>
  <div class="field"><label for="plan-time">Preferred departure time</label><select class="select" id="plan-time" name="time"><option ${plan?.time === 'Morning' ? 'selected' : ''}>Morning</option><option ${plan?.time === 'Afternoon' ? 'selected' : ''}>Afternoon</option><option ${plan?.time === 'Evening' ? 'selected' : ''}>Evening</option><option ${plan?.time === 'Anytime' ? 'selected' : ''}>Anytime</option></select></div>
  <div class="field"><label for="plan-seats">Potential travel partners</label><select class="select" id="plan-seats" name="seats">${[1, 2, 3, 4, 5].map(number => `<option value="${number}" ${Number(plan?.seats || 2) === number ? 'selected' : ''}>${number} student${number > 1 ? 's' : ''}</option>`).join('')}</select></div>
  <div class="field"><label class="checkbox-row"><input type="checkbox" name="flexible" ${plan?.flexible ? 'checked' : ''}> My date is flexible by a day</label><span class="hint">Only the date is shown publicly.</span></div>
  <div class="field full"><label for="plan-note">A short note (optional)</label><textarea class="textarea" id="plan-note" name="note" maxlength="180" placeholder="Share a little about the kind of journey you prefer.">${esc(plan?.note || '')}</textarea></div></div><div class="form-actions"><button type="button" class="button button-secondary" data-page="plans">Cancel</button><button class="button button-primary" type="submit">${icon('check')}${plan ? 'Save changes' : 'Publish travel plan'}</button></div></form>`;
}
function requestsPage() {
  const requests = requestTab === 'received' ? state.requests.filter(req => req.to === state.user.id) : state.requests.filter(req => req.from === state.user.id);
  return `<div class="page-heading"><div><div class="eyebrow">Make a connection</div><h1>Connection requests</h1><p class="subheading">Review requests and keep track of the students you have reached out to.</p></div></div><div class="tabs"><button class="tab-button ${requestTab === 'received' ? 'active' : ''}" data-action="request-tab" data-tab="received">Received (${state.requests.filter(req => req.to === state.user.id).length})</button><button class="tab-button ${requestTab === 'sent' ? 'active' : ''}" data-action="request-tab" data-tab="sent">Sent (${state.requests.filter(req => req.from === state.user.id).length})</button></div>${requests.length ? `<div class="stack">${requests.map(req => {
    const otherId = requestTab === 'received' ? req.from : req.to;
    const plan = state.plans.find(item => item.id === req.planId);
    const match = plan ? getMyPlans().map(myPlan => getMatch(myPlan, plan)).filter(Boolean).sort((a, b) => b.score - a.score)[0] : null;
    return `<article class="card request-card"><div class="avatar">${esc(initials(fullName(otherId)))}</div><div class="request-content"><strong>${esc(fullName(otherId))}</strong> <span class="muted-line">· ${req.status === 'pending' ? 'Awaiting response' : req.status === 'accepted' ? 'Connected' : 'Declined'}</span><p>${requestTab === 'received' ? `Would like to connect about ${esc(plan?.destination || 'a travel plan')}${plan ? ` on ${niceDate(plan.date)}` : ''}.` : `Your connection request for ${esc(plan?.destination || 'a travel plan')} is ${req.status}.`}${match ? ` ${esc(match.reason)}.` : ''}</p><div class="request-actions">${req.status === 'pending' && requestTab === 'received' ? `<button class="button button-primary" data-action="request-status" data-request="${esc(req.id)}" data-status="accepted">Accept</button><button class="button button-secondary" data-action="request-status" data-request="${esc(req.id)}" data-status="declined">Decline</button>` : ''}${req.status === 'accepted' ? `<button class="button button-soft" data-action="open-chat" data-person="${esc(otherId)}">${icon('message')} Message</button>` : ''}<span class="badge ${req.status === 'accepted' ? 'badge-accepted' : 'badge-pending'}">${esc(req.status[0].toUpperCase() + req.status.slice(1))}</span></div></div></article>`;
  }).join('')}</div>` : emptyState(requestTab === 'received' ? 'No connection requests yet' : 'No sent requests yet', requestTab === 'received' ? 'When a student reaches out about a travel plan, their request will appear here.' : 'Find a student whose travel plan looks like a good fit and send a connection request.', 'users', requestTab === 'sent' ? 'Find travel partners' : '', 'discover')}`;
}
function acceptedConnections() {
  return state.requests.filter(req => req.status === 'accepted' && (req.from === state.user.id || req.to === state.user.id)).map(req => req.from === state.user.id ? req.to : req.from);
}
function messagesPage() {
  const connections = [...new Set(acceptedConnections())];
  if (!activeConversation || !connections.includes(activeConversation)) activeConversation = connections[0] || '';
  if (!connections.length) return `<div class="page-heading"><div><div class="eyebrow">Your conversations</div><h1>Messages</h1><p class="subheading">Chat with students after you have accepted a connection request.</p></div></div>${emptyState('No connections to message yet', 'Accept a connection request to start a conversation. Messaging is limited to accepted connections.', 'message', 'View requests', 'requests')}`;
  const messages = state.messages.filter(item => item.connection === activeConversation).sort((a, b) => a.time - b.time);
  return `<div class="page-heading"><div><div class="eyebrow">Your conversations</div><h1>Messages</h1><p class="subheading">Keep your early travel conversations in one place.</p></div></div><section class="card message-layout"><div class="conversation-list"><div class="conversation-heading"><h3>Connections</h3></div>${connections.map(id => `<button class="conversation ${activeConversation === id ? 'active' : ''}" data-action="select-conversation" data-person="${esc(id)}"><div class="avatar small">${esc(initials(fullName(id)))}</div><div class="conversation-copy"><strong>${esc(fullName(id))}</strong><span>${esc(state.messages.filter(message => message.connection === id).slice(-1)[0]?.text || 'Start a conversation')}</span></div></button>`).join('')}</div><div class="chat-panel"><div class="chat-header"><div class="avatar small">${esc(initials(fullName(activeConversation)))}</div><div><strong>${esc(fullName(activeConversation))}</strong><span>Accepted connection · ${esc(person(activeConversation)?.branch || 'Thapar student')}</span></div></div><div class="chat-notice">Please do not share contact information or arrange private meetups here.</div><div class="chat-messages" id="chat-messages">${messages.map(message => `<div class="message ${message.from === state.user.id ? 'mine' : ''}">${esc(message.text)}<small>${message.from === state.user.id ? 'You' : esc(fullName(message.from))} · ${new Date(message.time).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</small></div>`).join('')}</div><form class="chat-form" id="message-form" data-person="${esc(activeConversation)}"><input class="input" name="message" maxlength="350" placeholder="Write a message..." required aria-label="Write a message"><button class="button button-primary" aria-label="Send message">${icon('send')}</button></form></div></section>`;
}
function profilePage() {
  const user = state.user;
  return `<div class="page-heading"><div><div class="eyebrow">Your campus profile</div><h1>My profile</h1><p class="subheading">Help fellow students get to know you before they connect.</p></div><button class="button button-secondary" data-action="edit-profile">Edit profile</button></div><section class="card profile-hero"><div class="avatar large">${esc(initials(user.name))}</div><div class="profile-hero-copy"><h2>${esc(user.name)}</h2><p>${esc(user.branch)} · ${esc(user.year)}</p>${user.verified ? verifiedBadge() : '<span class="badge badge-pending">Verification pending</span>'}</div><button class="button button-secondary" data-action="edit-profile">Edit profile</button></section><section class="card form-card"><div class="profile-details"><div class="detail-box"><span>Hometown</span><strong>${esc(user.hometown || 'Add your hometown')}</strong></div><div class="detail-box"><span>Nearby cities</span><strong>${esc((user.nearby || []).join(', ') || 'Not added')}</strong></div><div class="detail-box"><span>Languages</span><strong>${esc((user.languages || []).join(', ') || 'Not added')}</strong></div><div class="detail-box"><span>Travel preferences</span><strong>${esc((user.preferences || []).join(', ') || 'Not added')}</strong></div><div class="detail-box" style="grid-column:1/-1"><span>Introduction</span><strong>${esc(user.intro || 'Add a short introduction')}</strong></div><div class="detail-box"><span>Thapar verification</span><strong>${user.verified ? 'Verified Thapar Student' : 'Verification simulated in this prototype'}</strong></div></div><p class="verification-note">Verification is simulated for this frontend prototype. Your full Thapar ID and email are never shown on public profiles.</p></section>`;
}
function settingsPage() {
  return `<div class="page-heading"><div><div class="eyebrow">Make HomeBound yours</div><h1>Settings</h1><p class="subheading">Manage the appearance and demo account on this device.</p></div></div><div class="settings-list"><section class="card setting-row"><div><strong>Dark theme</strong><p>Use a softer dark palette throughout HomeBound.</p></div><input class="switch" type="checkbox" data-action="theme-switch" aria-label="Dark theme" ${state.preferences.theme === 'dark' ? 'checked' : ''}></section><section class="card setting-row"><div><strong>Demo notifications</strong><p>Show local prototype feedback when your plans change.</p></div><input class="switch" type="checkbox" data-action="notifications-switch" aria-label="Demo notifications" ${state.preferences.emailUpdates ? 'checked' : ''}></section><section class="card setting-row"><div><strong>Student verification</strong><p>Verification is simulated in this prototype. Email or student IDs are not shown publicly.</p></div><span class="badge ${state.user.verified ? 'badge-verified' : 'badge-pending'}">${state.user.verified ? 'Verified Thapar Student' : 'Not verified'}</span></section><section class="card setting-row"><div><strong>Travel responsibly</strong><p>HomeBound only helps students discover potential travel partners; it does not verify arrangements or provide transport. Verify plans through trusted university channels and consult trusted adults.</p></div>${icon('shield')}</section><section class="card setting-row"><div><strong>Demo account</strong><p>Sign out to return to the simulated login and registration flow.</p></div><button class="button button-secondary" data-action="logout">${icon('logout')} Sign out</button></section></div>`;
}
function editProfileForm() {
  const user = state.user;
  return `<div class="page-heading"><div><div class="eyebrow">Profile details</div><h1>Edit your profile</h1><p class="subheading">Your email and student ID remain private in this prototype.</p></div></div><form class="card form-card" id="profile-form"><div class="form-grid"><div class="field"><label for="profile-name">Student name</label><input class="input" id="profile-name" name="name" maxlength="60" required value="${esc(user.name)}"></div><div class="field"><label for="profile-branch">Branch</label><select class="select" id="profile-branch" name="branch">${branchOptions(user.branch)}</select></div><div class="field"><label for="profile-year">Year of study</label><select class="select" id="profile-year" name="year">${yearOptions(user.year)}</select></div><div class="field"><label for="profile-home">Hometown</label><input class="input" id="profile-home" name="hometown" maxlength="50" value="${esc(user.hometown)}" placeholder="e.g. Jaipur"></div><div class="field full"><label for="profile-nearby">Nearby cities</label><input class="input" id="profile-nearby" name="nearby" maxlength="120" value="${esc((user.nearby || []).join(', '))}" placeholder="Ajmer, Kishangarh"></div><div class="field full"><label for="profile-languages">Languages spoken</label><input class="input" id="profile-languages" name="languages" maxlength="100" value="${esc((user.languages || []).join(', '))}" placeholder="Hindi, English"></div><div class="field full"><label for="profile-preferences">Travel preferences</label><input class="input" id="profile-preferences" name="preferences" maxlength="120" value="${esc((user.preferences || []).join(', '))}" placeholder="Day travel, planned ahead"></div><div class="field full"><label for="profile-intro">Short introduction</label><textarea class="textarea" id="profile-intro" name="intro" maxlength="250">${esc(user.intro || '')}</textarea></div></div><div class="form-actions"><button type="button" class="button button-secondary" data-page="profile">Cancel</button><button class="button button-primary">Save profile</button></div></form>`;
}
function branchOptions(selected = '') {
  const branches = ['Computer Engineering', 'Computer Science and Engineering', 'Electrical Engineering', 'Electronics Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering', 'Other'];
  return branches.map(item => `<option ${selected === item ? 'selected' : ''}>${item}</option>`).join('');
}
function yearOptions(selected = '') {
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Other'];
  return years.map(item => `<option ${selected === item ? 'selected' : ''}>${item}</option>`).join('');
}
function authPage(mode = 'login') {
  const register = mode === 'register';
  return `<div class="auth-screen"><aside class="auth-aside"><div class="brand">${logo()}</div><div class="auth-aside-copy"><div class="eyebrow" style="color:#c9e6d7">Made for the Thapar community</div><h1>Good journeys start with good company.</h1><p>Discover fellow students heading to your hometown, around the same time as you.</p></div><div class="auth-aside-foot">A student discovery platform · Not a transport or ride-booking service</div></aside><main class="auth-main"><section class="auth-form-wrap"><h2>${register ? 'Join your travel circle' : 'Welcome back'}</h2><p>${register ? 'Create your student profile to start discovering potential travel partners.' : 'Sign in to find your people on the way home.'}</p><form id="auth-form" data-mode="${register ? 'register' : 'login'}"><div class="form-grid">${register ? `<div class="field full"><label for="auth-name">Student name</label><input class="input" id="auth-name" name="name" autocomplete="name" required maxlength="60" placeholder="Your full name"></div>` : ''}<div class="field full"><label for="auth-email">Thapar email</label><input class="input" id="auth-email" name="email" type="email" autocomplete="email" pattern=".+@(?:thapar\\.edu|thapar\\.edu\\.in)$" title="Use your Thapar student email address" required placeholder="you@thapar.edu"></div>${register ? `<div class="field full"><label for="auth-id">Thapar student ID</label><input class="input" id="auth-id" name="studentId" required maxlength="24" autocomplete="off" placeholder="Your student ID"><span class="hint">Kept private and never displayed publicly.</span></div><div class="field"><label for="auth-branch">Branch</label><select class="select" id="auth-branch" name="branch" required>${branchOptions()}</select></div><div class="field"><label for="auth-year">Year of study</label><select class="select" id="auth-year" name="year" required>${yearOptions()}</select></div>` : ''}</div><div class="verification-note">${register ? 'Mock verification: submitting a valid Thapar email simulates student verification for this demo. No email is sent.' : 'Prototype sign-in: use any Thapar student email. No password or backend is used.'}</div><button class="button button-primary" style="width:100%;margin-top:17px" type="submit">${register ? 'Create student profile' : 'Continue with Thapar email'} ${icon('arrow')}</button></form><div class="auth-switch">${register ? 'Already have a profile?' : 'New to HomeBound?'} <button data-action="auth-switch" data-mode="${register ? 'login' : 'register'}">${register ? 'Sign in' : 'Create an account'}</button><br><br><button data-action="demo-login">Explore with demo account</button></div></section></main></div>`;
}
function render() {
  document.documentElement.dataset.theme = state.preferences.theme || 'light';
  if (!state.user) { document.getElementById('app').innerHTML = authPage(); return; }
  const page = state.currentPage;
  let content = page === 'dashboard' ? dashboardPage()
    : page === 'discover' ? discoverPage()
    : page === 'plans' ? plansPage()
    : page === 'create-plan' ? planForm()
    : page.startsWith('edit-plan:') ? planForm(state.plans.find(plan => plan.id === page.slice(10)) || null)
    : page === 'requests' ? requestsPage()
    : page === 'messages' ? messagesPage()
    : page === 'profile' ? profilePage()
    : page === 'edit-profile' ? editProfileForm()
    : page === 'settings' ? settingsPage() : dashboardPage();
  document.getElementById('app').innerHTML = shell(content);
  if (page === 'messages') document.getElementById('chat-messages')?.scrollTo(0, 99999);
}
function goto(page) { state.currentPage = page; persist(); render(); window.scrollTo(0, 0); }
function formValues(form) { return Object.fromEntries(new FormData(form).entries()); }
function parseList(value) { return [...new Set(value.split(',').map(item => item.trim()).filter(Boolean))].slice(0, 10); }
function getRequest(from, to, planId) { return state.requests.find(req => req.from === from && req.to === to && req.planId === planId); }
function connect(planId) {
  const plan = state.plans.find(item => item.id === planId);
  if (!plan || plan.owner === state.user.id) return;
  const existing = getRequest(state.user.id, plan.owner, plan.id);
  if (existing && existing.status !== 'declined') return toast('A connection request already exists for this plan.');
  state.requests.push({ id: `r-${Date.now()}`, from: state.user.id, to: plan.owner, planId: plan.id, status: 'pending', created: Date.now() });
  persist(); render(); toast(`Connection request sent to ${fullName(plan.owner)}.`);
}
function showConfirm(title, message, confirmText, callback) {
  const root = document.createElement('div');
  root.className = 'modal-backdrop';
  root.innerHTML = `<section class="modal" role="dialog" aria-modal="true"><div class="modal-head"><h2>${esc(title)}</h2><button class="modal-close" aria-label="Close">×</button></div><p>${esc(message)}</p><div class="modal-actions"><button class="button button-secondary" data-modal-cancel>Cancel</button><button class="button button-danger" data-modal-confirm>${esc(confirmText)}</button></div></section>`;
  document.body.append(root);
  root.querySelector('.modal-close').onclick = () => root.remove();
  root.querySelector('[data-modal-cancel]').onclick = () => root.remove();
  root.querySelector('[data-modal-confirm]').onclick = () => { root.remove(); callback(); };
  root.onclick = event => { if (event.target === root) root.remove(); };
}
document.addEventListener('click', event => {
  const target = event.target.closest('button');
  if (!target) return;
  if (target.dataset.page) {
    const next = target.dataset.page;
    if (next === 'create-plan' || next === 'plans' || next === 'discover' || next === 'requests' || next === 'messages' || next === 'profile' || next === 'settings' || next === 'dashboard') goto(next);
    return;
  }
  switch (target.dataset.action) {
    case 'toggle-theme':
      state.preferences.theme = state.preferences.theme === 'dark' ? 'light' : 'dark'; persist(); render(); break;
    case 'connect': connect(target.dataset.plan); break;
    case 'discovery-tab': discoveryTab = target.dataset.tab; render(); break;
    case 'request-tab': requestTab = target.dataset.tab; render(); break;
    case 'clear-filters': discoveryQuery = ''; dateFilter = ''; render(); break;
    case 'edit-plan': goto(`edit-plan:${target.dataset.plan}`); break;
    case 'delete-plan':
      showConfirm('Remove travel plan?', 'This plan will no longer appear in discovery results. This cannot be undone.', 'Remove plan', () => { state.plans = state.plans.filter(plan => plan.id !== target.dataset.plan); state.requests = state.requests.filter(req => req.planId !== target.dataset.plan); persist(); render(); toast('Travel plan removed.'); });
      break;
    case 'request-status': {
      const request = state.requests.find(req => req.id === target.dataset.request);
      if (request) { request.status = target.dataset.status; persist(); render(); toast(target.dataset.status === 'accepted' ? 'Connection accepted. You can now message this student.' : 'Connection request declined.'); }
      break;
    }
    case 'open-chat': activeConversation = target.dataset.person; goto('messages'); break;
    case 'select-conversation': activeConversation = target.dataset.person; render(); break;
    case 'edit-profile': goto('edit-profile'); break;
    case 'auth-switch': document.getElementById('app').innerHTML = authPage(target.dataset.mode); break;
    case 'demo-login': {
      const saved = loadState();
      state = saved;
      if (!state.user) {
        state.user = state.lastUser || initialState().user;
        state.lastUser = null;
        if (!state.students.some(student => student.id === state.user.id)) state.students.push({ ...state.user });
      }
      persist(); render(); toast('Welcome to the HomeBound demo.'); break;
    }
    case 'logout':
      showConfirm('Sign out of demo?', 'Your demo data stays saved in this browser. You can return with the same account or create a student profile.', 'Sign out', () => { state.lastUser = state.user; state.user = null; persist(); document.getElementById('app').innerHTML = authPage(); });
      break;
  }
});
document.addEventListener('input', event => {
  if (event.target.id === 'discovery-search') {
    const start = event.target.selectionStart;
    discoveryQuery = event.target.value;
    render();
    const input = document.getElementById('discovery-search');
    input.focus(); input.setSelectionRange(start, start);
  }
  if (event.target.id === 'discovery-date') { dateFilter = event.target.value; render(); }
});
document.addEventListener('change', event => {
  if (event.target.matches('[data-action="theme-switch"]')) { state.preferences.theme = event.target.checked ? 'dark' : 'light'; persist(); render(); }
  if (event.target.matches('[data-action="notifications-switch"]')) { state.preferences.emailUpdates = event.target.checked; persist(); toast('Demo notification preference saved.'); }
});
document.addEventListener('submit', event => {
  const form = event.target;
  if (form.id === 'plan-form') {
    event.preventDefault();
    const values = formValues(form);
    const plan = { id: form.dataset.id || `p-${Date.now()}`, owner: state.user.id, from: values.from.trim(), destination: values.destination.trim(), nearby: parseList(values.nearby || ''), date: values.date, flexible: form.elements.flexible.checked, time: values.time, seats: Number(values.seats), note: (values.note || '').trim().slice(0, 180), created: Date.now() };
    if (plan.date < dateAfter(0) || !plan.destination) return toast('Choose a valid date and destination.');
    const index = state.plans.findIndex(item => item.id === plan.id);
    if (index >= 0) state.plans[index] = plan; else state.plans.push(plan);
    persist(); goto('plans'); toast(index >= 0 ? 'Travel plan updated.' : 'Your travel plan is now visible to students.');
  } else if (form.id === 'profile-form') {
    event.preventDefault();
    const values = formValues(form);
    Object.assign(state.user, { name: values.name.trim(), branch: values.branch, year: values.year, hometown: values.hometown.trim(), nearby: parseList(values.nearby || ''), languages: parseList(values.languages || ''), preferences: parseList(values.preferences || ''), intro: values.intro.trim() });
    const student = state.students.find(item => item.id === state.user.id);
    if (student) Object.assign(student, state.user);
    persist(); goto('profile'); toast('Your profile has been updated.');
  } else if (form.id === 'auth-form') {
    event.preventDefault();
    const values = formValues(form);
    if (form.dataset.mode === 'register') {
      const email = values.email.trim().toLowerCase();
      const studentId = values.studentId.trim();
      state.user = {
        id: `student-${Date.now()}`, name: values.name.trim(), email, studentId: `${studentId.slice(0, 2)}${'*'.repeat(Math.max(4, studentId.length - 2))}`,
        branch: values.branch, year: values.year, hometown: '', nearby: [], languages: [], intro: '', preferences: [],
        verified: true, isDemo: false
      };
      state.students.push({ ...state.user });
      state.lastUser = null;
      state.currentPage = 'profile';
      persist(); render(); toast('Mock verification complete. Add your hometown to build your profile.');
    } else {
      const email = values.email.trim().toLowerCase();
      if (!state.user) {
        if (state.lastUser && state.lastUser.email.toLowerCase() === email) state.user = state.lastUser;
        else { state = initialState(); state.user.email = email; }
      }
      state.lastUser = null;
      state.user.email = email;
      state.user.verified = true;
      persist(); render(); toast('Mock verification complete. Welcome to HomeBound.');
    }
  } else if (form.id === 'message-form') {
    event.preventDefault();
    const text = form.elements.message.value.trim();
    const recipient = form.dataset.person;
    if (!text || !acceptedConnections().includes(recipient)) return toast('Messaging is available to accepted connections only.');
    state.messages.push({ id: `m-${Date.now()}`, connection: recipient, from: state.user.id, text, time: Date.now() });
    persist(); render();
  }
});
render();
