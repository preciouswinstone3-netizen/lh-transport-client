import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Plus, Search, UserCircle2 } from 'lucide-react';
import { listCustomers } from '../../api/customers';
import type { Customer } from '../../types';

export function CustomerPicker({
  value,
  onSelect,
  onCreateNew,
}: {
  value: Customer | null;
  onSelect: (customer: Customer) => void;
  onCreateNew: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ['customers-picker', query],
    queryFn: () => listCustomers({ search: query, pageSize: 20 }),
    enabled: open,
  });

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left hover:border-brand-primary/50 transition-colors"
      >
        <UserCircle2 className="h-5 w-5 text-slate-400 shrink-0" />
        <div className="min-w-0 flex-1">
          {value ? (
            <>
              <p className="text-sm font-semibold text-brand-navy truncate">{value.name}</p>
              <p className="text-xs text-slate-400 truncate">{value.phone || value.email || 'No contact info'}</p>
            </>
          ) : (
            <p className="text-sm text-slate-400">Select or create a customer</p>
          )}
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full bg-white rounded-xl shadow-elevated border border-slate-100 overflow-hidden animate-fadeIn">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search customers..."
                className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-brand-primary outline-none"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto">
            {data?.data.length ? (
              data.data.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    onSelect(c);
                    setOpen(false);
                    setQuery('');
                  }}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-brand-pale/60 transition-colors"
                >
                  <p className="text-sm font-medium text-brand-navy truncate">{c.name}</p>
                  <p className="text-xs text-slate-400 truncate">{c.phone || c.email || '—'}</p>
                </button>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No customers found.</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              onCreateNew();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold text-brand-dark border-t border-slate-100 hover:bg-brand-pale/60 transition-colors"
          >
            <Plus className="h-4 w-4" /> Create New Customer
          </button>
        </div>
      )}
    </div>
  );
}
