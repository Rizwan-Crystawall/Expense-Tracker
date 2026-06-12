import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  fetchMe,
  login as apiLogin,
  register as apiRegister,
  saveToken,
  clearToken,
  hasToken,
} from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!hasToken()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const { user: currentUser } = await fetchMe();
      setUser(currentUser);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (username, password) => {
    const { token, user: loggedInUser } = await apiLogin(username, password);
    saveToken(token);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (username, password) => {
    const { token, user: newUser } = await apiRegister(username, password);
    saveToken(token);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
