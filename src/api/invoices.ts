import { api } from './client';
import type { Invoice, Paginated, Payment } from '../types';

export interface InvoiceListParams {
  search?: string;
  status?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  createdBy?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export async function listInvoices(params: InvoiceListParams = {}): Promise<Paginated<Invoice>> {
  const { data } = await api.get('/invoices', { params });
  return data;
}

export async function getInvoice(id: string): Promise<{ invoice: Invoice; payments: Payment[] }> {
  const { data } = await api.get(`/invoices/${id}`);
  return data;
}

export async function createInvoice(payload: any): Promise<Invoice> {
  const { data } = await api.post('/invoices', payload);
  return data.invoice;
}

export async function updateInvoice(id: string, payload: any): Promise<Invoice> {
  const { data } = await api.put(`/invoices/${id}`, payload);
  return data.invoice;
}

export async function deleteInvoice(id: string): Promise<void> {
  await api.delete(`/invoices/${id}`);
}

export async function duplicateInvoice(id: string): Promise<Invoice> {
  const { data } = await api.post(`/invoices/${id}/duplicate`);
  return data.invoice;
}

export async function recordPayment(
  id: string,
  payload: { amount: number; paymentDate: string; paymentMethod: string; reference?: string; notes?: string }
): Promise<{ invoice: Invoice; payments: Payment[] }> {
  const { data } = await api.post(`/invoices/${id}/payments`, payload);
  return data;
}

export async function changeInvoiceStatus(id: string, status: string): Promise<Invoice> {
  const { data } = await api.patch(`/invoices/${id}/status`, { status });
  return data.invoice;
}

export async function downloadInvoicePdf(id: string, invoiceNumber: string): Promise<void> {
  const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `LH-Transport-Invoice-${invoiceNumber}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function fetchInvoicePdfBlobUrl(id: string): Promise<string> {
  const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  return window.URL.createObjectURL(blob);
}
