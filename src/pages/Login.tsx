import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, Lock, Mail, Loader2 } from 'lucide-react';
import { login } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input, FormField } from '../components/ui/Field';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await login(email, password);
      setAuth(user, token);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}.`);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Unable to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-brand-navy">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-gradient-to-br from-brand-navy to-[#12204d] relative overflow-hidden">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-primary/10" />
        <div className="absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-brand-dark/20" />
        <div className="relative flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-brand-primary flex items-center justify-center">
            <Truck className="h-6 w-6 text-white" />
          </div>
          <span className="text-white font-bold text-lg">LH Transport</span>
        </div>
        <div className="relative">
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Invoice management,<br /> built for logistics.
          </h1>
          <p className="text-blue-200/80 text-sm max-w-md">
            Create professional transport invoices, track payments, and manage your customers &mdash;
            all from one secure, mobile-friendly dashboard.
          </p>
        </div>
        <p className="relative text-blue-300/50 text-xs">&copy; {new Date().getFullYear()} LH Transport. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-slate-50">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 justify-center mb-8">
            <div className="h-10 w-10 rounded-xl bg-brand-dark flex items-center justify-center">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-brand-navy text-lg">LH Transport</span>
          </div>

          <h2 className="text-xl font-bold text-brand-navy">Sign in to your account</h2>
          <p className="text-sm text-slate-500 mt-1 mb-6">Enter your credentials to access the invoice system.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Email address" required>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email"
                  className="pl-9"
                />
              </div>
            </FormField>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-600">
                  Password<span className="text-red-500 ml-0.5">*</span>
                </span>
                <Link to="/forgot-password" className="text-xs font-semibold text-brand-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth loading={loading} size="lg">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Sign In
            </Button>
          </form>

          <div className="mt-6 p-4 rounded-xl bg-brand-pale border border-blue-100">
            <p className="text-xs font-semibold text-brand-dark mb-1">Demo credentials</p>
            <p className="text-xs text-slate-600">Admin: admin@lhtransport.mw / Admin@12345</p>
            <p className="text-xs text-slate-600">Staff: staff@lhtransport.mw / Staff@12345</p>
          </div>
        </div>
      </div>
    </div>
  );
}
