import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';
import { clearToken, request, restoreSession, setSession } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    restoreSession()
      .then((session) => {
        if (session) {
          setTokenState(session.token);
          setUser(session.user);
        }
      })
      .finally(() => setRestoring(false));
  }, []);

  async function login(userData, jwtToken) {
    await setSession(jwtToken, userData);
    setTokenState(jwtToken);
    setUser(userData);
  }

  async function logout() {
    await clearToken();
    setTokenState(null);
    setUser(null);
  }

  async function updateUser(changes) {
    const updatedUser = await request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(changes),
    });
    await setSession(token, updatedUser);
    setUser(updatedUser);
  }

  const refreshUser = useCallback(async () => {
    const result = await request('/users/me');
    const currentUser = result.user || result;
    await setSession(token, currentUser);
    setUser(currentUser);
    return currentUser;
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, restoring, login, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
