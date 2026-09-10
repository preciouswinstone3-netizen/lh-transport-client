import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import InvoicesPage from './pages/Invoices';
import InvoiceFormPage from './pages/InvoiceForm';
import InvoiceViewPage from './pages/InvoiceView';
import CustomersPage from './pages/Customers';
import CustomerViewPage from './pages/CustomerView';
import ReportsPage from './pages/Reports';
import SettingsPage from './pages/Settings';
import AdministratorsPage from './pages/Administrators';
import AuditLogPage from './pages/AuditLog';
import NotFoundPage from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 15_000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontSize: '13px', borderRadius: '10px' },
            success: { iconTheme: { primary: '#149af7', secondary: '#fff' } },
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/invoices" element={<InvoicesPage />} />
              <Route path="/invoices/new" element={<InvoiceFormPage />} />
              <Route path="/invoices/:id" element={<InvoiceViewPage />} />
              <Route path="/invoices/:id/edit" element={<InvoiceFormPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/customers/:id" element={<CustomerViewPage />} />
              <Route path="/reports" element={<ReportsPage />} />

              <Route element={<AdminRoute />}>
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/administrators" element={<AdministratorsPage />} />
                <Route path="/audit-log" element={<AuditLogPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
