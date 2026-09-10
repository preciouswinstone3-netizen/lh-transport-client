import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Download,
  Copy,
  Trash2,
  Eye,
  Pencil,
  CheckCircle2,
  FileText,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { listInvoices, deleteInvoice, duplicateInvoice, downloadInvoicePdf, changeInvoiceStatus } from '../api/invoices';
import { listCustomers } from '../api/customers';
import { useAuthStore } from '../store/authStore';
import { Card, StatusBadge, EmptyState, Skeleton } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Field';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmDialog } from '../components/ui/Modal';
import { formatMoney, formatDate } from '../utils/format';
import { useDebounce } from '../hooks/useDebounce';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'partially_paid', label: 'Partially Paid' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'highest', label: 'Highest Amount' },
  { value: 'lowest', label: 'Lowest Amount' },
  { value: 'due_date', label: 'Due Date' },
];

export default function InvoicesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [status, setStatus] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', { search: debouncedSearch, status, customerId, dateFrom, dateTo, sort, page }],
    queryFn: () =>
      listInvoices({
        search: debouncedSearch || undefined,
        status: status || undefined,
        customerId: customerId || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        sort,
        page,
        pageSize: 12,
      }),
    placeholderData: (prev) => prev,
  });

  const { data: customersData } = useQuery({
    queryKey: ['customers-lite'],
    queryFn: () => listCustomers({ pageSize: 100 }),
  });

  const activeFilterCount = [status, customerId, dateFrom, dateTo].filter(Boolean).length;

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusyId(deleteTarget);
    try {
      await deleteInvoice(deleteTarget);
      toast.success('Invoice deleted.');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
      setDeleteTarget(null);
    }
  }

  async function handleDuplicate(id: string) {
    setBusyId(id);
    try {
      const inv = await duplicateInvoice(id);
      toast.success(`Duplicated as ${inv.invoiceNumber}`);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      navigate(`/invoices/${inv.id}/edit`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDownload(id: string, invoiceNumber: string) {
    setBusyId(id);
    try {
      await downloadInvoicePdf(id, invoiceNumber);
    } catch (err: any) {
      toast.error('Something went wrong while generating the invoice. Please try again.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleMarkPaid(id: string) {
    setBusyId(id);
    try {
      await changeInvoiceStatus(id, 'paid');
      toast.success('Invoice marked as paid.');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Search + filters bar */}
      <Card className="p-3 sm:p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search invoice #, customer, phone, vehicle, driver..."
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setFiltersOpen((v) => !v)}
            className="shrink-0 relative"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-brand-primary text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <Link to="/invoices/new" className="hidden sm:block">
            <Button>
              <Plus className="h-4 w-4" /> Create Invoice
            </Button>
          </Link>
        </div>

        {filtersOpen && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-3 pt-3 border-t border-slate-100 animate-fadeIn">
            <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
            <Select value={customerId} onChange={(e) => { setCustomerId(e.target.value); setPage(1); }}>
              <option value="">All Customers</option>
              {customersData?.data.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} placeholder="From" />
            <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} placeholder="To" />
            <Select value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
            {activeFilterCount > 0 && (
              <button
                onClick={() => { setStatus(''); setCustomerId(''); setDateFrom(''); setDateTo(''); setPage(1); }}
                className="flex items-center gap-1 text-xs font-semibold text-red-600 col-span-2 sm:col-span-1"
              >
                <X className="h-3.5 w-3.5" /> Clear filters
              </button>
            )}
          </div>
        )}
      </Card>

      {/* Desktop table */}
      <Card className="hidden md:block overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <Th>Invoice #</Th>
                <Th>Customer</Th>
                <Th>Date</Th>
                <Th>Due Date</Th>
                <Th align="right">Total</Th>
                <Th align="right">Paid</Th>
                <Th align="right">Balance</Th>
                <Th>Status</Th>
                <Th>Created By</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    {Array.from({ length: 10 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : data?.data.length ? (
                data.data.map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/invoices/${inv.id}`} className="font-semibold text-brand-dark hover:underline">
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-brand-navy">{inv.customerName}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(inv.invoiceDate)}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(inv.dueDate)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-brand-navy">{formatMoney(inv.total, inv.currency)}</td>
                    <td className="px-4 py-3 text-right text-slate-500">{formatMoney(inv.amountPaid, inv.currency)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-brand-navy">{formatMoney(inv.balance, inv.currency)}</td>
                    <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{inv.createdByName}</td>
                    <td className="px-4 py-3">
                      <RowActions
                        inv={inv}
                        isAdmin={user?.role === 'admin'}
                        busy={busyId === inv.id}
                        onView={() => navigate(`/invoices/${inv.id}`)}
                        onEdit={() => navigate(`/invoices/${inv.id}/edit`)}
                        onDuplicate={() => handleDuplicate(inv.id)}
                        onDownload={() => handleDownload(inv.id, inv.invoiceNumber)}
                        onMarkPaid={() => handleMarkPaid(inv.id)}
                        onDelete={() => setDeleteTarget(inv.id)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10}>
                    <EmptyState
                      title="No invoices found"
                      message="Try adjusting your search or filters, or create a new invoice."
                      icon={FileText}
                      action={<Link to="/invoices/new"><Button size="sm"><Plus className="h-4 w-4" />Create Invoice</Button></Link>}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {data && <div className="px-4"><Pagination page={page} totalPages={data.pagination.totalPages} onChange={setPage} total={data.pagination.total} pageSize={data.pagination.pageSize} /></div>}
      </Card>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
        ) : data?.data.length ? (
          data.data.map((inv) => (
            <Card key={inv.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link to={`/invoices/${inv.id}`} className="font-bold text-brand-dark text-sm">{inv.invoiceNumber}</Link>
                  <p className="text-sm text-brand-navy truncate">{inv.customerName}</p>
                </div>
                <StatusBadge status={inv.status} />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                <div>
                  <p className="text-slate-400">Date</p>
                  <p className="font-semibold text-brand-navy">{formatDate(inv.invoiceDate)}</p>
                </div>
                <div>
                  <p className="text-slate-400">Total</p>
                  <p className="font-semibold text-brand-navy">{formatMoney(inv.total, inv.currency)}</p>
                </div>
                <div>
                  <p className="text-slate-400">Balance</p>
                  <p className="font-semibold text-brand-navy">{formatMoney(inv.balance, inv.currency)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-50">
                <RowActions
                  inv={inv}
                  isAdmin={user?.role === 'admin'}
                  busy={busyId === inv.id}
                  compact
                  onView={() => navigate(`/invoices/${inv.id}`)}
                  onEdit={() => navigate(`/invoices/${inv.id}/edit`)}
                  onDuplicate={() => handleDuplicate(inv.id)}
                  onDownload={() => handleDownload(inv.id, inv.invoiceNumber)}
                  onMarkPaid={() => handleMarkPaid(inv.id)}
                  onDelete={() => setDeleteTarget(inv.id)}
                />
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <EmptyState
              title="No invoices found"
              message="Try adjusting your search or filters, or create a new invoice."
              icon={FileText}
              action={<Link to="/invoices/new"><Button size="sm"><Plus className="h-4 w-4" />Create Invoice</Button></Link>}
            />
          </Card>
        )}
        {data && <Pagination page={page} totalPages={data.pagination.totalPages} onChange={setPage} total={data.pagination.total} pageSize={data.pagination.pageSize} />}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Invoice"
        message="This will permanently delete the invoice and its payment history. This action cannot be undone."
        confirmLabel="Delete"
        danger
        loading={!!busyId}
      />
    </div>
  );
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide ${align === 'right' ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  );
}

function RowActions({
  inv,
  isAdmin,
  busy,
  compact,
  onView,
  onEdit,
  onDuplicate,
  onDownload,
  onMarkPaid,
  onDelete,
}: {
  inv: { id: string; status: string };
  isAdmin: boolean;
  busy: boolean;
  compact?: boolean;
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDownload: () => void;
  onMarkPaid: () => void;
  onDelete: () => void;
}) {
  const iconClass = 'h-3.5 w-3.5';
  return (
    <div className={`flex items-center gap-1 ${compact ? 'flex-wrap' : 'justify-end'}`}>
      <IconBtn label="View" onClick={onView}><Eye className={iconClass} /></IconBtn>
      <IconBtn label="Edit" onClick={onEdit}><Pencil className={iconClass} /></IconBtn>
      <IconBtn label="Duplicate" onClick={onDuplicate} disabled={busy}><Copy className={iconClass} /></IconBtn>
      <IconBtn label="Download PDF" onClick={onDownload} disabled={busy}><Download className={iconClass} /></IconBtn>
      {inv.status !== 'paid' && inv.status !== 'cancelled' && (
        <IconBtn label="Mark Paid" onClick={onMarkPaid} disabled={busy} tone="success"><CheckCircle2 className={iconClass} /></IconBtn>
      )}
      {isAdmin && (
        <IconBtn label="Delete" onClick={onDelete} tone="danger"><Trash2 className={iconClass} /></IconBtn>
      )}
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
  tone,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'success' | 'danger';
}) {
  const toneClass =
    tone === 'success' ? 'hover:bg-emerald-50 hover:text-emerald-600' : tone === 'danger' ? 'hover:bg-red-50 hover:text-red-600' : 'hover:bg-slate-100';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`h-8 w-8 flex items-center justify-center rounded-lg text-slate-500 transition-colors disabled:opacity-40 ${toneClass}`}
    >
      {children}
    </button>
  );
}
