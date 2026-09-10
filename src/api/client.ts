import axios, { AxiosError } from 'axios';

// In local dev, requests to /api are proxied to the local server (see
// vite.config.ts), so no env var is needed.
//
// On Vercel, the client and server are two separate deployments on two
// separate domains, so relative '/api' calls would hit the client's own
// domain and 404. Set VITE_API_URL (see .env.production) to the deployed
// server's origin, e.g. https://lh-transport-server.vercel.app - the code
// below then calls `${VITE_API_URL}/api/...` instead.
const apiOrigin = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const api = axios.create({
  baseURL: `${apiOrigin}/api`,
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lh_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class ApiError extends Error {
  status?: number;
  details?: unknown;
  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<any>) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('lh_token');
      localStorage.removeItem('lh_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    const message =
      err.response?.data?.error?.message || 'Something went wrong while contacting the server. Please try again.';
    return Promise.reject(new ApiError(message, err.response?.status, err.response?.data?.error?.details));
  }
);

export function invoicePdfUrl(id: string): string {
  return `${apiOrigin}/api/invoices/${id}/pdf`;
}
