// Seed account for the mock auth store (see services/api.js).
export const SEED_USERS = [
  {
    id: 'user-demo',
    username: 'demo',
    firstName: 'Demo',
    lastName: 'User',
    email: 'demo@rosacycle.app',
    password: 'password123',
    profileImage: null,
    role: 'user',
    createdAt: new Date().toISOString(),
  },
];
