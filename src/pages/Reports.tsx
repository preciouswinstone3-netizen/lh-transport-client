import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, TrendingUp, FileText, Users, Printer } from 'lucide-react';
import { fetchRevenueReport, fetchInvoiceReport, fetchCustomerReport, reportCsvUrl } from '../api/misc';
import { Card, CardHeader, Skeleton } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select, Input, FormField } from '../components/ui/Field';
import { RevenueTrendChart } from '../components/dashboard/Charts';
import { formatMoney } from '../utils/format';

const GROUP_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function ReportsPage() {
  const [groupBy, setGroupBy] = useState('monthly');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: revenue, isLoading: loadingRevenue } = useQuery({
    queryKey: ['report-revenue', groupBy, dateFrom, dateTo],
    queryFn: () => fetchRevenueReport({ groupBy, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined }),
  });

  const { data: invoiceReport, isLoading: loadingInvoices } = useQuery({
    queryKey: ['report-invoices', dateFrom, dateTo],
    queryFn: () => fetchInvoiceReport({ dateFrom: dateFrom || undefined, dateTo: dateTo || undefined }),
  });

  const { data: customerReport, isLoading: loadingCustomers } = useQuery({
    queryKey: ['report-customers'],
    queryFn: fetchCustomerReport,
  });

  const chartData = revenue?.rows.map((r) => ({ label: r.period, total: r.totalInvoiced, volume: r.invoiceCount })) || [];

  return (
    <div className="space-y-5 animate-fadeIn">
      <Card className="p-4 flex flex-wrap items-end gap-3 no-print">
        <FormField label="Group By" className="w-40">
          <Select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            {GROUP_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </FormField>
        <FormField label="From" className="w-40">
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </FormField>
        <FormField label="To" className="w-40">
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </FormField>
        <Button variant="outline" onClick={() => window.print()} className="ml-auto">
          <Printer className="h-4 w-4" /> Print
        </Button>
      </Card>

      {/* Revenue report */}
      <Card>
        <CardHeader
          title="Revenue Report"
          subtitle="Invoiced amounts over time"
          action={
            <a href={reportCsvUrl('revenue', { groupBy, ...(dateFrom && { dateFrom }), ...(dateTo && { dateTo }) })} target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline"><Download className="h-3.5 w-3.5" /> Export CSV</Button>
            </a>
          }
        />
        <div className="px-5 pb-5">
          {loadingRevenue ? <Skeleton className="h-64 w-full" /> : <RevenueTrendChart data={chartData} />}
        </div>
        <div className="px-5 pb-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase">
                <th className="py-2">Period</th>
                <th className="py-2 text-right">Invoices</th>
                <th className="py-2 text-right">Total Invoiced</th>
                <th className="py-2 text-right">Total Paid</th>
              </tr>
            </thead>
            <tbody>
              {revenue?.rows.map((r) => (
                <tr key={r.period} className="border-b border-slate-50">
                  <td className="py-2 font-medium text-brand-navy">{r.period}</td>
                  <td className="py-2 text-right text-slate-500">{r.invoiceCount}</td>
                  <td className="py-2 text-right font-semibold text-brand-navy">{formatMoney(r.totalInvoiced)}</td>
                  <td className="py-2 text-right text-slate-500">{formatMoney(r.totalPaid)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invoice status report */}
      <Card>
        <CardHeader
          title="Invoice Report"
          subtitle="Status breakdown"
          action={
            <a href={reportCsvUrl('invoices', { ...(dateFrom && { dateFrom }), ...(dateTo && { dateTo }) })} target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline"><Download className="h-3.5 w-3.5" /> Export CSV</Button>
            </a>
          }
        />
        <div className="px-5 pb-5">
          {loadingInvoices ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <MiniStatBox label="Total" value={invoiceReport?.summary.total} icon={FileText} />
              <MiniStatBox label="Paid" value={invoiceReport?.summary.paid} tone="success" />
              <MiniStatBox label="Unpaid" value={invoiceReport?.summary.unpaid} />
              <MiniStatBox label="Draft" value={invoiceReport?.summary.draft} />
              <MiniStatBox label="Partial" value={invoiceReport?.summary.partiallyPaid} tone="warning" />
              <MiniStatBox label="Overdue" value={invoiceReport?.summary.overdue} tone="danger" />
              <MiniStatBox label="Cancelled" value={invoiceReport?.summary.cancelled} />
            </div>
          )}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <SummaryBox label="Total Invoiced" value={formatMoney(invoiceReport?.summary.totalInvoiced)} icon={TrendingUp} />
            <SummaryBox label="Total Paid" value={formatMoney(invoiceReport?.summary.totalPaid)} icon={TrendingUp} />
            <SummaryBox label="Outstanding" value={formatMoney(invoiceReport?.summary.outstanding)} icon={TrendingUp} />
          </div>
        </div>
      </Card>

      {/* Customer report */}
      <Card>
        <CardHeader
          title="Customer Report"
          subtitle="Top customers by amount billed"
          action={
            <a href={reportCsvUrl('customers')} target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline"><Download className="h-3.5 w-3.5" /> Export CSV</Button>
            </a>
          }
        />
        <div className="px-5 pb-5 overflow-x-auto">
          {loadingCustomers ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase">
                  <th className="py-2">Customer</th>
                  <th className="py-2 text-right">Invoices</th>
                  <th className="py-2 text-right">Billed</th>
                  <th className="py-2 text-right">Paid</th>
                  <th className="py-2 text-right">Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {customerReport?.rows.map((r) => (
                  <tr key={r.customer} className="border-b border-slate-50">
                    <td className="py-2 font-medium text-brand-navy flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-slate-400" /> {r.customer}
                    </td>
                    <td className="py-2 text-right text-slate-500">{r.totalInvoices}</td>
                    <td className="py-2 text-right font-semibold text-brand-navy">{formatMoney(r.totalBilled)}</td>
                    <td className="py-2 text-right text-slate-500">{formatMoney(r.totalPaid)}</td>
                    <td className="py-2 text-right font-semibold text-brand-dark">{formatMoney(r.outstanding)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}

function MiniStatBox({ label, value, tone, icon: Icon }: { label: string; value?: number; tone?: 'success' | 'warning' | 'danger'; icon?: React.ComponentType<{ className?: string }> }) {
  const toneMap: Record<string, string> = { success: 'text-emerald-600', warning: 'text-amber-600', danger: 'text-red-600' };
  const toneClass = tone ? toneMap[tone] : 'text-brand-navy';
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-3 text-center">
      <p className={`text-lg font-extrabold ${toneClass}`}>{value ?? 0}</p>
      <p className="text-[11px] text-slate-500 font-medium">{label}</p>
    </div>
  );
}

function SummaryBox({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-xl border border-slate-100 px-4 py-3 flex items-center gap-3">
      <div className="h-9 w-9 rounded-lg bg-brand-pale flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-brand-dark" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 truncate">{label}</p>
        <p className="text-sm font-bold text-brand-navy truncate">{value}</p>
      </div>
    </div>
  );
}
