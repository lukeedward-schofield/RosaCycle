// Shared localStorage keys — used by both AuthContext (React state sync) and
// api.js (plain functions, can't reach React context) so they never drift.
export const USER_STORAGE_KEY = 'rosacycle_user';
export const TOKEN_STORAGE_KEY = 'rosacycle_token';
