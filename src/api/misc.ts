import { api } from './client';
import type { AuditLog, CompanySettings, Customer, Invoice, Paginated, User } from '../types';

// ---------- Dashboard ----------
export interface DashboardData {
  stats: {
    totalInvoices: number;
    invoicesThisMonth: number;
    paid: number;
    unpaid: number;
    partiallyPaid: number;
    overdue: number;
    totalInvoiced: number;
    totalPaidAmount: number;
    outstanding: number;
  };
  revenueTrend: { label: string; total: number; volume: number }[];
  statusBreakdown: { status: string; count: number }[];
  topCustomers: { customer: Customer; total: number }[];
  recentInvoices: (Invoice & { customerName: string })[];
  recentCustomers: Customer[];
}

export async function fetchDashboard(): Promise<DashboardData> {
  const { data } = await api.get('/dashboard');
  return data;
}

// ---------- Reports ----------
export async function fetchRevenueReport(params: { groupBy: string; dateFrom?: string; dateTo?: string }) {
  const { data } = await api.get('/reports/revenue', { params });
  return data as { rows: { period: string; invoiceCount: number; totalInvoiced: number; totalPaid: number }[] };
}

export async function fetchInvoiceReport(params: { dateFrom?: string; dateTo?: string }) {
  const { data } = await api.get('/reports/invoices', { params });
  return data as { summary: Record<string, number> };
}

export async function fetchCustomerReport() {
  const { data } = await api.get('/reports/customers');
  return data as {
    rows: { customer: string; totalInvoices: number; totalBilled: number; totalPaid: number; outstanding: number }[];
  };
}

export function reportCsvUrl(kind: 'revenue' | 'invoices' | 'customers', params: Record<string, string> = {}) {
  const qs = new URLSearchParams({ ...params, format: 'csv' }).toString();
  return `/api/reports/${kind}?${qs}`;
}

// ---------- Settings ----------
export async function fetchSettings(): Promise<CompanySettings> {
  const { data } = await api.get('/settings');
  return data.settings;
}

export async function updateSettings(payload: Partial<CompanySettings>): Promise<CompanySettings> {
  const { data } = await api.put('/settings', payload);
  return data.settings;
}

// ---------- Users ----------
export async function listUsers(): Promise<User[]> {
  const { data } = await api.get('/users');
  return data.data;
}

export async function createUser(payload: { name: string; email: string; password: string; role: string }) {
  const { data } = await api.post('/users', payload);
  return data.user as User;
}

export async function updateUser(id: string, payload: Partial<{ name: string; role: string; status: string; password: string }>) {
  const { data } = await api.put(`/users/${id}`, payload);
  return data.user as User;
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
}

// ---------- Audit logs ----------
export async function listAuditLogs(params: { page?: number; pageSize?: number } = {}): Promise<Paginated<AuditLog>> {
  const { data } = await api.get('/audit-logs', { params });
  return data;
}
