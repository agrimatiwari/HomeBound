import { initialState, loadState, saveState } from './storage.js';
import { findSuggestedMatches } from './matching.js';
import {
  sanitizeText,
  parseCommaList,
  maskStudentId,
  isValidThaparEmail,
  upsertTravelPlan,
  setTravelPlanStatus,
  deleteTravelPlan,
  updateStudentProfile,
  sendConnectionRequest,
  respondToConnectionRequest,
  cancelConnectionRequest,
  sendMessageToConnection
} from './domain.js';
import {
  appShell,
  authView,
  dashboardView,
  discoverView,
  plansView,
  planFormView,
  requestsView,
  messagesView,
  profileView,
  editProfileView,
  settingsView
} from './ui.js';

let toastTimer = null;
function toast(message, force = false) {
  const el = document.getElementById('toast');
  if (!el) return;
  if (!force && state?.preferences?.emailUpdates === false) return;
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

let state = loadState(globalThis.localStorage, msg => toast(msg, true));

const uiState = {
  discoveryTab: 'matches',
  discoveryQuery: '',
  dateFilter: '',
  requestTab: 'received',
  activeConversation: ''
};

// Memoization cache for matching calculations to avoid redundant recomputation across renders
let matchCache = { key: '', results: [] };
function getCachedMatches() {
  const userId = state.user?.id || '';
  const planFingerprint = JSON.stringify(state.plans.map(p => [p.id, p.owner, p.from, p.destination, p.nearby, p.date, p.flexible, p.time, p.status]));
  const userPrefs = JSON.stringify(state.user?.preferences || []);
  const cacheKey = `${userId}|${planFingerprint}|${userPrefs}`;
  if (matchCache.key !== cacheKey) {
    matchCache = { key: cacheKey, results: findSuggestedMatches(state, userId) };
  }
  return matchCache.results;
}

function persist() {
  saveState(state, globalThis.localStorage, msg => toast(msg, true));
}

function showInlineError(elementId, message) {
  const el = document.getElementById(elementId);
  if (!el) return toast(message, true);
  el.textContent = message;
  el.hidden = false;
}

function render() {
  document.documentElement.dataset.theme = state.preferences?.theme || 'light';
  const appRoot = document.getElementById('app');
  if (!appRoot) return;

  if (!state.user) {
    appRoot.innerHTML = authView();
    return;
  }

  const page = state.currentPage || 'dashboard';
  const matches = getCachedMatches();
  let content = '';

  if (page === 'dashboard') {
    content = dashboardView(state, matches);
  } else if (page === 'discover') {
    content = discoverView(state, matches, uiState);
  } else if (page === 'plans') {
    content = plansView(state);
  } else if (page === 'create-plan') {
    content = planFormView(null);
  } else if (page.startsWith('edit-plan:')) {
    const planId = page.slice(10);
    const plan = state.plans.find(p => p.id === planId && p.owner === state.user.id) || null;
    content = plan ? planFormView(plan) : plansView(state);
  } else if (page === 'requests') {
    content = requestsView(state, uiState);
  } else if (page === 'messages') {
    content = messagesView(state, uiState);
  } else if (page === 'profile') {
    content = profileView(state);
  } else if (page === 'edit-profile') {
    content = editProfileView(state);
  } else if (page === 'settings') {
    content = settingsView(state);
  } else {
    content = dashboardView(state, matches);
  }

  appRoot.innerHTML = appShell(state, content);

  if (page === 'messages') {
    const chatBox = document.getElementById('chat-messages');
    if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
  }
}

function goto(page) {
  state.currentPage = page;
  persist();
  render();
  window.scrollTo(0, 0);
}

/**
 * Accessible confirmation dialog supporting Escape key, backdrop click, and focus restoration.
 */
function showConfirm(title, message, confirmText, onConfirm) {
  const previousFocus = document.activeElement;
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  const modal = document.createElement('section');
  modal.className = 'modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'confirm-modal-title');

  const head = document.createElement('div');
  head.className = 'modal-head';

  const heading = document.createElement('h2');
  heading.id = 'confirm-modal-title';
  heading.textContent = title;

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'modal-close';
  closeBtn.setAttribute('aria-label', 'Close dialog');
  closeBtn.textContent = '×';

  head.append(heading, closeBtn);

  const body = document.createElement('p');
  body.textContent = message;

  const actions = document.createElement('div');
  actions.className = 'modal-actions';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'button button-secondary';
  cancelBtn.textContent = 'Cancel';

  const confirmBtn = document.createElement('button');
  confirmBtn.type = 'button';
  confirmBtn.className = 'button button-danger';
  confirmBtn.textContent = confirmText;

  actions.append(cancelBtn, confirmBtn);
  modal.append(head, body, actions);
  backdrop.append(modal);
  document.body.append(backdrop);

  const cleanup = () => {
    document.removeEventListener('keydown', onKeyDown);
    backdrop.remove();
    if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
  };

  const onKeyDown = event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      cleanup();
    } else if (event.key === 'Tab') {
      const focusables = [closeBtn, cancelBtn, confirmBtn];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  document.addEventListener('keydown', onKeyDown);
  closeBtn.addEventListener('click', cleanup);
  cancelBtn.addEventListener('click', cleanup);
  confirmBtn.addEventListener('click', () => {
    cleanup();
    onConfirm();
  });
  backdrop.addEventListener('click', event => {
    if (event.target === backdrop) cleanup();
  });

  cancelBtn.focus();
}

// Delegated click handler
document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;

  if (button.dataset.page) {
    const allowedPages = ['dashboard', 'discover', 'plans', 'create-plan', 'requests', 'messages', 'profile', 'settings'];
    if (allowedPages.includes(button.dataset.page)) {
      goto(button.dataset.page);
    }
    return;
  }

  switch (button.dataset.action) {
    case 'toggle-theme':
      state.preferences.theme = state.preferences.theme === 'dark' ? 'light' : 'dark';
      persist();
      render();
      break;

    case 'connect': {
      const result = sendConnectionRequest(state, state.user.id, button.dataset.plan);
      if (!result.ok) return toast(result.error, true);
      persist();
      render();
      toast('Connection request sent.');
      break;
    }

    case 'discovery-tab':
      uiState.discoveryTab = button.dataset.tab === 'all' ? 'all' : 'matches';
      render();
      break;

    case 'request-tab':
      uiState.requestTab = button.dataset.tab === 'sent' ? 'sent' : 'received';
      render();
      break;

    case 'clear-filters':
      uiState.discoveryQuery = '';
      uiState.dateFilter = '';
      render();
      break;

    case 'edit-plan': {
      const targetPlan = state.plans.find(p => p.id === button.dataset.plan);
      if (!targetPlan || targetPlan.owner !== state.user.id) {
        return toast('Access denied: you can only edit your own travel plans.', true);
      }
      goto(`edit-plan:${targetPlan.id}`);
      break;
    }

    case 'plan-status': {
      const res = setTravelPlanStatus(state, state.user.id, button.dataset.plan, button.dataset.status);
      if (!res.ok) return toast(res.error, true);
      persist();
      render();
      toast(`Travel plan marked as ${button.dataset.status}.`);
      break;
    }

    case 'delete-plan': {
      const planId = button.dataset.plan;
      showConfirm(
        'Delete travel plan?',
        'This travel plan and any associated pending requests will be permanently removed.',
        'Delete plan',
        () => {
          const res = deleteTravelPlan(state, state.user.id, planId);
          if (!res.ok) return toast(res.error, true);
          persist();
          render();
          toast('Travel plan deleted.');
        }
      );
      break;
    }

    case 'request-status': {
      const res = respondToConnectionRequest(state, state.user.id, button.dataset.request, button.dataset.status);
      if (!res.ok) return toast(res.error, true);
      persist();
      render();
      toast(button.dataset.status === 'accepted' ? 'Connection accepted. You can now message this student.' : 'Connection request rejected.');
      break;
    }

    case 'cancel-request': {
      const requestId = button.dataset.request;
      showConfirm(
        'Cancel connection request?',
        'Are you sure you want to withdraw this pending connection request?',
        'Cancel request',
        () => {
          const res = cancelConnectionRequest(state, state.user.id, requestId);
          if (!res.ok) return toast(res.error, true);
          persist();
          render();
          toast('Connection request cancelled.');
        }
      );
      break;
    }

    case 'open-chat':
      uiState.activeConversation = button.dataset.person;
      goto('messages');
      break;

    case 'select-conversation':
      uiState.activeConversation = button.dataset.person;
      render();
      break;

    case 'edit-profile':
      goto('edit-profile');
      break;

    case 'auth-switch':
      document.getElementById('app').innerHTML = authView(button.dataset.mode === 'register' ? 'register' : 'login');
      break;

    case 'demo-login': {
      const restored = loadState(globalThis.localStorage);
      state = restored;
      if (!state.user) {
        state.user = state.lastUser || initialState().user;
        state.lastUser = null;
        if (!state.students.some(s => s.id === state.user.id)) {
          state.students.push({ ...state.user });
        }
      }
      persist();
      render();
      toast('Signed in with HomeBound demo account.');
      break;
    }

    case 'logout':
      showConfirm(
        'Sign out of demo session?',
        'Your prototype data remains saved in this browser. You can sign back in anytime.',
        'Sign out',
        () => {
          state.lastUser = state.user;
          state.user = null;
          persist();
          render();
        }
      );
      break;
  }
});

// Debounced search input & date filter
let searchDebounceTimer = null;
document.addEventListener('input', event => {
  if (event.target.id === 'discovery-search') {
    const value = event.target.value;
    const cursorPos = event.target.selectionStart;
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      uiState.discoveryQuery = value;
      render();
      const restoredInput = document.getElementById('discovery-search');
      if (restoredInput) {
        restoredInput.focus();
        if (typeof cursorPos === 'number') restoredInput.setSelectionRange(cursorPos, cursorPos);
      }
    }, 180);
  }
});

document.addEventListener('change', event => {
  if (event.target.id === 'discovery-date') {
    uiState.dateFilter = event.target.value;
    render();
  } else if (event.target.matches('[data-action="theme-switch"]')) {
    state.preferences.theme = event.target.checked ? 'dark' : 'light';
    persist();
    render();
  } else if (event.target.matches('[data-action="notifications-switch"]')) {
    state.preferences.emailUpdates = event.target.checked;
    persist();
    toast('Feedback preference updated.', true);
  }
});

// Form submissions
document.addEventListener('submit', event => {
  const form = event.target;

  if (form.id === 'plan-form') {
    event.preventDefault();
    const fd = new FormData(form);
    const editId = form.dataset.id || null;
    const res = upsertTravelPlan(
      state,
      state.user.id,
      {
        from: fd.get('from'),
        destination: fd.get('destination'),
        nearby: parseCommaList(fd.get('nearby')),
        date: fd.get('date'),
        flexible: form.elements.flexible.checked,
        time: fd.get('time'),
        seats: Number(fd.get('seats')),
        note: fd.get('note')
      },
      editId
    );
    if (!res.ok) return showInlineError('plan-form-error', res.error);
    persist();
    goto('plans');
    toast(res.isNew ? 'Travel plan published.' : 'Travel plan updated.');
  } else if (form.id === 'profile-form') {
    event.preventDefault();
    const fd = new FormData(form);
    const res = updateStudentProfile(state, state.user.id, {
      name: fd.get('name'),
      branch: fd.get('branch'),
      year: fd.get('year'),
      hometown: fd.get('hometown'),
      nearby: parseCommaList(fd.get('nearby')),
      languages: parseCommaList(fd.get('languages')),
      preferences: parseCommaList(fd.get('preferences')),
      intro: fd.get('intro')
    });
    if (!res.ok) return showInlineError('profile-form-error', res.error);
    persist();
    goto('profile');
    toast('Profile updated.');
  } else if (form.id === 'auth-form') {
    event.preventDefault();
    const fd = new FormData(form);
    const email = sanitizeText(fd.get('email'), 100).toLowerCase();
    if (!isValidThaparEmail(email)) {
      return showInlineError('auth-form-error', 'Please enter a valid @thapar.edu or @thapar.edu.in student email.');
    }

    if (form.dataset.mode === 'register') {
      const name = sanitizeText(fd.get('name'), 60);
      const rawId = sanitizeText(fd.get('studentId'), 24);
      if (!name || name.length < 2) {
        return showInlineError('auth-form-error', 'Please enter your full name (at least 2 characters).');
      }
      if (!rawId || rawId.length < 4) {
        return showInlineError('auth-form-error', 'Please enter a valid Thapar student ID (at least 4 characters).');
      }
      const newUser = {
        id: `student-${Date.now()}`,
        name,
        email,
        studentId: maskStudentId(rawId),
        branch: sanitizeText(fd.get('branch'), 60) || 'Computer Engineering',
        year: sanitizeText(fd.get('year'), 30) || '1st Year',
        hometown: '',
        nearby: [],
        languages: [],
        intro: '',
        preferences: [],
        verified: true,
        isDemo: false
      };
      state.user = newUser;
      state.students.push({
        id: newUser.id,
        name: newUser.name,
        branch: newUser.branch,
        year: newUser.year,
        hometown: '',
        nearby: [],
        languages: [],
        intro: '',
        preferences: [],
        verified: true
      });
      state.lastUser = null;
      state.currentPage = 'profile';
      persist();
      render();
      toast('Simulated verification complete. Complete your profile to improve matches.');
    } else {
      if (!state.user) {
        if (state.lastUser && state.lastUser.email?.toLowerCase() === email) {
          state.user = state.lastUser;
        } else {
          state = initialState();
          state.user.email = email;
        }
      }
      state.lastUser = null;
      state.user.email = email;
      state.user.verified = true;
      persist();
      render();
      toast('Simulated sign-in complete. Welcome to HomeBound.');
    }
  } else if (form.id === 'message-form') {
    event.preventDefault();
    const recipient = form.dataset.person;
    const text = form.elements.message.value;
    const res = sendMessageToConnection(state, state.user.id, recipient, text);
    if (!res.ok) return toast(res.error, true);
    persist();
    render();
  }
});

render();
