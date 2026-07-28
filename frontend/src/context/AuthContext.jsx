import { createContext, useContext, useEffect, useState } from 'react';
import { logoutUser, updateUserProfile } from '../services/api';

const AuthContext = createContext(null);
const STORAGE_KEY = 'rosacycle_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const login = (userData) => setUser(userData);

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const updateUser = async (updates, currentPassword) => {
    const updated = await updateUserProfile(user.id, updates, currentPassword);
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
