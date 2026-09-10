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
