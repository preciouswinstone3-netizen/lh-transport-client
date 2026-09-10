import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createCustomer, updateCustomer } from '../../api/customers';
import type { Customer } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea, FormField } from '../ui/Field';

const emptyForm = {
  name: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  postalAddress: '',
  taxNumber: '',
  registrationNumber: '',
  customerReference: '',
  notes: '',
};

export function CustomerFormModal({
  open,
  onClose,
  onSaved,
  customer,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (customer: Customer) => void;
  customer?: Customer | null;
}) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(
        customer
          ? {
              name: customer.name || '',
              contactPerson: customer.contactPerson || '',
              phone: customer.phone || '',
              email: customer.email || '',
              address: customer.address || '',
              postalAddress: customer.postalAddress || '',
              taxNumber: customer.taxNumber || '',
              registrationNumber: customer.registrationNumber || '',
              customerReference: customer.customerReference || '',
              notes: customer.notes || '',
            }
          : emptyForm
      );
      setError('');
    }
  }, [open, customer]);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      setError('Customer name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const saved = customer
        ? await updateCustomer(customer.id, form)
        : await createCustomer(form);
      toast.success(customer ? 'Customer updated.' : 'Customer created.');
      onSaved(saved);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Unable to save customer.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={customer ? 'Edit Customer' : 'New Customer'} size="lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Customer / Company Name" required className="sm:col-span-2">
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Kwacha Foods Ltd" autoFocus />
        </FormField>
        <FormField label="Contact Person">
          <Input value={form.contactPerson} onChange={(e) => set('contactPerson', e.target.value)} />
        </FormField>
        <FormField label="Phone">
          <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+265 ..." />
        </FormField>
        <FormField label="Email">
          <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </FormField>
        <FormField label="Customer Reference">
          <Input value={form.customerReference} onChange={(e) => set('customerReference', e.target.value)} />
        </FormField>
        <FormField label="Physical Address" className="sm:col-span-2">
          <Textarea value={form.address} onChange={(e) => set('address', e.target.value)} rows={2} />
        </FormField>
        <FormField label="Postal Address">
          <Input value={form.postalAddress} onChange={(e) => set('postalAddress', e.target.value)} />
        </FormField>
        <FormField label="Tax / VAT Number">
          <Input value={form.taxNumber} onChange={(e) => set('taxNumber', e.target.value)} />
        </FormField>
        <FormField label="Registration Number">
          <Input value={form.registrationNumber} onChange={(e) => set('registrationNumber', e.target.value)} />
        </FormField>
        <FormField label="Notes" className="sm:col-span-2">
          <Textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} />
        </FormField>
      </div>

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={saving}>
          {customer ? 'Save Changes' : 'Create Customer'}
        </Button>
      </div>
    </Modal>
  );
}
