import { format, isValid, parseISO } from 'date-fns';

export function formatMoney(value: number | undefined | null, currency = 'MWK'): string {
  const n = Number(value || 0);
  return `${currency} ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatNumber(value: number | undefined | null): string {
  const n = Number(value || 0);
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDate(value: string | undefined | null, pattern = 'dd MMM yyyy'): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? parseISO(value) : value;
  if (!isValid(d)) return String(value);
  return format(d, pattern);
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysIso(days: number, from?: string): string {
  const base = from ? new Date(from) : new Date();
  base.setDate(base.getDate() + days);
  return base.toISOString().slice(0, 10);
}

export const STATUS_META: Record<
  string,
  { label: string; badgeClass: string }
> = {
  draft: { label: 'Draft', badgeClass: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' },
  sent: { label: 'Sent', badgeClass: 'bg-brand-pale text-brand-dark ring-1 ring-blue-200' },
  partially_paid: { label: 'Partially Paid', badgeClass: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  paid: { label: 'Paid', badgeClass: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  overdue: { label: 'Overdue', badgeClass: 'bg-red-50 text-red-700 ring-1 ring-red-200' },
  cancelled: { label: 'Cancelled', badgeClass: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200 line-through' },
};

export function statusMeta(status: string) {
  return STATUS_META[status] || { label: status, badgeClass: 'bg-slate-100 text-slate-600' };
}

export function newLineItem() {
  return {
    description: '',
    serviceType: '',
    vehicle: '',
    vehicleRegistration: '',
    driver: '',
    pickupLocation: '',
    deliveryLocation: '',
    tripDate: todayIso(),
    quantity: 1,
    unit: 'trip',
    rate: 0,
    discountPercent: 0,
    taxPercent: 16.5,
  };
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calcLineTotal(item: { quantity: number; rate: number; discountPercent: number; taxPercent: number }) {
  const lineSubtotal = round2(item.quantity * item.rate);
  const lineDiscount = round2(lineSubtotal * (item.discountPercent / 100));
  const lineTaxable = round2(lineSubtotal - lineDiscount);
  const lineTax = round2(lineTaxable * (item.taxPercent / 100));
  return {
    lineSubtotal,
    lineDiscount,
    lineTaxable,
    lineTax,
    total: round2(lineTaxable + lineTax),
  };
}

export function calcInvoiceTotals(
  items: { quantity: number; rate: number; discountPercent: number; taxPercent: number }[],
  additionalCharges: number,
  amountPaid: number
) {
  let subtotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;
  for (const item of items) {
    const c = calcLineTotal(item);
    subtotal = round2(subtotal + c.lineSubtotal);
    discountTotal = round2(discountTotal + c.lineDiscount);
    taxTotal = round2(taxTotal + c.lineTax);
  }
  const total = round2(subtotal - discountTotal + taxTotal + round2(additionalCharges || 0));
  const balance = round2(total - round2(amountPaid || 0));
  return { subtotal, discountTotal, taxTotal, additionalCharges: round2(additionalCharges || 0), total, amountPaid: round2(amountPaid || 0), balance };
}
