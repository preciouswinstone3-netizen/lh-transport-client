import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { LayoutDashboard, FileText, Users, BarChart3, Menu } from 'lucide-react';

const items = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/invoices', label: 'Invoices', icon: FileText },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];

export function MobileBottomNav({ onMoreClick }: { onMoreClick: () => void }) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-100 pb-[env(safe-area-inset-bottom)] no-print">
      <div className="grid grid-cols-5 h-16">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold',
                isActive ? 'text-brand-dark' : 'text-slate-400'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={onMoreClick}
          className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-slate-400"
        >
          <Menu className="h-5 w-5" />
          More
        </button>
      </div>
    </nav>
  );
}
