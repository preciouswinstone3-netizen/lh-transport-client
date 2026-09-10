import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export function Pagination({
  page,
  totalPages,
  onChange,
  total,
  pageSize,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  total?: number;
  pageSize?: number;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 px-1 py-3 flex-wrap">
      {typeof total === 'number' && typeof pageSize === 'number' && (
        <p className="text-xs text-slate-500">
          Showing {Math.min((page - 1) * pageSize + 1, total)}&ndash;{Math.min(page * pageSize, total)} of {total}
        </p>
      )}
      <div className="flex items-center gap-1.5 ml-auto">
        <Button variant="outline" size="sm" onClick={() => onChange(page - 1)} disabled={page <= 1}>
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        <span className="text-xs font-semibold text-slate-600 px-2">
          Page {page} of {totalPages}
        </span>
        <Button variant="outline" size="sm" onClick={() => onChange(page + 1)} disabled={page >= totalPages}>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
