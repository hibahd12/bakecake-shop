import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// ─── Axios Configuration ──────────────────────────────────────────────────────
// In production, VITE_API_URL points to the Railway backend (e.g. https://bakecake-api.up.railway.app)
// In development, it falls back to '/api' which is proxied by Vite to localhost:8000
const BACKEND_URL = import.meta.env.VITE_API_URL || '';
const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';
const SANCTUM_BASE = BACKEND_URL || undefined; // undefined = use Vite proxy in dev

axios.defaults.baseURL = API_BASE;
axios.defaults.xsrfCookieName = 'XSRF-TOKEN';
axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true;

// Attach Bearer token from localStorage on every request
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('bakecake_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth Context ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // Check existing session

  // On mount: restore session from localStorage
  useEffect(() => {
    const token  = localStorage.getItem('bakecake_token');
    const stored = localStorage.getItem('bakecake_user');
    if (token && stored) {
      // Restore user immediately from cache — don't wait for API
      const cachedUser = JSON.parse(stored);
      setUser(cachedUser);
      setLoading(false);
      // Try to refresh from API in background (non-blocking)
      axios.get('/me')
        .then((res) => setUser(res.data.user))
        .catch(() => {
          // API offline or token invalid:
          // - If it looks like a real token (not 'mock_*'), clear session
          // - If backend is simply down, keep the cached user so UI still works
          if (token.startsWith('mock_')) {
            // Demo/preview mode — keep session
          } else {
            localStorage.removeItem('bakecake_token');
            localStorage.removeItem('bakecake_user');
            setUser(null);
          }
        });
    } else {
      setLoading(false);
    }
  }, []);

  /** Login: stores token + user in state and localStorage */
  const login = async (email, password) => {
    await axios.get('/sanctum/csrf-cookie', { baseURL: SANCTUM_BASE });
    const { data } = await axios.post('/login', { email, password });
    localStorage.setItem('bakecake_token', data.token);
    localStorage.setItem('bakecake_user',  JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  /** Register: creates account and logs in */
  const register = async (form) => {
    await axios.get('/sanctum/csrf-cookie', { baseURL: SANCTUM_BASE });
    const { data } = await axios.post('/register', form);
    localStorage.setItem('bakecake_token', data.token);
    localStorage.setItem('bakecake_user',  JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  /** Logout: calls API then clears local state */
  const logout = async () => {
    try { await axios.post('/logout'); } catch {}
    localStorage.removeItem('bakecake_token');
    localStorage.removeItem('bakecake_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook to access auth context */
export function useAuth() {
  return useContext(AuthContext);
}

export { axios };
