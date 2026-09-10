import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, Plus, Pencil, Trash2, Users, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { listCustomers, deleteCustomer } from '../api/customers';
import type { Customer } from '../types';
import { Card, EmptyState, Skeleton } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Field';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmDialog } from '../components/ui/Modal';
import { CustomerFormModal } from '../components/customers/CustomerFormModal';
import { useAuthStore } from '../store/authStore';
import { useDebounce } from '../hooks/useDebounce';
import { formatDate } from '../utils/format';

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [busy, setBusy] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['customers', { search: debouncedSearch, page }],
    queryFn: () => listCustomers({ search: debouncedSearch || undefined, page, pageSize: 12 }),
    placeholderData: (prev) => prev,
  });

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await deleteCustomer(deleteTarget.id);
      toast.success('Customer deleted.');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
      setDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      <Card className="p-3 sm:p-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, phone, email, or reference..."
            className="pl-9"
          />
        </div>
        <Button onClick={() => { setEditing(null); setModalOpen(true); }} className="shrink-0">
          <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add Customer</span>
        </Button>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      ) : data?.data.length ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.data.map((c) => (
              <Card key={c.id} className="p-4 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/customers/${c.id}`} className="flex items-center gap-2.5 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-brand-pale text-brand-dark font-bold flex items-center justify-center shrink-0">
                      {c.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-brand-navy truncate">{c.name}</p>
                      <p className="text-xs text-slate-400 truncate">{c.contactPerson || 'No contact person'}</p>
                    </div>
                  </Link>
                </div>
                <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                  {c.phone && <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {c.phone}</p>}
                  {c.email && <p className="flex items-center gap-1.5 truncate"><Mail className="h-3 w-3 shrink-0" /> {c.email}</p>}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                  <p className="text-[11px] text-slate-400">Added {formatDate(c.createdAt)}</p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditing(c); setModalOpen(true); }}
                      className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
                      aria-label={`Edit ${c.name}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => setDeleteTarget(c)}
                        className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Delete ${c.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Pagination page={page} totalPages={data.pagination.totalPages} onChange={setPage} total={data.pagination.total} pageSize={data.pagination.pageSize} />
        </>
      ) : (
        <Card>
          <EmptyState
            title="No customers found"
            message="Add your first customer to start creating invoices."
            icon={Users}
            action={<Button size="sm" onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" />Add Customer</Button>}
          />
        </Card>
      )}

      <CustomerFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        customer={editing}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['customers'] })}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Customers with existing invoices cannot be deleted.`}
        confirmLabel="Delete"
        danger
        loading={busy}
      />
    </div>
  );
}
