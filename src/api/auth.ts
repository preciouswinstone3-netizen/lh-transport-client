import { api } from './client';
import type { User } from '../types';

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get('/auth/me');
  return data.user;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function updateProfile(data: { name?: string; email?: string }): Promise<User> {
  const { data: res } = await api.put('/auth/profile', data);
  return res.user;
}

export async function changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
  await api.put('/auth/password', data);
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await api.post('/auth/reset-password', { token, newPassword });
}
