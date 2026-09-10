import { HTMLAttributes } from 'react';
import clsx from 'clsx';
import { Inbox } from 'lucide-react';
import { statusMeta } from '../../utils/format';

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('bg-white rounded-2xl border border-slate-100 shadow-card', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
      <div>
        <h3 className="text-sm font-bold text-brand-navy tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const meta = statusMeta(status);
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap',
        meta.badgeClass
      )}
    >
      {meta.label}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse bg-slate-200/70 rounded-md', className)} />;
}

export function EmptyState({
  title,
  message,
  icon: Icon = Inbox,
  action,
}: {
  title: string;
  message?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="h-14 w-14 rounded-2xl bg-brand-pale flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-brand-primary" />
      </div>
      <h4 className="text-sm font-bold text-brand-navy">{title}</h4>
      {message && <p className="text-sm text-slate-500 mt-1 max-w-sm">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
