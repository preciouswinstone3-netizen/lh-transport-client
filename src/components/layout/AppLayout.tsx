import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileBottomNav } from './MobileBottomNav';
import { MoreMenuSheet } from './MoreMenuSheet';

const TITLE_MAP: { test: RegExp; title: string }[] = [
  { test: /^\/dashboard/, title: 'Dashboard' },
  { test: /^\/invoices\/new/, title: 'Create Invoice' },
  { test: /^\/invoices\/[^/]+\/edit/, title: 'Edit Invoice' },
  { test: /^\/invoices\/[^/]+/, title: 'Invoice' },
  { test: /^\/invoices/, title: 'Invoices' },
  { test: /^\/customers\/[^/]+/, title: 'Customer Profile' },
  { test: /^\/customers/, title: 'Customers' },
  { test: /^\/reports/, title: 'Reports' },
  { test: /^\/profile/, title: 'My Profile' },
  { test: /^\/settings/, title: 'Company Settings' },
  { test: /^\/administrators/, title: 'Administrators' },
  { test: /^\/audit-log/, title: 'Audit Log' },
];

function useTitle() {
  const { pathname } = useLocation();
  const match = TITLE_MAP.find((m) => m.test.test(pathname));
  return match?.title || 'LH Transport';
}

export function AppLayout() {
  const [moreOpen, setMoreOpen] = useState(false);
  const title = useTitle();

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar title={title} onMenuClick={() => setMoreOpen(true)} />
        <main className="flex-1 px-4 sm:px-6 py-5 sm:py-6 pb-24 lg:pb-6 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav onMoreClick={() => setMoreOpen(true)} />
      <MoreMenuSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </div>
  );
}
