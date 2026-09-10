import { Trash2, Truck, MapPin } from 'lucide-react';
import { Input, Select, FormField } from '../ui/Field';
import { calcLineTotal, formatMoney } from '../../utils/format';
import type { LineItem } from '../../types';

const UNIT_OPTIONS = ['trip', 'ton', 'km', 'hour', 'day', 'load', 'container'];
const SERVICE_TYPES = [
  'Goods Transportation',
  'Bulk Cargo Haulage',
  'Freight Delivery',
  'Equipment Transport',
  'Passenger Transport',
  'Warehousing & Handling',
];

export function LineItemCard({
  item,
  index,
  onChange,
  onRemove,
  canRemove,
  currency,
}: {
  item: LineItem;
  index: number;
  onChange: (patch: Partial<LineItem>) => void;
  onRemove: () => void;
  canRemove: boolean;
  currency: string;
}) {
  const calc = calcLineTotal(item);

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 relative">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-brand-dark bg-brand-pale px-2 py-0.5 rounded-md">Item {index + 1}</span>
        {canRemove && (
          <button
            onClick={onRemove}
            className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            aria-label={`Remove item ${index + 1}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Description" required className="sm:col-span-2">
          <Input
            value={item.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="e.g. Goods transportation - Lilongwe to Blantyre"
          />
        </FormField>

        <FormField label="Service Type">
          <Select value={item.serviceType || ''} onChange={(e) => onChange({ serviceType: e.target.value })}>
            <option value="">Select type</option>
            {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </FormField>

        <FormField label="Trip Date">
          <Input type="date" value={item.tripDate || ''} onChange={(e) => onChange({ tripDate: e.target.value })} />
        </FormField>
      </div>

      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wide mt-4 mb-2">
        <Truck className="h-3.5 w-3.5" /> Transport Details
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Vehicle / Truck">
          <Input value={item.vehicle || ''} onChange={(e) => onChange({ vehicle: e.target.value })} placeholder="e.g. Isuzu FRR Truck" />
        </FormField>
        <FormField label="Vehicle Registration">
          <Input value={item.vehicleRegistration || ''} onChange={(e) => onChange({ vehicleRegistration: e.target.value })} placeholder="e.g. BT 4521" />
        </FormField>
        <FormField label="Driver">
          <Input value={item.driver || ''} onChange={(e) => onChange({ driver: e.target.value })} placeholder="Driver name" />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Pickup">
            <div className="relative">
              <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input className="pl-7" value={item.pickupLocation || ''} onChange={(e) => onChange({ pickupLocation: e.target.value })} placeholder="From" />
            </div>
          </FormField>
          <FormField label="Delivery">
            <div className="relative">
              <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input className="pl-7" value={item.deliveryLocation || ''} onChange={(e) => onChange({ deliveryLocation: e.target.value })} placeholder="To" />
            </div>
          </FormField>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
        <FormField label="Qty">
          <Input type="number" min={0} step="0.01" value={item.quantity} onChange={(e) => onChange({ quantity: parseFloat(e.target.value) || 0 })} />
        </FormField>
        <FormField label="Unit">
          <Select value={item.unit} onChange={(e) => onChange({ unit: e.target.value })}>
            {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
          </Select>
        </FormField>
        <FormField label={`Rate (${currency})`}>
          <Input type="number" min={0} step="0.01" value={item.rate} onChange={(e) => onChange({ rate: parseFloat(e.target.value) || 0 })} />
        </FormField>
        <FormField label="Discount %">
          <Input type="number" min={0} max={100} step="0.01" value={item.discountPercent} onChange={(e) => onChange({ discountPercent: parseFloat(e.target.value) || 0 })} />
        </FormField>
        <FormField label="Tax %">
          <Input type="number" min={0} max={100} step="0.01" value={item.taxPercent} onChange={(e) => onChange({ taxPercent: parseFloat(e.target.value) || 0 })} />
        </FormField>
      </div>

      <div className="flex justify-end mt-3 pt-3 border-t border-slate-200">
        <p className="text-sm font-bold text-brand-navy">
          Line Total: <span className="text-brand-dark">{formatMoney(calc.total, currency)}</span>
        </p>
      </div>
    </div>
  );
}
