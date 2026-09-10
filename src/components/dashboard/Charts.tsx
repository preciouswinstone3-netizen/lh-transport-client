import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardHeader } from '../ui/Card';
import { formatMoney, statusMeta } from '../../utils/format';

const PIE_COLORS: Record<string, string> = {
  paid: '#10b981',
  partially_paid: '#f59e0b',
  sent: '#149af7',
  draft: '#94a3b8',
  overdue: '#ef4444',
  cancelled: '#cbd5e1',
};

export function RevenueTrendChart({ data }: { data: { label: string; total: number }[] }) {
  return (
    <Card>
      <CardHeader title="Revenue Trend" subtitle="Total invoiced amount, last 6 months" />
      <div className="h-64 px-2 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#149af7" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#149af7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              width={56}
              tickFormatter={(v) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v)}
            />
            <Tooltip
              formatter={(value: number) => formatMoney(value)}
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
            />
            <Area type="monotone" dataKey="total" stroke="#0146af" strokeWidth={2.5} fill="url(#revenueFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function InvoiceVolumeChart({ data }: { data: { label: string; volume: number }[] }) {
  return (
    <Card>
      <CardHeader title="Monthly Invoice Volume" subtitle="Number of invoices created" />
      <div className="h-64 px-2 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
            <Bar dataKey="volume" fill="#149af7" radius={[6, 6, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function StatusBreakdownChart({ data }: { data: { status: string; count: number }[] }) {
  const filtered = data.filter((d) => d.count > 0);
  return (
    <Card>
      <CardHeader title="Paid vs Unpaid" subtitle="Invoice status breakdown" />
      <div className="h-64 px-2 pb-4 flex items-center">
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-400 text-center w-full">No invoices yet.</p>
        ) : (
          <>
            <ResponsiveContainer width="55%" height="100%">
              <PieChart>
                <Pie data={filtered} dataKey="count" nameKey="status" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {filtered.map((entry) => (
                    <Cell key={entry.status} fill={PIE_COLORS[entry.status] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2 pl-2">
              {filtered.map((entry) => (
                <div key={entry.status} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[entry.status] || '#94a3b8' }} />
                  <span className="text-slate-600 truncate">{statusMeta(entry.status).label}</span>
                  <span className="ml-auto font-semibold text-brand-navy">{entry.count}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
