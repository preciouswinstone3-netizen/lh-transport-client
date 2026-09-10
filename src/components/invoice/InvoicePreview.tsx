import { formatMoney, formatDate, statusMeta } from '../../utils/format';
import type { CompanySettings } from '../../types';

export interface PreviewLineItem {
  description: string;
  serviceType?: string | null;
  vehicle?: string | null;
  vehicleRegistration?: string | null;
  driver?: string | null;
  pickupLocation?: string | null;
  deliveryLocation?: string | null;
  quantity: number;
  unit: string;
  rate: number;
  discountPercent: number;
  taxPercent: number;
  total?: number;
}

export interface PreviewCustomer {
  name: string;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  taxNumber?: string | null;
}

export interface InvoicePreviewProps {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: string;
  currency: string;
  referenceNumber?: string | null;
  customerPoNumber?: string | null;
  notes?: string | null;
  customer?: PreviewCustomer | null;
  items: PreviewLineItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  additionalCharges: number;
  total: number;
  amountPaid: number;
  balance: number;
  settings?: CompanySettings | null;
}

export function InvoicePreview({
  invoiceNumber,
  invoiceDate,
  dueDate,
  status,
  currency,
  referenceNumber,
  customerPoNumber,
  notes,
  customer,
  items,
  subtotal,
  discountTotal,
  taxTotal,
  additionalCharges,
  total,
  amountPaid,
  balance,
  settings,
}: InvoicePreviewProps) {
  const meta = statusMeta(status);

  return (
    <div id="printable-invoice" className="bg-white text-brand-navy p-6 sm:p-10 rounded-2xl shadow-card border border-slate-100 max-w-[820px] mx-auto text-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          {settings?.logoDataUrl ? (
            <img src={settings.logoDataUrl} alt="Company logo" className="h-14 w-auto object-contain" />
          ) : (
            <div className="h-14 w-14 rounded-xl bg-brand-dark flex items-center justify-center text-white font-extrabold text-lg shrink-0">
              LH
            </div>
          )}
          <div>
            <h2 className="text-xl font-extrabold text-brand-navy">{settings?.companyName || 'LH Transport'}</h2>
            <div className="text-xs text-slate-500 mt-1 space-y-0.5">
              {settings?.address && <p>{settings.address}</p>}
              <p>{[settings?.phone, settings?.email].filter(Boolean).join('   •   ')}</p>
              {settings?.website && <p>{settings.website}</p>}
              {settings?.taxNumber && <p>TPIN/VAT: {settings.taxNumber}</p>}
            </div>
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-extrabold text-brand-dark tracking-tight">INVOICE</h1>
          <p className="text-sm font-bold text-brand-navy mt-1">{invoiceNumber}</p>
          <span className={`inline-flex mt-2 items-center px-2.5 py-1 rounded-full text-xs font-semibold ${meta.badgeClass}`}>
            {meta.label}
          </span>
        </div>
      </div>

      <div className="h-[3px] bg-brand-primary rounded-full my-5" />

      {/* Bill to + meta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Bill To</p>
          <p className="font-bold text-brand-navy mt-1">{customer?.name || 'Select a customer'}</p>
          <div className="text-xs text-slate-500 mt-1 space-y-0.5">
            {customer?.contactPerson && <p>{customer.contactPerson}</p>}
            {customer?.phone && <p>{customer.phone}</p>}
            {customer?.email && <p>{customer.email}</p>}
            {customer?.address && <p>{customer.address}</p>}
            {customer?.taxNumber && <p>TPIN/VAT: {customer.taxNumber}</p>}
          </div>
        </div>
        <div className="space-y-1.5 text-xs">
          <MetaRow label="Invoice Date" value={formatDate(invoiceDate)} />
          <MetaRow label="Due Date" value={formatDate(dueDate)} />
          <MetaRow label="Currency" value={currency} />
          {referenceNumber && <MetaRow label="Reference No." value={referenceNumber} />}
          {customerPoNumber && <MetaRow label="Customer PO No." value={customerPoNumber} />}
        </div>
      </div>

      {/* Line items table */}
      <div className="mt-6 overflow-x-auto -mx-1 px-1">
        <table className="w-full text-xs min-w-[560px]">
          <thead>
            <tr className="bg-brand-navy text-white">
              <th className="text-left font-bold px-3 py-2.5 rounded-l-lg">Description</th>
              <th className="text-left font-bold px-3 py-2.5">Route / Vehicle</th>
              <th className="text-right font-bold px-3 py-2.5">Qty</th>
              <th className="text-right font-bold px-3 py-2.5">Rate</th>
              <th className="text-right font-bold px-3 py-2.5">Tax%</th>
              <th className="text-right font-bold px-3 py-2.5 rounded-r-lg">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-slate-400">No items added yet.</td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr key={idx} className={idx % 2 === 1 ? 'bg-brand-pale/60' : ''}>
                  <td className="px-3 py-2.5 align-top">
                    <p className="font-semibold text-brand-navy">{item.description || 'Untitled service'}</p>
                    {item.serviceType && <p className="text-slate-400 text-[11px] mt-0.5">{item.serviceType}</p>}
                  </td>
                  <td className="px-3 py-2.5 align-top text-slate-500">
                    {(item.pickupLocation || item.deliveryLocation) && (
                      <p>{[item.pickupLocation, item.deliveryLocation].filter(Boolean).join(' - ')}</p>
                    )}
                    {item.vehicleRegistration && <p>{item.vehicleRegistration}</p>}
                    {item.driver && <p>Driver: {item.driver}</p>}
                  </td>
                  <td className="px-3 py-2.5 align-top text-right text-slate-600">{item.quantity} {item.unit}</td>
                  <td className="px-3 py-2.5 align-top text-right text-slate-600">{formatMoney(item.rate, '').trim()}</td>
                  <td className="px-3 py-2.5 align-top text-right text-slate-600">{item.taxPercent}%</td>
                  <td className="px-3 py-2.5 align-top text-right font-bold text-brand-navy">{formatMoney(item.total, '').trim()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="flex justify-end mt-5">
        <div className="w-full sm:w-72 space-y-1.5 text-sm">
          <SummaryRow label="Subtotal" value={formatMoney(subtotal, currency)} />
          <SummaryRow label="Discount" value={`- ${formatMoney(discountTotal, currency)}`} />
          <SummaryRow label="Tax" value={formatMoney(taxTotal, currency)} />
          {additionalCharges > 0 && <SummaryRow label="Additional Charges" value={formatMoney(additionalCharges, currency)} />}
          <div className="flex justify-between items-center bg-brand-navy text-white rounded-lg px-3 py-2.5 mt-2">
            <span className="font-bold">Total</span>
            <span className="font-bold">{formatMoney(total, currency)}</span>
          </div>
          <SummaryRow label="Amount Paid" value={formatMoney(amountPaid, currency)} />
          <div className="flex justify-between items-center pt-1">
            <span className="font-bold text-brand-dark">Balance Due</span>
            <span className="font-bold text-brand-dark">{formatMoney(balance, currency)}</span>
          </div>
        </div>
      </div>

      {notes && (
        <div className="mt-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Notes</p>
          <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">{notes}</p>
        </div>
      )}

      {(settings?.bankName || settings?.mobileMoneyDetails) && (
        <div className="mt-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Payment Details</p>
          <div className="text-xs text-slate-600 mt-1 space-y-0.5">
            {settings?.bankName && <p>Bank: {settings.bankName}</p>}
            {settings?.bankAccountName && <p>Account Name: {settings.bankAccountName}</p>}
            {settings?.bankAccountNumber && <p>Account No: {settings.bankAccountNumber}</p>}
            {settings?.bankBranch && <p>Branch: {settings.bankBranch}</p>}
            {settings?.mobileMoneyDetails && <p>Mobile Money: {settings.mobileMoneyDetails}</p>}
          </div>
        </div>
      )}

      {settings?.termsAndConditions && (
        <div className="mt-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Terms &amp; Conditions</p>
          <p className="text-[11px] text-slate-500 mt-1 whitespace-pre-wrap">{settings.termsAndConditions}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 mt-10">
        <div className="border-t border-slate-200 pt-2 text-xs text-slate-400">Authorized Signature</div>
        <div className="border-t border-slate-200 pt-2 text-xs text-slate-400">Customer Acceptance</div>
      </div>

      {settings?.invoiceFooter && (
        <p className="text-center text-xs font-semibold text-brand-dark italic mt-6">{settings.invoiceFooter}</p>
      )}
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-brand-navy">{value}</span>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-slate-500">
      <span>{label}</span>
      <span className="text-brand-navy font-medium">{value}</span>
    </div>
  );
}
