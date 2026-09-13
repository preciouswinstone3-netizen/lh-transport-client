import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, Menu, ChevronDown, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { logout as apiLogout } from '../../api/auth';
import { Button } from '../ui/Button';

export function Topbar({ title, onMenuClick }: { title: string; onMenuClick?: () => void }) {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    try {
      await apiLogout();
    } catch {
      // proceed with local logout regardless
    }
    clearAuth();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            className="lg:hidden h-9 w-9 flex items-center justify-center rounded-lg hover:bg-slate-100 shrink-0"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-brand-navy" />
          </button>
          <h1 className="text-base sm:text-lg font-bold text-brand-navy truncate">{title}</h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" onClick={() => navigate('/invoices/new')} className="hidden sm:inline-flex">
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">Create Invoice</span>
            <span className="md:hidden">Create</span>
          </Button>
          <button
            className="sm:hidden h-9 w-9 flex items-center justify-center rounded-lg bg-brand-dark text-white"
            onClick={() => navigate('/invoices/new')}
            aria-label="Create invoice"
          >
            <Plus className="h-4 w-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 h-9 pl-1 pr-2 rounded-lg hover:bg-slate-100"
            >
              <div className="h-7 w-7 rounded-full bg-brand-pale flex items-center justify-center text-brand-dark font-bold text-xs">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-elevated border border-slate-100 py-1.5 z-20 animate-fadeIn">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-sm font-semibold text-brand-navy truncate">{user?.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-brand-navy hover:bg-slate-50"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
