export type UserRole = 'admin' | 'staff';
export type UserStatus = 'active' | 'suspended';
export type InvoiceStatus = 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: string | null;
  createdAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  postalAddress?: string | null;
  taxNumber?: string | null;
  registrationNumber?: string | null;
  customerReference?: string | null;
  notes?: string | null;
  createdBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LineItem {
  id?: string;
  description: string;
  serviceType?: string | null;
  vehicle?: string | null;
  vehicleRegistration?: string | null;
  driver?: string | null;
  pickupLocation?: string | null;
  deliveryLocation?: string | null;
  tripDate?: string | null;
  quantity: number;
  unit: string;
  rate: number;
  discountPercent: number;
  taxPercent: number;
  total?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer?: Customer;
  customerName?: string;
  customerPhone?: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  referenceNumber?: string | null;
  customerPoNumber?: string | null;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  additionalCharges: number;
  total: number;
  amountPaid: number;
  balance: number;
  status: InvoiceStatus;
  notes?: string | null;
  createdBy?: string | null;
  createdByName?: string | null;
  createdAt?: string;
  updatedAt?: string;
  items?: LineItem[];
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference?: string | null;
  notes?: string | null;
  createdBy?: string | null;
  createdAt?: string;
}

export interface CompanySettings {
  companyName: string;
  logoDataUrl?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  taxNumber?: string | null;
  registrationNumber?: string | null;
  invoicePrefix: string;
  invoiceStartingNumber: number;
  invoiceNextNumber: number;
  defaultCurrency: string;
  defaultTaxRate: number;
  defaultPaymentTermsDays: number;
  invoiceFooter?: string | null;
  termsAndConditions?: string | null;
  bankName?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  bankBranch?: string | null;
  mobileMoneyDetails?: string | null;
  otherPaymentInstructions?: string | null;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  userName?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  description?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}
