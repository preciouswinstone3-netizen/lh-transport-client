import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Phone, Mail, MapPin, FileText, TrendingUp, Wallet, AlertCircle } from 'lucide-react';
import { getCustomer } from '../api/customers';
import { Card, CardHeader, StatusBadge, EmptyState } from '../components/ui/Card';
import { StatCard } from '../components/dashboard/StatCard';
import { formatMoney, formatDate } from '../utils/format';

export default function CustomerViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ['customer', id], queryFn: () => getCustomer(id!), enabled: !!id });

  if (isLoading || !data) {
    return <div className="p-10 text-center text-slate-400">Loading customer...</div>;
  }

  const { customer, summary, invoices } = data;

  return (
    <div className="space-y-5 animate-fadeIn">
      <button onClick={() => navigate('/customers')} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
        <ArrowLeft className="h-4 w-4" /> Back to Customers
      </button>

      <Card className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl bg-brand-pale text-brand-dark font-extrabold text-xl flex items-center justify-center shrink-0">
            {customer.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-brand-navy">{customer.name}</h2>
            <p className="text-sm text-slate-400">{customer.contactPerson}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
              {customer.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {customer.phone}</span>}
              {customer.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {customer.email}</span>}
              {customer.address && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {customer.address}</span>}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Invoices" value={String(summary.totalInvoices)} icon={FileText} />
        <StatCard label="Total Billed" value={formatMoney(summary.totalInvoiced)} icon={TrendingUp} tone="primary" />
        <StatCard label="Total Paid" value={formatMoney(summary.totalPaid)} icon={Wallet} tone="success" />
        <StatCard label="Outstanding" value={formatMoney(summary.outstanding)} icon={AlertCircle} tone="warning" />
      </div>

      <Card>
        <CardHeader title="Invoice History" />
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase">Invoice #</th>
                <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase text-right">Total</th>
                <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase text-right">Balance</th>
                <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50/70">
                  <td className="px-5 py-3">
                    <Link to={`/invoices/${inv.id}`} className="font-semibold text-brand-dark hover:underline">{inv.invoiceNumber}</Link>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(inv.invoiceDate)}</td>
                  <td className="px-5 py-3 text-right font-semibold text-brand-navy">{formatMoney(inv.total, inv.currency)}</td>
                  <td className="px-5 py-3 text-right font-semibold text-brand-navy">{formatMoney(inv.balance, inv.currency)}</td>
                  <td className="px-5 py-3"><StatusBadge status={inv.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="md:hidden divide-y divide-slate-50">
          {invoices.map((inv) => (
            <Link to={`/invoices/${inv.id}`} key={inv.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-semibold text-brand-dark">{inv.invoiceNumber}</p>
                <p className="text-xs text-slate-400">{formatDate(inv.invoiceDate)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-brand-navy">{formatMoney(inv.total, inv.currency)}</p>
                <StatusBadge status={inv.status} />
              </div>
            </Link>
          ))}
        </div>
        {invoices.length === 0 && <EmptyState title="No invoices yet" message="This customer has no invoices on record." icon={FileText} />}
      </Card>
    </div>
  );
}
