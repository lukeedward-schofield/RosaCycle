/**
 * API abstraction layer.
 *
 * IMPORTANT for team integration: screens should import data functions from
 * HERE, not directly from `data/mockTrades.js`. Right now these functions
 * just return mock data, but once Backend Lead's API is live, only THIS file
 * needs to change (swap the mock return for a real `fetch()` call) — no
 * screen code should need to be touched.
 *
 * Expected JSON shape (to align with Backend Lead's endpoints):
 *
 * Trade {
 *   id: string
 *   name: string
 *   material: string
 *   image: string | null
 *   distanceKm: number
 *   location: string
 *   posterName: string
 *   weightKg: number
 *   quantity: number
 *   tradingFor: { type: 'specific' | 'nothing' | 'negotiating', value?: string }
 *   description: string
 *   hasOffers: boolean
 *   offerAccepted: boolean
 * }
 */
import { mockTrades, mockTrackTrades, mockOfferHistory } from '../data/mockTrades';
import { SEED_USERS } from '../data/mockUsers';

// Simulates network latency so loading states can be tested during frontend dev.
const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

export async function fetchBrowseTrades() {
  await delay();
  return mockTrades;
}

export async function fetchTradeById(id) {
  await delay();
  return mockTrades.find((t) => t.id === id) || mockTrackTrades.find((t) => t.id === id) || null;
}

export async function fetchMyTrades() {
  await delay();
  return mockTrackTrades;
}

export async function fetchOfferHistory() {
  await delay();
  return mockOfferHistory;
}

export async function createTrade(payload) {
  await delay();
  // Real version: POST to backend, return created trade with server-assigned id.
  return { id: `trade-${Date.now()}`, ...payload };
}

export async function sendOffer(tradeId, payload) {
  await delay();
  // Real version: POST offer to backend.
  return { tradeId, ...payload, status: 'Pending' };
}

/**
 * Auth (mock, email + password) — matches the User entity in docs/:
 * Username, First Name, Last Name, Email, Password Hash, Profile Image,
 * Created Date, User Role. No backend yet, so accounts are persisted to
 * localStorage (not just kept in memory) so a page reload during dev doesn't
 * wipe out accounts you just signed up with. "Password hashing" is skipped
 * entirely — real version: these become real POSTs to Flask, password hashed
 * server-side, and the password field is never sent back in the response.
 */
const USERS_STORAGE_KEY = 'rosacycle_mock_users';

function loadMockUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupted storage — fall through to reseed
  }
  return SEED_USERS;
}

const _mockUsers = loadMockUsers();

function persistMockUsers() {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(_mockUsers));
}

function sanitizeUser(user) {
  const { password, ...rest } = user;
  return rest;
}

export async function registerUser({ firstName, lastName, username, email, password }) {
  await delay();
  if (_mockUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('An account with this email already exists.');
  }
  const user = {
    id: `user-${Date.now()}`,
    username,
    firstName,
    lastName,
    email,
    password,
    profileImage: null,
    role: 'user',
    createdAt: new Date().toISOString(),
  };
  _mockUsers.push(user);
  persistMockUsers();
  return sanitizeUser(user);
}

export async function loginUser({ email, password }) {
  await delay();
  const user = _mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) {
    throw new Error('Invalid email or password.');
  }
  return sanitizeUser(user);
}

export async function logoutUser() {
  await delay(150);
  return true;
}

// Anti-abuse cooldown: profile edits (name, username, email, password) are
// throttled so an account can't be repeatedly changed back-to-back.
export const PROFILE_EDIT_COOLDOWN_DAYS = 7;
const PROFILE_EDIT_COOLDOWN_MS = PROFILE_EDIT_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

export async function updateUserProfile(userId, updates, currentPassword) {
  await delay();
  const user = _mockUsers.find((u) => u.id === userId);
  if (!user) throw new Error('User not found.');
  if (updates.password && currentPassword !== user.password) {
    throw new Error('Current password is incorrect.');
  }
  if (user.profileUpdatedAt) {
    const nextAllowedAt = new Date(user.profileUpdatedAt).getTime() + PROFILE_EDIT_COOLDOWN_MS;
    if (Date.now() < nextAllowedAt) {
      const daysLeft = Math.ceil((nextAllowedAt - Date.now()) / (24 * 60 * 60 * 1000));
      throw new Error(`You can update your profile again in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`);
    }
  }
  Object.assign(user, updates, { profileUpdatedAt: new Date().toISOString() });
  persistMockUsers();
  return sanitizeUser(user);
}

/**
 * Resource Spot reporting (mock). Distinct from Trades — reporting a spot
 * pins a location on the Map, it never creates a Trade.
 */
export async function reportResourceSpot(payload) {
  await delay();
  // Real version: POST to backend, return created spot with server-assigned id.
  return { id: `site-${Date.now()}`, distanceKm: 0, ...payload };
}
