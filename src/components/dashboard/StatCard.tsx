import clsx from 'clsx';
import { Skeleton } from '../ui/Card';

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'default',
  loading,
  hint,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  loading?: boolean;
  hint?: string;
}) {
  const toneClasses: Record<string, string> = {
    default: 'bg-brand-pale text-brand-dark',
    primary: 'bg-brand-dark text-white',
    success: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-amber-50 text-amber-600',
    danger: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-4 sm:p-5 flex items-start justify-between gap-3 hover:shadow-elevated transition-shadow duration-200">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500 truncate">{label}</p>
        {loading ? (
          <Skeleton className="h-7 w-24 mt-2" />
        ) : (
          <p className="text-xl sm:text-2xl font-extrabold text-brand-navy mt-1 tracking-tight truncate">{value}</p>
        )}
        {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
      </div>
      <div className={clsx('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', toneClasses[tone])}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}
