import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Save, Send, Download, Eye, X, RotateCcw } from 'lucide-react';
import { getInvoice, createInvoice, updateInvoice, downloadInvoicePdf } from '../api/invoices';
import { fetchSettings } from '../api/misc';
import type { Customer, LineItem } from '../types';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea, FormField } from '../components/ui/Field';
import { Modal } from '../components/ui/Modal';
import { CustomerPicker } from '../components/invoice/CustomerPicker';
import { CustomerFormModal } from '../components/customers/CustomerFormModal';
import { LineItemCard } from '../components/invoice/LineItemCard';
import { InvoicePreview } from '../components/invoice/InvoicePreview';
import { newLineItem, todayIso, addDaysIso, calcInvoiceTotals, formatMoney } from '../utils/format';

const CURRENCIES = ['MWK', 'USD', 'ZAR', 'GBP', 'EUR'];
const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' },
];

interface FormState {
  customer: Customer | null;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  referenceNumber: string;
  customerPoNumber: string;
  notes: string;
  status: string;
  additionalCharges: number;
  amountPaid: number;
  items: LineItem[];
}

function draftKey(id: string) {
  return `lh_draft_invoice_${id}`;
}

function emptyState(defaultTaxRate = 16.5, currency = 'MWK', termDays = 14): FormState {
  return {
    customer: null,
    invoiceDate: todayIso(),
    dueDate: addDaysIso(termDays),
    currency,
    referenceNumber: '',
    customerPoNumber: '',
    notes: '',
    status: 'draft',
    additionalCharges: 0,
    amountPaid: 0,
    items: [{ ...newLineItem(), taxPercent: defaultTaxRate }],
  };
}

export default function InvoiceFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings });
  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => getInvoice(id!),
    enabled: isEdit,
  });

  const [form, setForm] = useState<FormState>(emptyState());
  const [initialized, setInitialized] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [draftBanner, setDraftBanner] = useState(false);
  const [savingAction, setSavingAction] = useState<'draft' | 'sent' | 'pdf' | null>(null);

  const key = draftKey(id || 'new');

  // Initialize form from existing invoice (edit) or defaults (create), then check for a recoverable draft.
  useEffect(() => {
    if (initialized) return;
    if (isEdit && !existing) return;

    const base: FormState = isEdit && existing
      ? {
          customer: existing.invoice.customer || null,
          invoiceDate: existing.invoice.invoiceDate.slice(0, 10),
          dueDate: existing.invoice.dueDate.slice(0, 10),
          currency: existing.invoice.currency,
          referenceNumber: existing.invoice.referenceNumber || '',
          customerPoNumber: existing.invoice.customerPoNumber || '',
          notes: existing.invoice.notes || '',
          status: existing.invoice.status,
          additionalCharges: existing.invoice.additionalCharges,
          amountPaid: existing.invoice.amountPaid,
          items: existing.invoice.items || [],
        }
      : emptyState(settings?.defaultTaxRate, settings?.defaultCurrency, settings?.defaultPaymentTermsDays);

    setForm(base);
    setInitialized(true);

    const draftRaw = localStorage.getItem(key);
    if (draftRaw) {
      try {
        const parsed = JSON.parse(draftRaw);
        if (JSON.stringify(parsed) !== JSON.stringify(base)) setDraftBanner(true);
      } catch {
        localStorage.removeItem(key);
      }
    }
  }, [isEdit, existing, initialized, settings, key]);

  // Autosave to localStorage.
  useEffect(() => {
    if (!initialized) return;
    const handle = setTimeout(() => localStorage.setItem(key, JSON.stringify(form)), 500);
    return () => clearTimeout(handle);
  }, [form, initialized, key]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = '';
    }
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  function restoreDraft() {
    const draftRaw = localStorage.getItem(key);
    if (draftRaw) {
      try {
        setForm(JSON.parse(draftRaw));
      } catch {
        /* ignore */
      }
    }
    setDraftBanner(false);
  }

  function discardDraft() {
    localStorage.removeItem(key);
    setDraftBanner(false);
  }

  function updateItem(index: number, patch: Partial<LineItem>) {
    setForm((f) => ({ ...f, items: f.items.map((it, i) => (i === index ? { ...it, ...patch } : it)) }));
  }

  function addItem() {
    setForm((f) => ({ ...f, items: [...f.items, { ...newLineItem(), taxPercent: settings?.defaultTaxRate ?? 16.5 }] }));
  }

  function removeItem(index: number) {
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== index) }));
  }

  const totals = useMemo(
    () => calcInvoiceTotals(form.items, form.additionalCharges, form.amountPaid),
    [form.items, form.additionalCharges, form.amountPaid]
  );

  function buildPayload(statusOverride?: string) {
    return {
      customerId: form.customer?.id,
      invoiceDate: form.invoiceDate,
      dueDate: form.dueDate,
      currency: form.currency,
      referenceNumber: form.referenceNumber || null,
      customerPoNumber: form.customerPoNumber || null,
      notes: form.notes || null,
      status: statusOverride || form.status,
      additionalCharges: Number(form.additionalCharges) || 0,
      amountPaid: Number(form.amountPaid) || 0,
      items: form.items.map((it) => ({
        ...it,
        quantity: Number(it.quantity) || 0,
        rate: Number(it.rate) || 0,
        discountPercent: Number(it.discountPercent) || 0,
        taxPercent: Number(it.taxPercent) || 0,
      })),
    };
  }

  function validate(): string | null {
    if (!form.customer) return 'Please select or create a customer.';
    if (form.items.length === 0) return 'Add at least one line item.';
    if (form.items.some((it) => !it.description.trim())) return 'Every line item needs a description.';
    if (!form.invoiceDate || !form.dueDate) return 'Invoice date and due date are required.';
    return null;
  }

  async function handleSave(statusOverride?: string, thenDownloadPdf?: boolean) {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    setSavingAction(thenDownloadPdf ? 'pdf' : statusOverride === 'sent' ? 'sent' : 'draft');
    try {
      const payload = buildPayload(statusOverride);
      const saved = isEdit ? await updateInvoice(id!, payload) : await createInvoice(payload);
      localStorage.removeItem(key);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      if (thenDownloadPdf) {
        await downloadInvoicePdf(saved.id, saved.invoiceNumber);
      }

      toast.success(
        `Invoice ${saved.invoiceNumber} ${isEdit ? 'updated' : 'created'} successfully.`
      );
      navigate(`/invoices/${saved.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong while saving the invoice. Please try again.');
    } finally {
      setSavingAction(null);
    }
  }

  if (isEdit && loadingExisting) {
    return <div className="p-10 text-center text-slate-400">Loading invoice...</div>;
  }

  const previewProps = {
    invoiceNumber: isEdit ? existing?.invoice.invoiceNumber || '' : `${settings?.invoicePrefix || 'LH-INV'}-${new Date().getFullYear()}-${String(settings?.invoiceNextNumber ?? 1).padStart(4, '0')}`,
    invoiceDate: form.invoiceDate,
    dueDate: form.dueDate,
    status: form.status,
    currency: form.currency,
    referenceNumber: form.referenceNumber,
    customerPoNumber: form.customerPoNumber,
    notes: form.notes,
    customer: form.customer,
    items: form.items,
    settings,
    ...totals,
  };

  return (
    <div className="animate-fadeIn pb-28 lg:pb-6">
      {draftBanner && (
        <div className="mb-4 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <RotateCcw className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800 flex-1">You have an unsaved draft of this invoice. Would you like to restore it?</p>
          <Button size="sm" variant="outline" onClick={discardDraft}>Discard</Button>
          <Button size="sm" onClick={restoreDraft}>Restore</Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* LEFT: form */}
        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="text-sm font-bold text-brand-navy mb-4">Customer</h3>
            <CustomerPicker
              value={form.customer}
              onSelect={(c) => setForm((f) => ({ ...f, customer: c }))}
              onCreateNew={() => setCustomerModalOpen(true)}
            />
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-bold text-brand-navy mb-4">Invoice Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Invoice Date" required>
                <Input type="date" value={form.invoiceDate} onChange={(e) => setForm((f) => ({ ...f, invoiceDate: e.target.value }))} />
              </FormField>
              <FormField label="Due Date" required>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
              </FormField>
              <FormField label="Currency">
                <Select value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}>
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </FormField>
              <FormField label="Status">
                <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                  {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
              </FormField>
              <FormField label="Reference Number">
                <Input value={form.referenceNumber} onChange={(e) => setForm((f) => ({ ...f, referenceNumber: e.target.value }))} />
              </FormField>
              <FormField label="Customer PO Number">
                <Input value={form.customerPoNumber} onChange={(e) => setForm((f) => ({ ...f, customerPoNumber: e.target.value }))} />
              </FormField>
              <FormField label="Notes" className="col-span-2">
                <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} />
              </FormField>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-brand-navy">Transport Service Items</h3>
              <Button size="sm" variant="secondary" onClick={addItem}>
                <Plus className="h-3.5 w-3.5" /> Add Item
              </Button>
            </div>
            <div className="space-y-3">
              {form.items.map((item, idx) => (
                <LineItemCard
                  key={idx}
                  item={item}
                  index={idx}
                  currency={form.currency}
                  onChange={(patch) => updateItem(idx, patch)}
                  onRemove={() => removeItem(idx)}
                  canRemove={form.items.length > 1}
                />
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-bold text-brand-navy mb-4">Payment Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <FormField label={`Additional Charges (${form.currency})`}>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.additionalCharges}
                  onChange={(e) => setForm((f) => ({ ...f, additionalCharges: parseFloat(e.target.value) || 0 }))}
                />
              </FormField>
              <FormField label={`Amount Paid (${form.currency})`}>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.amountPaid}
                  onChange={(e) => setForm((f) => ({ ...f, amountPaid: parseFloat(e.target.value) || 0 }))}
                />
              </FormField>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5 text-sm">
              <SummaryLine label="Subtotal" value={formatMoney(totals.subtotal, form.currency)} />
              <SummaryLine label="Discount" value={`- ${formatMoney(totals.discountTotal, form.currency)}`} />
              <SummaryLine label="Tax" value={formatMoney(totals.taxTotal, form.currency)} />
              <SummaryLine label="Additional Charges" value={formatMoney(totals.additionalCharges, form.currency)} />
              <SummaryLine label="Total" value={formatMoney(totals.total, form.currency)} bold />
              <SummaryLine label="Balance Due" value={formatMoney(totals.balance, form.currency)} bold accent />
            </div>
          </Card>

          {/* Desktop action bar */}
          <div className="hidden lg:flex items-center gap-2 justify-end">
            <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            <Button variant="secondary" onClick={() => handleSave('draft')} loading={savingAction === 'draft'}>
              <Save className="h-4 w-4" /> Save Draft
            </Button>
            <Button variant="outline" onClick={() => handleSave(undefined, true)} loading={savingAction === 'pdf'}>
              <Download className="h-4 w-4" /> Generate PDF
            </Button>
            <Button onClick={() => handleSave('sent')} loading={savingAction === 'sent'}>
              <Send className="h-4 w-4" /> Save &amp; Send
            </Button>
          </div>
        </div>

        {/* RIGHT: live preview (desktop only) */}
        <div className="hidden lg:block">
          <div className="sticky top-20">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Live Preview</p>
            <div className="max-h-[calc(100vh-140px)] overflow-y-auto rounded-2xl">
              <InvoicePreview {...previewProps} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky action bar */}
      <div className="lg:hidden fixed bottom-16 inset-x-0 bg-white border-t border-slate-100 px-3 py-2.5 flex gap-2 z-20 no-print">
        <Button variant="secondary" size="sm" className="flex-1" onClick={() => handleSave('draft')} loading={savingAction === 'draft'}>
          Save Draft
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={() => setMobilePreviewOpen(true)}>
          <Eye className="h-4 w-4" /> Preview
        </Button>
        <Button size="sm" className="flex-1" onClick={() => handleSave(undefined, true)} loading={savingAction === 'pdf'}>
          <Download className="h-4 w-4" /> PDF
        </Button>
      </div>

      <Modal open={mobilePreviewOpen} onClose={() => setMobilePreviewOpen(false)} title="Invoice Preview" size="xl">
        <InvoicePreview {...previewProps} />
      </Modal>

      <CustomerFormModal
        open={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        onSaved={(c) => setForm((f) => ({ ...f, customer: c }))}
      />
    </div>
  );
}

function SummaryLine({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={bold ? 'font-bold text-brand-navy' : 'text-slate-500'}>{label}</span>
      <span className={bold ? `font-bold ${accent ? 'text-brand-dark' : 'text-brand-navy'}` : 'text-brand-navy font-medium'}>
        {value}
      </span>
    </div>
  );
}
