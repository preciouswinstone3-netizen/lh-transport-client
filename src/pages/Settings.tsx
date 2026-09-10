import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Save, Upload, Building2, FileText, Landmark, X } from 'lucide-react';
import { fetchSettings, updateSettings } from '../api/misc';
import type { CompanySettings } from '../types';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea, FormField } from '../components/ui/Field';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings });
  const [form, setForm] = useState<Partial<CompanySettings>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  function set<K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo image must be smaller than 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set('logoDataUrl', reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateSettings(form);
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings updated successfully.');
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong while saving settings.');
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <div className="p-10 text-center text-slate-400">Loading settings...</div>;

  return (
    <div className="space-y-5 animate-fadeIn pb-10">
      <Card>
        <CardHeader title="Company Information" subtitle="Displayed on every invoice header" action={<Building2 className="h-5 w-5 text-slate-300" />} />
        <div className="px-5 pb-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
              {form.logoDataUrl ? (
                <img src={form.logoDataUrl} alt="Logo" className="h-full w-full object-contain" />
              ) : (
                <Building2 className="h-6 w-6 text-slate-300" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer">
                <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-brand-pale text-brand-dark hover:bg-blue-100">
                  <Upload className="h-4 w-4" /> Upload Logo
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
              {form.logoDataUrl && (
                <button onClick={() => set('logoDataUrl', null)} className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Company Name" required>
              <Input value={form.companyName || ''} onChange={(e) => set('companyName', e.target.value)} />
            </FormField>
            <FormField label="Website">
              <Input value={form.website || ''} onChange={(e) => set('website', e.target.value)} />
            </FormField>
            <FormField label="Phone">
              <Input value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} />
            </FormField>
            <FormField label="Email">
              <Input type="email" value={form.email || ''} onChange={(e) => set('email', e.target.value)} />
            </FormField>
            <FormField label="Tax / VAT Number">
              <Input value={form.taxNumber || ''} onChange={(e) => set('taxNumber', e.target.value)} />
            </FormField>
            <FormField label="Registration Number">
              <Input value={form.registrationNumber || ''} onChange={(e) => set('registrationNumber', e.target.value)} />
            </FormField>
            <FormField label="Address" className="sm:col-span-2">
              <Textarea value={form.address || ''} onChange={(e) => set('address', e.target.value)} rows={2} />
            </FormField>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Invoice Settings" subtitle="Numbering, currency, and defaults" action={<FileText className="h-5 w-5 text-slate-300" />} />
        <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Invoice Prefix" hint="e.g. LH-INV produces LH-INV-2026-0001">
            <Input value={form.invoicePrefix || ''} onChange={(e) => set('invoicePrefix', e.target.value)} />
          </FormField>
          <FormField label="Next Invoice Number" hint="The number that will be used for the next new invoice">
            <Input type="number" min={1} value={form.invoiceNextNumber || 1} onChange={(e) => set('invoiceNextNumber', parseInt(e.target.value) || 1)} />
          </FormField>
          <FormField label="Default Currency">
            <Input value={form.defaultCurrency || ''} onChange={(e) => set('defaultCurrency', e.target.value)} />
          </FormField>
          <FormField label="Default Tax Rate (%)">
            <Input type="number" min={0} max={100} step="0.01" value={form.defaultTaxRate ?? 0} onChange={(e) => set('defaultTaxRate', parseFloat(e.target.value) || 0)} />
          </FormField>
          <FormField label="Default Payment Terms (days)">
            <Input type="number" min={0} value={form.defaultPaymentTermsDays ?? 0} onChange={(e) => set('defaultPaymentTermsDays', parseInt(e.target.value) || 0)} />
          </FormField>
          <FormField label="Invoice Footer Message">
            <Input value={form.invoiceFooter || ''} onChange={(e) => set('invoiceFooter', e.target.value)} />
          </FormField>
          <FormField label="Terms & Conditions" className="sm:col-span-2">
            <Textarea value={form.termsAndConditions || ''} onChange={(e) => set('termsAndConditions', e.target.value)} rows={4} />
          </FormField>
        </div>
      </Card>

      <Card>
        <CardHeader title="Payment Details" subtitle="Bank and mobile money details shown on invoices" action={<Landmark className="h-5 w-5 text-slate-300" />} />
        <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Bank Name">
            <Input value={form.bankName || ''} onChange={(e) => set('bankName', e.target.value)} />
          </FormField>
          <FormField label="Account Name">
            <Input value={form.bankAccountName || ''} onChange={(e) => set('bankAccountName', e.target.value)} />
          </FormField>
          <FormField label="Account Number">
            <Input value={form.bankAccountNumber || ''} onChange={(e) => set('bankAccountNumber', e.target.value)} />
          </FormField>
          <FormField label="Branch">
            <Input value={form.bankBranch || ''} onChange={(e) => set('bankBranch', e.target.value)} />
          </FormField>
          <FormField label="Mobile Money Details" className="sm:col-span-2">
            <Input value={form.mobileMoneyDetails || ''} onChange={(e) => set('mobileMoneyDetails', e.target.value)} />
          </FormField>
          <FormField label="Other Payment Instructions" className="sm:col-span-2">
            <Textarea value={form.otherPaymentInstructions || ''} onChange={(e) => set('otherPaymentInstructions', e.target.value)} rows={2} />
          </FormField>
        </div>
      </Card>

      <div className="flex justify-end sticky bottom-4">
        <Button size="lg" onClick={handleSave} loading={saving}>
          <Save className="h-4 w-4" /> Save Settings
        </Button>
      </div>
    </div>
  );
}
