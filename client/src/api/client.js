import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

function readStoredToken() {
  const raw = localStorage.getItem('greige-auth');
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed?.state?.token || parsed?.token || null;
  } catch {
    return null;
  }
}

/** Attach JWT on every request: `Authorization: Bearer <token>` */
api.interceptors.request.use((config) => {
  const token = readStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** On 401, clear persisted auth + in-memory session so no user data lingers */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthAttempt =
      url.includes('/auth/login') || url.includes('/auth/register');

    if (status === 401 && !isAuthAttempt) {
      localStorage.removeItem('greige-auth');
      try {
        const { clearClientSession } = await import('../store/clearClientSession');
        clearClientSession();
      } catch {
        /* ignore */
      }
      if (window.location.pathname !== '/login' && window.location.pathname !== '/welcome') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
