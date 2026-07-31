import { createContext, useContext, useEffect, useState } from 'react';
import { logoutUser, updateUserProfile } from '../services/api';
import { USER_STORAGE_KEY, TOKEN_STORAGE_KEY } from '../lib/storageKeys';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));

  useEffect(() => {
    if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_STORAGE_KEY);
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  }, [token]);

  // The backend has no refresh-token flow — a 401 means the token is gone/expired.
  // api.js can't reach this context directly (plain functions, not hooks), so it
  // dispatches this event instead; we react to it here by force-signing-out.
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('rosacycle:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('rosacycle:unauthorized', handleUnauthorized);
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setToken(null);
  };

  const updateUser = async (updates, currentPassword) => {
    const updated = await updateUserProfile(updates, currentPassword);
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user && !!token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
