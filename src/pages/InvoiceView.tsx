import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Pencil, Copy, Download, Printer, Trash2, Wallet, ArrowLeft, Share2 } from 'lucide-react';
import {
  getInvoice,
  duplicateInvoice,
  downloadInvoicePdf,
  deleteInvoice,
  recordPayment,
} from '../api/invoices';
import { fetchSettings } from '../api/misc';
import { useAuthStore } from '../store/authStore';
import { Card, CardHeader, StatusBadge } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea, FormField } from '../components/ui/Field';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { InvoicePreview } from '../components/invoice/InvoicePreview';
import { formatMoney, formatDate, todayIso } from '../utils/format';

const PAYMENT_METHODS = ['Bank Transfer', 'Mobile Money', 'Cash', 'Cheque', 'Card'];

export default function InvoiceViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({ queryKey: ['invoice', id], queryFn: () => getInvoice(id!), enabled: !!id });
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings });

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (isLoading || !data) {
    return <div className="p-10 text-center text-slate-400">Loading invoice...</div>;
  }

  const { invoice, payments } = data;

  async function handleDuplicate() {
    setBusy(true);
    try {
      const dup = await duplicateInvoice(invoice.id);
      toast.success(`Duplicated as ${dup.invoiceNumber}`);
      navigate(`/invoices/${dup.id}/edit`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDownload() {
    setBusy(true);
    try {
      await downloadInvoicePdf(invoice.id, invoice.invoiceNumber);
    } catch {
      toast.error('Something went wrong while generating the invoice. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await deleteInvoice(invoice.id);
      toast.success('Invoice deleted.');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      navigate('/invoices');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({ title: `Invoice ${invoice.invoiceNumber}`, text: `Invoice ${invoice.invoiceNumber} from LH Transport` });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Invoice link copied to clipboard.');
      }
    } catch {
      /* user cancelled share sheet */
    }
  }

  return (
    <div className="animate-fadeIn space-y-5">
      <div className="flex items-center justify-between no-print">
        <button onClick={() => navigate('/invoices')} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
          <ArrowLeft className="h-4 w-4" /> Back to Invoices
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 no-print">
        <Button variant="outline" size="sm" onClick={() => navigate(`/invoices/${invoice.id}/edit`)}>
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Button>
        <Button variant="outline" size="sm" onClick={handleDuplicate} loading={busy}>
          <Copy className="h-3.5 w-3.5" /> Duplicate
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload} loading={busy}>
          <Download className="h-3.5 w-3.5" /> Download PDF
        </Button>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="h-3.5 w-3.5" /> Print
        </Button>
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="h-3.5 w-3.5" /> Share
        </Button>
        {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
          <Button size="sm" onClick={() => setPaymentModalOpen(true)}>
            <Wallet className="h-3.5 w-3.5" /> Record Payment
          </Button>
        )}
        {user?.role === 'admin' && (
          <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)} className="ml-auto">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <InvoicePreview
            invoiceNumber={invoice.invoiceNumber}
            invoiceDate={invoice.invoiceDate}
            dueDate={invoice.dueDate}
            status={invoice.status}
            currency={invoice.currency}
            referenceNumber={invoice.referenceNumber}
            customerPoNumber={invoice.customerPoNumber}
            notes={invoice.notes}
            customer={invoice.customer}
            items={invoice.items || []}
            subtotal={invoice.subtotal}
            discountTotal={invoice.discountTotal}
            taxTotal={invoice.taxTotal}
            additionalCharges={invoice.additionalCharges}
            total={invoice.total}
            amountPaid={invoice.amountPaid}
            balance={invoice.balance}
            settings={settings}
          />
        </div>

        <div className="space-y-5 no-print">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-brand-navy">Status</h3>
              <StatusBadge status={invoice.status} />
            </div>
            <div className="space-y-2 text-sm">
              <Row label="Total" value={formatMoney(invoice.total, invoice.currency)} />
              <Row label="Amount Paid" value={formatMoney(invoice.amountPaid, invoice.currency)} />
              <Row label="Balance Due" value={formatMoney(invoice.balance, invoice.currency)} accent />
              <Row label="Created By" value={invoice.createdByName || '—'} />
              <Row label="Created On" value={formatDate(invoice.createdAt, 'dd MMM yyyy, HH:mm')} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Payment History" subtitle={`${payments.length} payment${payments.length === 1 ? '' : 's'} recorded`} />
            <div className="px-5 pb-5 space-y-3">
              {payments.length === 0 ? (
                <p className="text-sm text-slate-400">No payments recorded yet.</p>
              ) : (
                payments.map((p) => (
                  <div key={p.id} className="flex items-start justify-between gap-2 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-brand-navy">{formatMoney(p.amount, invoice.currency)}</p>
                      <p className="text-xs text-slate-400">{p.paymentMethod} &middot; {formatDate(p.paymentDate)}</p>
                      {p.reference && <p className="text-xs text-slate-400">Ref: {p.reference}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      <RecordPaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        invoiceId={invoice.id}
        balance={invoice.balance}
        currency={invoice.currency}
        onRecorded={() => queryClient.invalidateQueries({ queryKey: ['invoice', id] })}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Invoice"
        message="This will permanently delete this invoice and its payment history. This action cannot be undone."
        confirmLabel="Delete"
        danger
        loading={busy}
      />
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold ${accent ? 'text-brand-dark' : 'text-brand-navy'}`}>{value}</span>
    </div>
  );
}

function RecordPaymentModal({
  open,
  onClose,
  invoiceId,
  balance,
  currency,
  onRecorded,
}: {
  open: boolean;
  onClose: () => void;
  invoiceId: string;
  balance: number;
  currency: string;
  onRecorded: () => void;
}) {
  const [amount, setAmount] = useState(balance);
  const [paymentDate, setPaymentDate] = useState(todayIso());
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (amount <= 0) {
      setError('Payment amount must be greater than zero.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await recordPayment(invoiceId, { amount, paymentDate, paymentMethod, reference, notes });
      toast.success('Payment recorded.');
      onRecorded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Unable to record payment.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Record Payment">
      <div className="space-y-4">
        <p className="text-xs text-slate-500">
          Outstanding balance: <span className="font-bold text-brand-dark">{formatMoney(balance, currency)}</span>
        </p>
        <FormField label={`Amount (${currency})`} required>
          <Input type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Payment Date" required>
            <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
          </FormField>
          <FormField label="Payment Method" required>
            <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </Select>
          </FormField>
        </div>
        <FormField label="Reference">
          <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Transaction reference" />
        </FormField>
        <FormField label="Notes">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </FormField>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} loading={saving}>Record Payment</Button>
        </div>
      </div>
    </Modal>
  );
}
