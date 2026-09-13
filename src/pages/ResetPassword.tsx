import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Truck, Lock, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { resetPassword } from '../api/auth';
import { Button } from '../components/ui/Button';
import { Input, FormField } from '../components/ui/Field';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('This reset link is missing its token. Please request a new one.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setDone(true);
      toast.success('Password reset successfully. Please sign in.');
    } catch (err: any) {
      setError(err.message || 'Unable to reset your password. The link may have expired.');
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

          {done ? (
            <div className="text-center">
              <div className="h-14 w-14 rounded-2xl bg-brand-pale flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-6 w-6 text-brand-primary" />
              </div>
              <h2 className="text-xl font-bold text-brand-navy">Password reset</h2>
              <p className="text-sm text-slate-500 mt-2">
                Your password has been updated successfully. You can now sign in with your new password.
              </p>
              <Button className="mt-6" fullWidth size="lg" onClick={() => navigate('/login')}>
                Go to Sign In
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-brand-navy">Set a new password</h2>
              <p className="text-sm text-slate-500 mt-1 mb-6">Choose a strong password you haven't used before.</p>

              {!token && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                  This link is missing its reset token. Please request a new password reset link.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField label="New Password" required hint="At least 8 characters">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="password"
                      required
                      autoFocus
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-9"
                    />
                  </div>
                </FormField>

                <FormField label="Confirm New Password" required>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-9"
                    />
                  </div>
                </FormField>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <Button type="submit" fullWidth loading={loading} size="lg" disabled={!token}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Reset Password
                </Button>
              </form>

              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-navy mt-6"
              >
                <ArrowLeft className="h-4 w-4" /> Back to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
