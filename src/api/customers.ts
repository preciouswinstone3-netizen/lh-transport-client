import { api } from './client';
import type { Customer, Invoice, Paginated } from '../types';

export interface CustomerListParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function listCustomers(params: CustomerListParams = {}): Promise<Paginated<Customer>> {
  const { data } = await api.get('/customers', { params });
  return data;
}

export async function getCustomer(
  id: string
): Promise<{ customer: Customer; summary: { totalInvoices: number; totalInvoiced: number; totalPaid: number; outstanding: number }; invoices: Invoice[] }> {
  const { data } = await api.get(`/customers/${id}`);
  return data;
}

export async function createCustomer(payload: Partial<Customer>): Promise<Customer> {
  const { data } = await api.post('/customers', payload);
  return data.customer;
}

export async function updateCustomer(id: string, payload: Partial<Customer>): Promise<Customer> {
  const { data } = await api.put(`/customers/${id}`, payload);
  return data.customer;
}

export async function deleteCustomer(id: string): Promise<void> {
  await api.delete(`/customers/${id}`);
}
