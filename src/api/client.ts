import axios, { AxiosError } from 'axios';

export const api = axios.create({
  baseURL: '/api',
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
  return `/api/invoices/${id}/pdf`;
}
