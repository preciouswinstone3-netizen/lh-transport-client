import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  FileText,
  Wallet,
  AlertCircle,
  TrendingUp,
  Plus,
  Users,
  BarChart3,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { fetchDashboard } from '../api/misc';
import { StatCard } from '../components/dashboard/StatCard';
import { RevenueTrendChart, InvoiceVolumeChart, StatusBreakdownChart } from '../components/dashboard/Charts';
import { Card, CardHeader, StatusBadge, EmptyState, Skeleton } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatMoney, formatDate } from '../utils/format';

export default function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: fetchDashboard });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuickAction to="/invoices/new" icon={Plus} label="Create Invoice" primary />
        <QuickAction to="/customers" icon={Users} label="Customers" />
        <QuickAction to="/invoices" icon={FileText} label="Invoices" />
        <QuickAction to="/reports" icon={BarChart3} label="Reports" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Invoiced" value={formatMoney(data?.stats.totalInvoiced)} icon={TrendingUp} tone="primary" loading={isLoading} />
        <StatCard label="Amount Paid" value={formatMoney(data?.stats.totalPaidAmount)} icon={Wallet} tone="success" loading={isLoading} />
        <StatCard label="Outstanding" value={formatMoney(data?.stats.outstanding)} icon={AlertCircle} tone="warning" loading={isLoading} />
        <StatCard label="Total Invoices" value={String(data?.stats.totalInvoices ?? 0)} icon={FileText} loading={isLoading} hint={`${data?.stats.invoicesThisMonth ?? 0} this month`} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <MiniStat label="Paid" value={data?.stats.paid} tone="success" loading={isLoading} />
        <MiniStat label="Unpaid" value={data?.stats.unpaid} tone="default" loading={isLoading} />
        <MiniStat label="Partially Paid" value={data?.stats.partiallyPaid} tone="warning" loading={isLoading} />
        <MiniStat label="Overdue" value={data?.stats.overdue} tone="danger" loading={isLoading} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="lg:col-span-2">
          <RevenueTrendChart data={data?.revenueTrend || []} />
        </div>
        <StatusBreakdownChart data={data?.statusBreakdown || []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="lg:col-span-2">
          <InvoiceVolumeChart data={data?.revenueTrend?.map((r) => ({ label: r.label, volume: r.volume })) || []} />
        </div>
        <Card>
          <CardHeader title="Top Customers" subtitle="By total amount billed" />
          <div className="px-5 pb-5 space-y-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
            ) : data?.topCustomers.length ? (
              data.topCustomers.map((tc, idx) => (
                <Link
                  to={`/customers/${tc.customer.id}`}
                  key={tc.customer.id}
                  className="flex items-center gap-3 hover:bg-slate-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                >
                  <span className="h-7 w-7 rounded-full bg-brand-pale text-brand-dark text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-brand-navy font-medium truncate flex-1">{tc.customer.name}</span>
                  <span className="text-xs font-bold text-slate-500 shrink-0">{formatMoney(tc.total)}</span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate-400">No customer data yet.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent Invoices"
            subtitle="Recently created and updated"
            action={
              <Link to="/invoices" className="text-xs font-semibold text-brand-dark flex items-center gap-1 hover:underline">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <div className="divide-y divide-slate-50">
            {isLoading ? (
              <div className="px-5 pb-5 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : data?.recentInvoices.length ? (
              data.recentInvoices.map((inv) => (
                <Link
                  to={`/invoices/${inv.id}`}
                  key={inv.id}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-brand-navy truncate">{inv.invoiceNumber}</p>
                    <p className="text-xs text-slate-500 truncate">{inv.customerName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-brand-navy">{formatMoney(inv.total, inv.currency)}</p>
                    <p className="text-[11px] text-slate-400">{formatDate(inv.invoiceDate)}</p>
                  </div>
                  <StatusBadge status={inv.status} />
                </Link>
              ))
            ) : (
              <EmptyState title="No invoices yet" message="Create your first invoice to see it here." icon={FileText} />
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Recent Customers" />
          <div className="divide-y divide-slate-50">
            {isLoading ? (
              <div className="px-5 pb-5 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : data?.recentCustomers.length ? (
              data.recentCustomers.map((c) => (
                <Link to={`/customers/${c.id}`} key={c.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-brand-pale text-brand-dark text-xs font-bold flex items-center justify-center shrink-0">
                    {c.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-brand-navy truncate">{c.name}</p>
                    <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Added {formatDate(c.createdAt)}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState title="No customers yet" icon={Users} />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
  primary,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link to={to}>
      <Button variant={primary ? 'primary' : 'outline'} fullWidth size="md" className="justify-start h-full py-3.5">
        <Icon className="h-4 w-4" />
        <span className="truncate">{label}</span>
      </Button>
    </Link>
  );
}

function MiniStat({
  label,
  value,
  tone,
  loading,
}: {
  label: string;
  value?: number;
  tone: 'default' | 'success' | 'warning' | 'danger';
  loading?: boolean;
}) {
  const dotClass = {
    default: 'bg-slate-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
  }[tone];
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-card px-4 py-3 flex items-center gap-2.5">
      <span className={`h-2 w-2 rounded-full shrink-0 ${dotClass}`} />
      <span className="text-xs text-slate-500 font-medium truncate">{label}</span>
      {loading ? <Skeleton className="h-4 w-8 ml-auto" /> : <span className="ml-auto text-sm font-bold text-brand-navy">{value ?? 0}</span>}
    </div>
  );
}
