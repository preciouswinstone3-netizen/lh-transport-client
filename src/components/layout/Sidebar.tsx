import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings as SettingsIcon,
  ShieldCheck,
  Truck,
  UserCog,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/invoices', label: 'Invoices', icon: FileText },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];

const adminItems = [
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
  { to: '/administrators', label: 'Administrators', icon: UserCog },
  { to: '/audit-log', label: 'Audit Log', icon: ShieldCheck },
];

export function Sidebar() {
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-brand-navy min-h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-6 h-16 shrink-0">
        <div className="h-9 w-9 rounded-xl bg-brand-primary flex items-center justify-center">
          <Truck className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">LH Transport</p>
          <p className="text-blue-300/70 text-[11px] leading-tight">Invoice Management</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <SidebarLink key={item.to} {...item} />
        ))}

        {user?.role === 'admin' && (
          <>
            <p className="px-3 pt-5 pb-2 text-[11px] font-semibold text-blue-300/50 uppercase tracking-wider">
              Administration
            </p>
            {adminItems.map((item) => (
              <SidebarLink key={item.to} {...item} />
            ))}
          </>
        )}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2">
          <div className="h-9 w-9 rounded-full bg-brand-primary/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
            <p className="text-blue-300/60 text-[11px] capitalize truncate">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({ to, label, icon: Icon }: { to: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
          isActive
            ? 'bg-brand-primary text-white shadow-card'
            : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </NavLink>
  );
}
