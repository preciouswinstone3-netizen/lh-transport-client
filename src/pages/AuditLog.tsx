import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { listAuditLogs } from '../api/misc';
import { Card, EmptyState, Skeleton } from '../components/ui/Card';
import { Pagination } from '../components/ui/Pagination';
import { formatDate } from '../utils/format';

const ACTION_LABELS: Record<string, string> = {
  'user.login': 'Logged in',
  'user.logout': 'Logged out',
  'user.create': 'Created administrator',
  'user.update': 'Updated administrator',
  'user.delete': 'Removed administrator',
  'invoice.create': 'Created invoice',
  'invoice.update': 'Updated invoice',
  'invoice.delete': 'Deleted invoice',
  'invoice.duplicate': 'Duplicated invoice',
  'invoice.pdf_download': 'Downloaded PDF',
  'invoice.status_change': 'Changed invoice status',
  'payment.record': 'Recorded payment',
  'customer.create': 'Created customer',
  'customer.update': 'Updated customer',
  'customer.delete': 'Deleted customer',
  'settings.update': 'Updated company settings',
  'system.seed': 'System event',
};

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page],
    queryFn: () => listAuditLogs({ page, pageSize: 25 }),
    placeholderData: (prev) => prev,
  });

  return (
    <div className="space-y-4 animate-fadeIn">
      <Card>
        <div className="divide-y divide-slate-50">
          {isLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : data?.data.length ? (
            data.data.map((log) => (
              <div key={log.id} className="flex items-start gap-3 px-5 py-3.5">
                <div className="h-8 w-8 rounded-full bg-brand-pale flex items-center justify-center text-brand-dark font-bold text-xs shrink-0 mt-0.5">
                  {log.userName?.charAt(0) || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-brand-navy">
                    <span className="font-semibold">{log.userName || 'System'}</span>{' '}
                    <span className="text-slate-500">{ACTION_LABELS[log.action] || log.action}</span>
                  </p>
                  {log.description && <p className="text-xs text-slate-400 mt-0.5">{log.description}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-400">{formatDate(log.createdAt, 'dd MMM yyyy')}</p>
                  <p className="text-[11px] text-slate-300">{formatDate(log.createdAt, 'HH:mm')}</p>
                </div>
              </div>
            ))
          ) : (
            <EmptyState title="No activity yet" message="System actions will appear here as they happen." icon={ShieldCheck} />
          )}
        </div>
        {data && (
          <div className="px-4">
            <Pagination page={page} totalPages={data.pagination.totalPages} onChange={setPage} total={data.pagination.total} pageSize={data.pagination.pageSize} />
          </div>
        )}
      </Card>
    </div>
  );
}
