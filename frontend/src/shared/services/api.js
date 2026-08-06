/**
 * API layer — talks to the real RosaCycle backend (see backend/docs/API.md
 * for the full reference). Screens should only import from here, never call
 * fetch() directly and never import from data/mock*.js.
 */
import { TOKEN_STORAGE_KEY } from '@/shared/lib/storageKeys';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function buildFormData(fields = {}, imageFile) {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    form.append(key, value);
  });
  if (imageFile) form.append('image', imageFile);
  return form;
}

async function apiFetch(path, { method = 'GET', json, form, query } = {}) {
  let url = `${API_BASE_URL}${path}`;
  if (query) {
    const qs = new URLSearchParams(
      Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ).toString();
    if (qs) url += `?${qs}`;
  }

  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const init = { method, headers };
  if (form) {
    init.body = form; // browser sets multipart Content-Type + boundary itself
  } else if (json !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(json);
  }

  const res = await fetch(url, init);

  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent('rosacycle:unauthorized'));
  }

  if (!res.ok) {
    let message = `Request failed (${res.status}).`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // non-JSON error body — fall back to the generic message
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

// --- Auth ---------------------------------------------------------------

export async function registerUser({ firstName, lastName, username, email, password }) {
  return apiFetch('/auth/register', {
    method: 'POST',
    json: { firstName, lastName, username, email, password },
  });
}

export async function loginUser({ email, password }) {
  return apiFetch('/auth/login', { method: 'POST', json: { email, password } });
}
export async function loginWithGoogle(googleToken) {
  return apiFetch('/auth/google', { 
    method: 'POST', 
    json: { token: googleToken } 
  });
}

export async function logoutUser() {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch {
    // logout is a stateless no-op server-side — never block local sign-out on it
  }
  return true;
}

export async function fetchCurrentUser() {
  return apiFetch('/users/me');
}

export async function updateUserProfile(updates, currentPassword) {
  const form = buildFormData({
    firstName: updates.firstName,
    lastName: updates.lastName,
    username: updates.username,
    email: updates.email,
    password: updates.password,
    currentPassword,
  });
  if (updates.imageFile) form.set('image', updates.imageFile);
  return apiFetch('/users/me', { method: 'PATCH', form });
}

// --- Trades ---------------------------------------------------------------

export async function fetchBrowseTrades({ category, location } = {}) {
  return apiFetch('/trades', { query: { category, location } });
}

export async function fetchMyTrades() {
  return apiFetch('/trades/mine');
}

export async function fetchTradeById(id) {
  return apiFetch(`/trades/${id}`);
}

export async function createTrade(fields, imageFile) {
  const form = buildFormData(fields, imageFile);
  return apiFetch('/trades', { method: 'POST', form });
}

export async function updateTrade(id, fields, imageFile) {
  const form = buildFormData(fields, imageFile);
  return apiFetch(`/trades/${id}`, { method: 'PATCH', form });
}

// --- Offers ---------------------------------------------------------------

export async function sendOffer(tradeId, fields, imageFile) {
  const form = buildFormData(fields, imageFile);
  return apiFetch(`/trades/${tradeId}/offers`, { method: 'POST', form });
}

export async function fetchOffersForTrade(tradeId) {
  return apiFetch(`/trades/${tradeId}/offers`);
}

export async function acceptOffer(offerId) {
  return apiFetch(`/offers/${offerId}/accept`, { method: 'POST' });
}

export async function declineOffer(offerId) {
  return apiFetch(`/offers/${offerId}/decline`, { method: 'POST' });
}

export async function fetchMyOffers() {
  return apiFetch('/offers/mine');
}

export async function fetchReceivedOffers() {
  return apiFetch('/offers/received');
}


// --- Messaging ---------------------------------------------------------------

export async function fetchConversation(conversationId) {
  return apiFetch(`/messages/${conversationId}`);
}

export async function fetchMessages(conversationId) {
  return apiFetch(`/messages/${conversationId}/messages`);
}

export async function sendMessage(conversationId, content) {
  return apiFetch(`/messages/${conversationId}/messages`, {
    method: 'POST',
    json: { content },
  });
}

// --- Resource Spots ---------------------------------------------------------------

export async function assessResourceSpotPhoto(imageFile) {
  const form = new FormData();
  form.append("image", imageFile);

  return apiFetch("/ai/assess-resource-spot-photo", {
    method: "POST",
    form,
  });
}

export async function fetchResourceSpots() {
  return apiFetch('/resource-spots');
}

export async function fetchResourceSpotById(id) {
  return apiFetch(`/resource-spots/${id}`);
}

export async function reportResourceSpot(fields, imageFile) {
  const form = buildFormData(fields, imageFile);
  return apiFetch('/resource-spots', { method: 'POST', form });
}

export async function addResourceSpotPhoto(id, imageFile) {
  const form = buildFormData({}, imageFile);
  return apiFetch(`/resource-spots/${id}/photos`, { method: 'POST', form });
}

export async function updateResourceSpot(id, fields) {
  return apiFetch(`/resource-spots/${id}`, { method: 'PATCH', json: fields });
}

export async function deleteResourceSpot(id) {
  return apiFetch(`/resource-spots/${id}`, { method: 'DELETE' });
}

export async function markResourceSpotCollected(id) {
  return apiFetch(`/resource-spots/${id}/collected`, { method: 'POST' });
}

// --- Notifications ---------------------------------------------------------------

export async function fetchNotifications() {
  return apiFetch('/notifications');
}

export async function fetchUnreadNotificationCount() {
  return apiFetch('/notifications/unread-count');
}

export async function markNotificationRead(id) {
  return apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
}

// --- Ratings ---------------------------------------------------------------

export async function submitRating(tradeId, score, comment) {
  return apiFetch(`/trades/${tradeId}/ratings`, { method: 'POST', json: { score, comment } });
}

export async function fetchUserRatings(userId) {
  return apiFetch(`/users/${userId}/ratings`);
}
