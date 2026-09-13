import { useNavigate } from 'react-router-dom';
import { SettingsIcon, ShieldCheck, UserCog, LogOut, X, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { logout as apiLogout } from '../../api/auth';

export function MoreMenuSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  if (!open) return null;

  async function handleLogout() {
    try {
      await apiLogout();
    } catch {
      // proceed regardless
    }
    clearAuth();
    navigate('/login');
  }

  const go = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="lg:hidden fixed inset-0 z-40">
      <div className="absolute inset-0 bg-brand-navy/40" onClick={onClose} />
      <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-2xl shadow-elevated pb-[env(safe-area-inset-bottom)] animate-slideUp">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <p className="text-sm font-bold text-brand-navy">More</p>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-2">
          <MenuButton icon={User} label="Profile" onClick={() => go('/profile')} />
          {user?.role === 'admin' && (
            <>
              <MenuButton icon={SettingsIcon} label="Settings" onClick={() => go('/settings')} />
              <MenuButton icon={UserCog} label="Administrators" onClick={() => go('/administrators')} />
              <MenuButton icon={ShieldCheck} label="Audit Log" onClick={() => go('/audit-log')} />
            </>
          )}
          <MenuButton icon={LogOut} label="Log out" onClick={handleLogout} danger />
        </div>
      </div>
    </div>
  );
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
        danger ? 'text-red-600 hover:bg-red-50' : 'text-brand-navy hover:bg-slate-50'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
