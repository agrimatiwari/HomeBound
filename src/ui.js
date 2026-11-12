import { escapeHtml, getPublicStudentView, getAcceptedConnections, getConversationMessages } from './domain.js';
import { daysApart } from './matching.js';
import { dateAfter } from './storage.js';

const ICONS = {
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
  check: '<path d="m5 12 4 4L19 6"/>',
  shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/><path d="m9 12 2 2 4-4"/>',
  plane: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  arrow: '<path d="M5 12h14m-7-7 7 7-7 7"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
  moon: '<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>',
  spark: '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3z"/><path d="m19 14 1 2.5 2.5 1-2.5 1L19 21l-1-2.5-2.5-1 2.5-1z"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5m5 5H9"/>'
};

export const icon = (name, cls = '') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.spark}</svg>`;

export const initials = name =>
  String(name || 'TS').split(/\s+/).slice(0, 2).map(part => part[0] || '').join('').toUpperCase();

export const niceDate = value =>
  new Date(`${value}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

function publicPerson(state, id) {
  const raw = state.students.find(s => s.id === id) || (state.user?.id === id ? state.user : null);
  return getPublicStudentView(raw);
}

function personName(state, id) {
  return publicPerson(state, id)?.name || 'Thapar student';
}

function pageTitle(page) {
  return ({
    dashboard: 'Dashboard',
    discover: 'Find travel partners',
    plans: 'My travel plans',
    'create-plan': 'Create travel plan',
    requests: 'Connection requests',
    messages: 'Messages',
    profile: 'My profile',
    'edit-profile': 'Edit profile',
    settings: 'Settings'
  })[page] || (page.startsWith('edit-plan:') ? 'Edit travel plan' : 'Dashboard');
}

function navItem(currentPage, page, label, iconName, count = 0) {
  const active = currentPage === page || (page === 'plans' && (currentPage === 'create-plan' || currentPage.startsWith('edit-plan:')));
  return `<button type="button" class="nav-item ${active ? 'active' : ''}" data-page="${page}" ${active ? 'aria-current="page"' : ''} aria-label="${label}${count ? ` (${count} pending)` : ''}">${icon(iconName)}<span class="nav-label">${label}</span>${count ? `<span class="nav-count">${count}</span>` : ''}</button>`;
}

function logo() {
  return `<div class="brand-mark">${icon('route')}</div><div class="brand-copy"><div class="brand-name">HomeBound</div><div class="brand-caption">Your campus travel circle</div></div>`;
}

function verifiedBadge() {
  return `<span class="badge badge-verified">${icon('check')} Verified Thapar student (simulated)</span>`;
}

function statusBadge(status) {
  const map = {
    active: { cls: 'badge-verified', label: 'Status: Active' },
    paused: { cls: 'badge-pending', label: 'Status: Paused' },
    completed: { cls: 'badge-nearby', label: 'Status: Completed' }
  };
  const info = map[status] || map.active;
  return `<span class="badge ${info.cls}">${info.label}</span>`;
}

export function emptyState(title, text, glyph = 'spark', buttonLabel = '', buttonPage = '') {
  return `<div class="card empty-state"><div class="empty-icon">${icon(glyph)}</div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p>${buttonLabel ? `<button type="button" class="button button-primary" data-page="${escapeHtml(buttonPage)}">${icon('plus')}${escapeHtml(buttonLabel)}</button>` : ''}</div>`;
}

export function matchCard(state, plan, match, showConnect = true) {
  const student = publicPerson(state, plan.owner);
  if (!student) return '';

  const request = state.requests.find(req => req.from === state.user.id && req.to === plan.owner && req.planId === plan.id);
  const isDisabled = request && (request.status === 'pending' || request.status === 'accepted');
  const btnText = request
    ? (request.status === 'pending' ? 'Request Pending' : request.status === 'accepted' ? 'Connected' : 'Connect Again')
    : 'Connect';

  return `<article class="card match-card">
    <div class="match-top">
      <div class="avatar" aria-hidden="true">${escapeHtml(initials(student.name))}</div>
      <div class="match-person">
        <strong>${escapeHtml(student.name)}</strong>
        <span class="muted-line">${escapeHtml(student.branch)} · ${escapeHtml(student.year)}</span>
        <div class="match-badges">
          ${verifiedBadge()}
          ${match ? match.labels.map(lbl => `<span class="badge ${lbl.includes('Exact') || lbl.includes('Same Travel') ? 'badge-exact' : 'badge-nearby'}">${escapeHtml(lbl)}</span>`).join('') : ''}
        </div>
      </div>
    </div>
    <div class="match-route">
      <div class="route-point"><span>Travelling from</span><strong>${escapeHtml(plan.from)}</strong></div>
      <span class="route-arrow" aria-hidden="true">${icon('arrow')}</span>
      <div class="route-point"><span>Destination</span><strong>${escapeHtml(plan.destination)}</strong></div>
    </div>
    <div class="match-details">
      <span class="detail-item">${icon('calendar')}${niceDate(plan.date)}${plan.flexible ? ' · Flexible (±1d)' : ' · Fixed date'}</span>
      <span class="detail-item">${icon('clock')}${escapeHtml(plan.time)}</span>
      <span class="detail-item">${icon('users')}Looking for ${plan.seats}</span>
    </div>
    ${match ? `<div class="match-note"><strong>Why this matches:</strong> ${escapeHtml(match.reason)}.<br><span class="disclaimer-inline">Note: A match does not verify identity or guarantee travel safety—confirm independently via trusted campus channels.</span></div>` : `<div class="preference-chips">${student.preferences.map(item => `<span class="chip">${escapeHtml(item)}</span>`).join('')}</div>`}
    <div class="match-actions">
      <span class="muted-line">${escapeHtml(student.hometown || 'Hometown unlisted')} · ${student.languages.slice(0, 2).map(escapeHtml).join(', ') || 'Languages unlisted'}</span>
      ${showConnect ? `<button type="button" class="button ${isDisabled ? 'button-secondary' : 'button-primary'}" data-action="connect" data-plan="${escapeHtml(plan.id)}" ${isDisabled ? 'disabled' : ''}>${isDisabled ? btnText : `${icon('users')} ${btnText}`}</button>` : ''}
    </div>
  </article>`;
}

export function dashboardView(state, matches) {
  const mine = state.plans.filter(p => p.owner === state.user.id);
  const activeMine = mine.filter(p => (p.status || 'active') === 'active');
  const pendingCount = state.requests.filter(r => r.to === state.user.id && r.status === 'pending').length;
  const topMatches = matches.slice(0, 2);
  const upcoming = activeMine.filter(p => p.date >= dateAfter(0)).sort((a, b) => a.date.localeCompare(b.date))[0];

  return `<section class="welcome-panel">
      <div class="welcome-copy">
        <div class="eyebrow">Good to have you here</div>
        <h1>Where are you headed, ${escapeHtml(state.user.name.split(' ')[0])}?</h1>
        <p>Discover fellow Thapar students heading your way around similar dates.</p>
        <button type="button" class="button" data-page="create-plan">${icon('plus')} Share a travel plan</button>
      </div>
      <div class="welcome-art" aria-hidden="true"><div class="sun"></div><div class="hill"></div></div>
    </section>
    <div class="stats-grid">
      <div class="card stat-card"><div class="stat-icon">${icon('route')}</div><div><div class="stat-number">${activeMine.length}</div><div class="stat-label">Active travel plans</div></div></div>
      <div class="card stat-card"><div class="stat-icon orange">${icon('spark')}</div><div><div class="stat-number">${matches.length}</div><div class="stat-label">Compatible matches</div></div></div>
      <div class="card stat-card"><div class="stat-icon blue">${icon('users')}</div><div><div class="stat-number">${pendingCount}</div><div class="stat-label">Pending requests</div></div></div>
    </div>
    <div class="dashboard-grid">
      <section aria-labelledby="dash-matches-heading">
        <div class="section-row"><h2 id="dash-matches-heading">Matches for your plans</h2><button type="button" class="text-link" data-page="discover">See all matches →</button></div>
        <div class="stack">${topMatches.length ? topMatches.map(item => matchCard(state, item.plan, item.match)).join('') : emptyState('No compatible matches yet', 'Add an active travel plan and HomeBound will look for fellow students heading to the same or nearby destination.', 'plus', 'Create a plan', 'create-plan')}</div>
      </section>
      <aside aria-labelledby="dash-next-heading">
        <div class="section-row"><h2 id="dash-next-heading">Your next trip</h2><button type="button" class="text-link" data-page="plans">View plans</button></div>
        ${upcoming ? `<article class="card upcoming-card"><div class="upcoming-top"><div class="date-block"><span>${new Date(`${upcoming.date}T12:00:00`).toLocaleDateString('en-IN', { month: 'short' })}</span><strong>${new Date(`${upcoming.date}T12:00:00`).getDate()}</strong></div><div class="upcoming-dest"><span>Next active plan</span><strong>${escapeHtml(upcoming.destination)}</strong><span>${escapeHtml(upcoming.from)}</span></div>${icon('plane')}</div><div class="upcoming-meta"><span>${upcoming.flexible ? 'Date is flexible (±1d)' : 'Fixed date'}</span><span>${escapeHtml(upcoming.time)}</span></div></article>` : emptyState('No upcoming active plans', 'Create or activate a plan to find students with similar travel dates.', 'calendar', 'Create a plan', 'create-plan')}
        <div class="safety-banner" role="note">${icon('shield')}<span><strong>Safety &amp; Verification Notice</strong><br>HomeBound is a student travel-partner discovery prototype—not a cab-booking or transport service. Matches do not guarantee identity or safety. Always verify arrangements independently through trusted university channels and involve trusted adults.</span></div>
      </aside>
    </div>`;
}

export function discoverView(state, allMatches, uiState) {
  const { discoveryTab, discoveryQuery, dateFilter } = uiState;
  const activeOtherPlans = state.plans.filter(p => p.owner !== state.user.id && (p.status || 'active') === 'active');
  const matchMap = new Map(allMatches.map(m => [m.plan.id, m.match]));
  const hasActiveOwnPlans = state.plans.some(p => p.owner === state.user.id && (p.status || 'active') === 'active');

  const filtered = activeOtherPlans
    .map(plan => ({ plan, match: matchMap.get(plan.id) || null }))
    .filter(item => (discoveryTab === 'matches' ? Boolean(item.match) : true))
    .filter(item => !dateFilter || item.plan.date === dateFilter || (item.plan.flexible && daysApart(item.plan.date, dateFilter) <= 1))
    .filter(item => {
      if (!discoveryQuery) return true;
      const q = discoveryQuery.toLowerCase();
      const student = publicPerson(state, item.plan.owner);
      const haystack = [item.plan.destination, item.plan.from, ...(item.plan.nearby || []), student?.hometown, student?.name].join(' ').toLowerCase();
      return haystack.includes(q);
    })
    .sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0) || a.plan.date.localeCompare(b.plan.date));

  return `<div class="page-heading">
      <div><div class="eyebrow">Find your travel circle</div><h1>Find travel partners</h1><p class="subheading">Discover fellow Thapar students heading to the same or nearby destinations.</p></div>
      <button type="button" class="button button-primary" data-page="create-plan">${icon('plus')} Add your plan</button>
    </div>
    <div class="tabs" role="tablist" aria-label="Discovery filter tabs">
      <button type="button" role="tab" aria-selected="${discoveryTab === 'matches'}" class="tab-button ${discoveryTab === 'matches' ? 'active' : ''}" data-action="discovery-tab" data-tab="matches">Matches for me (${allMatches.length})</button>
      <button type="button" role="tab" aria-selected="${discoveryTab === 'all'}" class="tab-button ${discoveryTab === 'all' ? 'active' : ''}" data-action="discovery-tab" data-tab="all">All active plans (${activeOtherPlans.length})</button>
    </div>
    <div class="card toolbar">
      <label class="search-box" for="discovery-search"><span class="sr-only">Search by city, route, or student</span>${icon('search')}<input class="input" type="search" id="discovery-search" placeholder="Search city, nearby stop, or student..." value="${escapeHtml(discoveryQuery)}"></label>
      <label for="discovery-date" class="sr-only">Filter by travel date</label>
      <input class="input select" type="date" id="discovery-date" value="${escapeHtml(dateFilter)}">
      <button type="button" class="button button-secondary" data-action="clear-filters">Clear filters</button>
    </div>
    ${filtered.length ? `<div class="content-grid">${filtered.map(item => matchCard(state, item.plan, item.match)).join('')}</div>` : emptyState('No matching travel plans found', discoveryTab === 'matches' && !hasActiveOwnPlans ? 'Create or activate a travel plan to see compatible students here.' : 'Try adjusting your search keywords or date filter, or browse all active plans.', 'search', discoveryTab === 'matches' && !hasActiveOwnPlans ? 'Create a plan' : '', discoveryTab === 'matches' && !hasActiveOwnPlans ? 'create-plan' : '')}`;
}

export function plansView(state) {
  const mine = state.plans.filter(p => p.owner === state.user.id).sort((a, b) => a.date.localeCompare(b.date));
  return `<div class="page-heading">
      <div><div class="eyebrow">Your journeys</div><h1>My travel plans</h1><p class="subheading">Manage your shared routes, pause listings, or mark completed trips.</p></div>
      <button type="button" class="button button-primary" data-page="create-plan">${icon('plus')} Create a plan</button>
    </div>
    ${mine.length ? `<div class="content-grid">${mine.map(plan => {
      const status = plan.status || 'active';
      return `<article class="card plan-card">
        <div class="upcoming-top">
          <div class="date-block"><span>${new Date(`${plan.date}T12:00:00`).toLocaleDateString('en-IN', { month: 'short' })}</span><strong>${new Date(`${plan.date}T12:00:00`).getDate()}</strong></div>
          <div class="upcoming-dest"><span>${plan.flexible ? 'Flexible date (±1d)' : 'Fixed travel date'}</span><strong>${escapeHtml(plan.destination)}</strong><span>From ${escapeHtml(plan.from)}</span></div>
          ${statusBadge(status)}
        </div>
        <div class="match-details"><span class="detail-item">${icon('clock')}${escapeHtml(plan.time)}</span><span class="detail-item">${icon('users')}Looking for ${plan.seats}</span></div>
        ${plan.nearby.length ? `<div class="preference-chips">${plan.nearby.map(city => `<span class="chip">${escapeHtml(city)}</span>`).join('')}</div>` : ''}
        ${plan.note ? `<div class="match-note">${escapeHtml(plan.note)}</div>` : ''}
        <div class="plan-card-actions">
          <button type="button" class="button button-secondary" data-action="edit-plan" data-plan="${escapeHtml(plan.id)}">Edit</button>
          ${status === 'active' ? `<button type="button" class="button button-secondary" data-action="plan-status" data-status="paused" data-plan="${escapeHtml(plan.id)}">Pause</button>` : ''}
          ${status === 'paused' ? `<button type="button" class="button button-soft" data-action="plan-status" data-status="active" data-plan="${escapeHtml(plan.id)}">Reactivate</button>` : ''}
          ${status !== 'completed' ? `<button type="button" class="button button-secondary" data-action="plan-status" data-status="completed" data-plan="${escapeHtml(plan.id)}">Mark completed</button>` : ''}
          <button type="button" class="button button-danger" data-action="delete-plan" data-plan="${escapeHtml(plan.id)}">Delete</button>
        </div>
      </article>`;
    }).join('')}</div>` : emptyState('No travel plans yet', 'Share where you are heading so fellow students can discover a potential match.', 'route', 'Create your first plan', 'create-plan')}`;
}

export function planFormView(plan = null) {
  return `<div class="page-heading"><div><div class="eyebrow">${plan ? 'Update your journey' : 'Let others find your route'}</div><h1>${plan ? 'Edit travel plan' : 'Create a travel plan'}</h1><p class="subheading">Share only high-level route details—never share private phone numbers or exact addresses.</p></div></div>
  <form class="card form-card" id="plan-form" data-id="${plan ? escapeHtml(plan.id) : ''}" novalidate>
    <div class="inline-alert">HomeBound helps students discover potential travel partners. It does not book cabs, handle payments, or verify travel arrangements.</div>
    <div id="plan-form-error" class="form-error" role="alert" hidden></div>
    <div class="form-grid">
      <div class="field"><label for="plan-from">Starting point *</label><input class="input" id="plan-from" name="from" value="${escapeHtml(plan?.from || 'TIET, Patiala')}" required maxlength="70"></div>
      <div class="field"><label for="plan-destination">Destination city *</label><input class="input" id="plan-destination" name="destination" value="${escapeHtml(plan?.destination || '')}" required maxlength="50" placeholder="e.g. Jaipur"></div>
      <div class="field full"><label for="plan-nearby">Nearby or compatible destinations</label><input class="input" id="plan-nearby" name="nearby" value="${escapeHtml((plan?.nearby || []).join(', '))}" maxlength="120" placeholder="e.g. Ajmer, Kishangarh"><span class="hint">Separate city names with commas.</span></div>
      <div class="field"><label for="plan-date">Travel date *</label><input class="input" id="plan-date" name="date" type="date" min="${dateAfter(0)}" value="${escapeHtml(plan?.date || '')}" required></div>
      <div class="field"><label for="plan-time">Preferred departure time</label><select class="select" id="plan-time" name="time">${['Morning', 'Afternoon', 'Evening', 'Anytime'].map(t => `<option value="${t}" ${plan?.time === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
      <div class="field"><label for="plan-seats">Interested student companions</label><select class="select" id="plan-seats" name="seats">${[1, 2, 3, 4, 5].map(n => `<option value="${n}" ${Number(plan?.seats || 2) === n ? 'selected' : ''}>${n} student${n > 1 ? 's' : ''}</option>`).join('')}</select></div>
      <div class="field"><label class="checkbox-row" for="plan-flexible"><input type="checkbox" id="plan-flexible" name="flexible" ${plan?.flexible ? 'checked' : ''}> My date is flexible by ±1 day</label><span class="hint">Allows matching with students travelling a day earlier or later.</span></div>
      <div class="field full"><label for="plan-note">Travel note (optional)</label><textarea class="textarea" id="plan-note" name="note" maxlength="180" placeholder="Share general travel preferences (e.g. daytime travel, light luggage).">${escapeHtml(plan?.note || '')}</textarea></div>
    </div>
    <div class="form-actions">
      <button type="button" class="button button-secondary" data-page="plans">Cancel</button>
      <button class="button button-primary" type="submit">${icon('check')}${plan ? 'Save changes' : 'Publish travel plan'}</button>
    </div>
  </form>`;
}

export function requestsView(state, uiState) {
  const { requestTab } = uiState;
  const received = state.requests.filter(r => r.to === state.user.id);
  const sent = state.requests.filter(r => r.from === state.user.id);
  const list = requestTab === 'received' ? received : sent;

  const statusLabels = {
    pending: { cls: 'badge-pending', label: 'Status: Pending' },
    accepted: { cls: 'badge-accepted', label: 'Status: Accepted' },
    declined: { cls: 'badge-danger-soft', label: 'Status: Rejected' },
    cancelled: { cls: 'badge-neutral', label: 'Status: Cancelled' }
  };

  return `<div class="page-heading"><div><div class="eyebrow">Make a connection</div><h1>Connection requests</h1><p class="subheading">Review incoming invitations and manage requests you have sent.</p></div></div>
    <div class="tabs" role="tablist" aria-label="Connection request tabs">
      <button type="button" role="tab" aria-selected="${requestTab === 'received'}" class="tab-button ${requestTab === 'received' ? 'active' : ''}" data-action="request-tab" data-tab="received">Received (${received.length})</button>
      <button type="button" role="tab" aria-selected="${requestTab === 'sent'}" class="tab-button ${requestTab === 'sent' ? 'active' : ''}" data-action="request-tab" data-tab="sent">Sent (${sent.length})</button>
    </div>
    ${list.length ? `<div class="stack">${list.map(req => {
      const otherId = requestTab === 'received' ? req.from : req.to;
      const plan = state.plans.find(p => p.id === req.planId);
      const badge = statusLabels[req.status] || statusLabels.pending;
      return `<article class="card request-card">
        <div class="avatar" aria-hidden="true">${escapeHtml(initials(personName(state, otherId)))}</div>
        <div class="request-content">
          <strong>${escapeHtml(personName(state, otherId))}</strong>
          <p>${requestTab === 'received'
            ? `Requested to connect regarding ${escapeHtml(plan?.destination || 'a travel plan')}${plan ? ` on ${niceDate(plan.date)}` : ''}.`
            : `Connection request to ${escapeHtml(personName(state, otherId))} for ${escapeHtml(plan?.destination || 'a travel plan')}${plan ? ` (${niceDate(plan.date)})` : ''}.`}</p>
          <div class="request-actions">
            ${req.status === 'pending' && requestTab === 'received' && req.to === state.user.id ? `<button type="button" class="button button-primary" data-action="request-status" data-request="${escapeHtml(req.id)}" data-status="accepted">Accept</button><button type="button" class="button button-secondary" data-action="request-status" data-request="${escapeHtml(req.id)}" data-status="declined">Reject</button>` : ''}
            ${req.status === 'pending' && requestTab === 'sent' && req.from === state.user.id ? `<button type="button" class="button button-danger" data-action="cancel-request" data-request="${escapeHtml(req.id)}">Cancel request</button>` : ''}
            ${req.status === 'accepted' ? `<button type="button" class="button button-soft" data-action="open-chat" data-person="${escapeHtml(otherId)}">${icon('message')} Open messages</button>` : ''}
            <span class="badge ${badge.cls}">${badge.label}</span>
          </div>
        </div>
      </article>`;
    }).join('')}</div>` : emptyState(requestTab === 'received' ? 'No connection requests yet' : 'No sent requests yet', requestTab === 'received' ? 'When another student sends a connection request for your travel plan, it will appear here.' : 'Browse active travel plans and send a connection request to explore travelling together.', 'users', requestTab === 'sent' ? 'Find travel partners' : '', 'discover')}`;
}

export function messagesView(state, uiState) {
  const connections = getAcceptedConnections(state, state.user.id);
  let activeId = uiState.activeConversation;
  if (!activeId || !connections.includes(activeId)) {
    activeId = connections[0] || '';
    uiState.activeConversation = activeId;
  }

  if (!connections.length) {
    return `<div class="page-heading"><div><div class="eyebrow">Your conversations</div><h1>Messages</h1><p class="subheading">Prototype messaging is available once a connection request is accepted.</p></div></div>
      ${emptyState('No accepted connections yet', 'Accept a connection request—or wait for a fellow student to accept yours—to start a prototype conversation.', 'message', 'View requests', 'requests')}`;
  }

  const msgs = getConversationMessages(state, state.user.id, activeId);
  const partner = publicPerson(state, activeId);

  return `<div class="page-heading"><div><div class="eyebrow">Prototype messaging</div><h1>Messages</h1><p class="subheading">Coordinate initial travel details with your accepted connections.</p></div></div>
    <section class="card message-layout" aria-label="Student conversations">
      <div class="conversation-list" role="tablist" aria-label="Connected students">
        <div class="conversation-heading"><h3>Connections (${connections.length})</h3></div>
        ${connections.map(id => {
          const thread = getConversationMessages(state, state.user.id, id);
          const lastMsg = thread[thread.length - 1];
          return `<button type="button" role="tab" aria-selected="${activeId === id}" class="conversation ${activeId === id ? 'active' : ''}" data-action="select-conversation" data-person="${escapeHtml(id)}">
            <div class="avatar small" aria-hidden="true">${escapeHtml(initials(personName(state, id)))}</div>
            <div class="conversation-copy"><strong>${escapeHtml(personName(state, id))}</strong><span>${escapeHtml(lastMsg?.text || 'No messages yet — say hello!')}</span></div>
          </button>`;
        }).join('')}
      </div>
      <div class="chat-panel">
        <div class="chat-header">
          <div class="avatar small" aria-hidden="true">${escapeHtml(initials(personName(state, activeId)))}</div>
          <div><strong>${escapeHtml(personName(state, activeId))}</strong><span>Accepted connection · ${escapeHtml(partner?.branch || 'Thapar student')}</span></div>
        </div>
        <div class="chat-notice" role="note">Prototype demonstration chat — not an encrypted or production messaging service. Verify plans via official campus channels and avoid sharing sensitive personal details.</div>
        <div class="chat-messages" id="chat-messages">
          ${msgs.length ? msgs.map(m => {
            const isMine = m.from === state.user.id;
            const senderLabel = isMine ? 'You' : personName(state, m.from);
            const recipientLabel = isMine ? personName(state, activeId) : 'You';
            return `<div class="message ${isMine ? 'mine' : ''}">
              <div class="message-meta"><strong>${escapeHtml(senderLabel)}</strong> → ${escapeHtml(recipientLabel)}</div>
              <div>${escapeHtml(m.text)}</div>
              <small>${new Date(m.time).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</small>
            </div>`;
          }).join('') : `<div class="chat-empty">No messages with ${escapeHtml(personName(state, activeId))} yet. Send a greeting below to start comparing travel plans.</div>`}
        </div>
        <form class="chat-form" id="message-form" data-person="${escapeHtml(activeId)}">
          <label for="chat-input" class="sr-only">Message to ${escapeHtml(personName(state, activeId))}</label>
          <input class="input" id="chat-input" name="message" maxlength="350" placeholder="Write a message to ${escapeHtml(personName(state, activeId))}..." required>
          <button type="submit" class="button button-primary" aria-label="Send message">${icon('send')} Send</button>
        </form>
      </div>
    </section>`;
}

export function profileView(state) {
  const user = state.user;
  return `<div class="page-heading"><div><div class="eyebrow">Your campus profile</div><h1>My profile</h1><p class="subheading">Control what fellow Thapar students see on your public discovery card.</p></div><button type="button" class="button button-secondary" data-action="edit-profile">Edit profile</button></div>
    <section class="card profile-hero">
      <div class="avatar large" aria-hidden="true">${escapeHtml(initials(user.name))}</div>
      <div class="profile-hero-copy"><h2>${escapeHtml(user.name)}</h2><p>${escapeHtml(user.branch)} · ${escapeHtml(user.year)}</p>${user.verified ? verifiedBadge() : '<span class="badge badge-pending">Verification pending</span>'}</div>
    </section>
    <section class="card form-card">
      <div class="profile-details">
        <div class="detail-box"><span>Hometown</span><strong>${escapeHtml(user.hometown || 'Add your hometown')}</strong></div>
        <div class="detail-box"><span>Nearby cities</span><strong>${escapeHtml((user.nearby || []).join(', ') || 'Not added')}</strong></div>
        <div class="detail-box"><span>Languages</span><strong>${escapeHtml((user.languages || []).join(', ') || 'Not added')}</strong></div>
        <div class="detail-box"><span>Travel preferences</span><strong>${escapeHtml((user.preferences || []).join(', ') || 'Not added')}</strong></div>
        <div class="detail-box full-box"><span>Introduction</span><strong>${escapeHtml(user.intro || 'Add a short introduction')}</strong></div>
        <div class="detail-box"><span>Account privacy</span><strong>Student ID (${escapeHtml(user.studentId || '****')}) &amp; email are hidden from public profiles</strong></div>
        <div class="detail-box"><span>Thapar verification</span><strong>${user.verified ? 'Verified Thapar Student (Simulated Prototype)' : 'Pending'}</strong></div>
      </div>
      <p class="verification-note">Privacy &amp; Prototype Notice: Student verification and access controls in HomeBound are frontend-only demonstrations. Full Thapar IDs, emails, phone numbers, and residential addresses are never displayed publicly.</p>
    </section>`;
}

export function editProfileView(state) {
  const user = state.user;
  const branches = ['Computer Engineering', 'Computer Science and Engineering', 'Electrical Engineering', 'Electronics Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering', 'Other'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Other'];

  return `<div class="page-heading"><div><div class="eyebrow">Profile details</div><h1>Edit your profile</h1><p class="subheading">Your email and student ID remain hidden from public discovery cards.</p></div></div>
    <form class="card form-card" id="profile-form" novalidate>
      <div id="profile-form-error" class="form-error" role="alert" hidden></div>
      <div class="form-grid">
        <div class="field"><label for="profile-name">Student name *</label><input class="input" id="profile-name" name="name" maxlength="60" required value="${escapeHtml(user.name)}"></div>
        <div class="field"><label for="profile-branch">Branch</label><select class="select" id="profile-branch" name="branch">${branches.map(b => `<option ${user.branch === b ? 'selected' : ''}>${b}</option>`).join('')}</select></div>
        <div class="field"><label for="profile-year">Year of study</label><select class="select" id="profile-year" name="year">${years.map(y => `<option ${user.year === y ? 'selected' : ''}>${y}</option>`).join('')}</select></div>
        <div class="field"><label for="profile-home">Hometown</label><input class="input" id="profile-home" name="hometown" maxlength="50" value="${escapeHtml(user.hometown)}" placeholder="e.g. Jaipur"></div>
        <div class="field full"><label for="profile-nearby">Nearby cities</label><input class="input" id="profile-nearby" name="nearby" maxlength="120" value="${escapeHtml((user.nearby || []).join(', '))}" placeholder="Ajmer, Kishangarh"></div>
        <div class="field full"><label for="profile-languages">Languages spoken</label><input class="input" id="profile-languages" name="languages" maxlength="100" value="${escapeHtml((user.languages || []).join(', '))}" placeholder="Hindi, English"></div>
        <div class="field full"><label for="profile-preferences">Travel preferences</label><input class="input" id="profile-preferences" name="preferences" maxlength="120" value="${escapeHtml((user.preferences || []).join(', '))}" placeholder="Day travel, Planned ahead"></div>
        <div class="field full"><label for="profile-intro">Short introduction</label><textarea class="textarea" id="profile-intro" name="intro" maxlength="250">${escapeHtml(user.intro || '')}</textarea></div>
      </div>
      <div class="form-actions">
        <button type="button" class="button button-secondary" data-page="profile">Cancel</button>
        <button type="submit" class="button button-primary">Save profile</button>
      </div>
    </form>`;
}

export function settingsView(state) {
  return `<div class="page-heading"><div><div class="eyebrow">Make HomeBound yours</div><h1>Settings</h1><p class="subheading">Manage display preferences and review prototype safety disclosures.</p></div></div>
    <div class="settings-list">
      <section class="card setting-row"><div><strong>Dark theme</strong><p>Use a softer dark palette throughout HomeBound.</p></div><input class="switch" type="checkbox" data-action="theme-switch" aria-label="Dark theme" ${state.preferences.theme === 'dark' ? 'checked' : ''}></section>
      <section class="card setting-row"><div><strong>Prototype feedback toasts</strong><p>Show confirmation messages when travel plans or requests change.</p></div><input class="switch" type="checkbox" data-action="notifications-switch" aria-label="Prototype feedback toasts" ${state.preferences.emailUpdates ? 'checked' : ''}></section>
      <section class="card setting-row"><div><strong>Student verification (Simulated)</strong><p>Frontend demonstration only—not production authentication. Full IDs and private contact info are never exposed publicly.</p></div><span class="badge ${state.user.verified ? 'badge-verified' : 'badge-pending'}">${state.user.verified ? 'Simulated Verified' : 'Not verified'}</span></section>
      <section class="card setting-row"><div><strong>Travel responsibly</strong><p>HomeBound only helps students discover potential travel partners; it does not book cabs, verify identities, or guarantee safety. Verify plans through trusted university channels and involve trusted adults.</p></div>${icon('shield')}</section>
      <section class="card setting-row"><div><strong>Demo session</strong><p>Sign out to test the simulated Thapar email sign-in or registration flow.</p></div><button type="button" class="button button-secondary" data-action="logout">${icon('logout')} Sign out</button></section>
    </div>`;
}

export function authView(mode = 'login') {
  const register = mode === 'register';
  const branches = ['Computer Engineering', 'Computer Science and Engineering', 'Electrical Engineering', 'Electronics Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering', 'Other'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Other'];

  return `<div class="auth-screen">
    <aside class="auth-aside">
      <div class="brand">${logo()}</div>
      <div class="auth-aside-copy">
        <div class="eyebrow" style="color:#c9e6d7">Made for the Thapar community</div>
        <h1>Good journeys start with good company.</h1>
        <p>Discover fellow students heading to your hometown around the same time.</p>
      </div>
      <div class="auth-aside-foot">Student travel-partner discovery prototype · Not a cab-booking or transport service</div>
    </aside>
    <main id="main-content" class="auth-main">
      <section class="auth-form-wrap">
        <h2>${register ? 'Join your travel circle' : 'Welcome back'}</h2>
        <p>${register ? 'Create your student profile to explore compatible travel partners.' : 'Sign in with your Thapar student email to continue.'}</p>
        <form id="auth-form" data-mode="${register ? 'register' : 'login'}" novalidate>
          <div id="auth-form-error" class="form-error" role="alert" hidden></div>
          <div class="form-grid">
            ${register ? `<div class="field full"><label for="auth-name">Student name *</label><input class="input" id="auth-name" name="name" autocomplete="name" required maxlength="60" placeholder="Your full name"></div>` : ''}
            <div class="field full"><label for="auth-email">Thapar email *</label><input class="input" id="auth-email" name="email" type="email" autocomplete="email" required placeholder="you@thapar.edu"></div>
            ${register ? `<div class="field full"><label for="auth-id">Thapar student ID *</label><input class="input" id="auth-id" name="studentId" required maxlength="24" autocomplete="off" placeholder="e.g. 102303456"><span class="hint">Masked immediately and never displayed publicly.</span></div>
            <div class="field"><label for="auth-branch">Branch</label><select class="select" id="auth-branch" name="branch">${branches.map(b => `<option>${b}</option>`).join('')}</select></div>
            <div class="field"><label for="auth-year">Year of study</label><select class="select" id="auth-year" name="year">${years.map(y => `<option>${y}</option>`).join('')}</select></div>` : ''}
          </div>
          <div class="verification-note"><strong>Prototype Disclosure:</strong> Frontend-only simulated authentication for demonstration purposes—not production-grade security. No passwords or tokens are stored.</div>
          <button class="button button-primary" style="width:100%;margin-top:17px" type="submit">${register ? 'Create student profile' : 'Continue with Thapar email'} ${icon('arrow')}</button>
        </form>
        <div class="auth-switch">${register ? 'Already have a profile?' : 'New to HomeBound?'} <button type="button" data-action="auth-switch" data-mode="${register ? 'login' : 'register'}">${register ? 'Sign in' : 'Create an account'}</button><br><br><button type="button" data-action="demo-login">Explore with pre-filled demo account</button></div>
      </section>
    </main>
  </div>`;
}

export function appShell(state, content) {
  const pendingCount = state.requests.filter(r => r.to === state.user.id && r.status === 'pending').length;
  return `<div class="app-shell">
    <aside class="sidebar" aria-label="Primary navigation">
      <div class="brand">${logo()}</div>
      <div class="nav-caption">Workspace</div>
      <nav class="nav-list">
        ${navItem(state.currentPage, 'dashboard', 'Dashboard', 'home')}
        ${navItem(state.currentPage, 'discover', 'Find partners', 'search')}
        ${navItem(state.currentPage, 'plans', 'My travel plans', 'route')}
        ${navItem(state.currentPage, 'requests', 'Connections', 'users', pendingCount)}
        ${navItem(state.currentPage, 'messages', 'Messages', 'message')}
        ${navItem(state.currentPage, 'profile', 'My profile', 'user')}
        ${navItem(state.currentPage, 'settings', 'Settings', 'settings')}
      </nav>
      <div class="sidebar-bottom">
        <div class="safety-mini"><strong>${icon('shield')} Travel thoughtfully</strong><p>Discovery prototype only. Verify arrangements through trusted university channels.</p></div>
        <div class="sidebar-profile">
          <div class="avatar small" aria-hidden="true">${escapeHtml(initials(state.user.name))}</div>
          <div class="profile-meta"><strong>${escapeHtml(state.user.name)}</strong><span>${state.user.verified ? 'Verified (Simulated)' : 'Pending'}</span></div>
          <button type="button" class="profile-button" data-page="settings" aria-label="Open settings">${icon('settings')}</button>
        </div>
      </div>
    </aside>
    <div class="main-area">
      <header class="topbar">
        <div class="breadcrumb">Campus community <span aria-hidden="true">/</span> <strong>${escapeHtml(pageTitle(state.currentPage))}</strong></div>
        <div class="top-actions">
          <button type="button" class="icon-button" data-action="toggle-theme" aria-label="Switch to ${state.preferences.theme === 'dark' ? 'light' : 'dark'} theme">${icon(state.preferences.theme === 'dark' ? 'sun' : 'moon')}</button>
          <div class="top-user"><div class="avatar small" aria-hidden="true">${escapeHtml(initials(state.user.name))}</div><div class="top-user-copy"><strong>${escapeHtml(state.user.name)}</strong><span>Thapar student</span></div></div>
        </div>
      </header>
      <main id="main-content" class="content" tabindex="-1">${content}</main>
    </div>
    <nav class="mobile-nav" aria-label="Mobile navigation">
      ${navItem(state.currentPage, 'dashboard', 'Home', 'home')}
      ${navItem(state.currentPage, 'discover', 'Discover', 'search')}
      ${navItem(state.currentPage, 'plans', 'Plans', 'route')}
      ${navItem(state.currentPage, 'requests', 'Connect', 'users', pendingCount)}
      ${navItem(state.currentPage, 'messages', 'Messages', 'message')}
      ${navItem(state.currentPage, 'profile', 'Profile', 'user')}
      ${navItem(state.currentPage, 'settings', 'Settings', 'settings')}
    </nav>
  </div>`;
}
