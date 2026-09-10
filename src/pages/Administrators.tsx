import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, ShieldCheck, ShieldOff, Trash2, KeyRound } from 'lucide-react';
import { listUsers, createUser, updateUser, deleteUser } from '../api/misc';
import type { User } from '../types';
import { useAuthStore } from '../store/authStore';
import { Card, StatusBadge, Skeleton } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select, FormField } from '../components/ui/Field';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { formatDate } from '../utils/format';

export default function AdministratorsPage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const { data, isLoading } = useQuery({ queryKey: ['users'], queryFn: listUsers });

  const [createOpen, setCreateOpen] = useState(false);
  const [passwordTarget, setPasswordTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function toggleStatus(user: User) {
    setBusyId(user.id);
    try {
      await updateUser(user.id, { status: user.status === 'active' ? 'suspended' : 'active' });
      toast.success(`${user.name} is now ${user.status === 'active' ? 'suspended' : 'active'}.`);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      await deleteUser(deleteTarget.id);
      toast.success('Administrator removed.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
      setDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Add Administrator
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Last Login</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-5 py-3"><Skeleton className="h-8 w-full" /></td></tr>
                ))
              ) : (
                data?.map((u) => (
                  <tr key={u.id} className="border-b border-slate-50">
                    <td className="px-5 py-3 font-semibold text-brand-navy">{u.name}{u.id === currentUser?.id && <span className="text-xs text-slate-400 font-normal"> (you)</span>}</td>
                    <td className="px-5 py-3 text-slate-500">{u.email}</td>
                    <td className="px-5 py-3 capitalize text-slate-600">{u.role}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={u.status === 'active' ? 'paid' : 'cancelled'} />
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-400">{u.lastLoginAt ? formatDate(u.lastLoginAt, 'dd MMM yyyy, HH:mm') : 'Never'}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPasswordTarget(u)}
                          title="Reset password"
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                        </button>
                        {u.id !== currentUser?.id && (
                          <>
                            <button
                              onClick={() => toggleStatus(u)}
                              disabled={busyId === u.id}
                              title={u.status === 'active' ? 'Suspend' : 'Activate'}
                              className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                            >
                              {u.status === 'active' ? <ShieldOff className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                            </button>
                            <button
                              onClick={() => setDeleteTarget(u)}
                              title="Delete"
                              className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <CreateUserModal open={createOpen} onClose={() => setCreateOpen(false)} onSaved={() => queryClient.invalidateQueries({ queryKey: ['users'] })} />

      <ResetPasswordModal user={passwordTarget} onClose={() => setPasswordTarget(null)} />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove Administrator"
        message={`Are you sure you want to remove ${deleteTarget?.name}'s access?`}
        confirmLabel="Remove"
        danger
        loading={!!busyId}
      />
    </div>
  );
}

function CreateUserModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!name || !email || password.length < 8) {
      setError('Please fill all fields. Password must be at least 8 characters.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await createUser({ name, email, password, role });
      toast.success('Administrator account created.');
      onSaved();
      onClose();
      setName(''); setEmail(''); setPassword(''); setRole('staff');
    } catch (err: any) {
      setError(err.message || 'Unable to create account.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Administrator">
      <div className="space-y-4">
        <FormField label="Full Name" required><Input value={name} onChange={(e) => setName(e.target.value)} /></FormField>
        <FormField label="Email" required><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></FormField>
        <FormField label="Password" required hint="At least 8 characters">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormField>
        <FormField label="Role" required>
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="staff">Staff</option>
            <option value="admin">Administrator</option>
          </Select>
        </FormField>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} loading={saving}>Create Account</Button>
        </div>
      </div>
    </Modal>
  );
}

function ResetPasswordModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!user) return;
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateUser(user.id, { password });
      toast.success(`Password updated for ${user.name}.`);
      setPassword('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Unable to update password.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={!!user} onClose={onClose} title={`Reset Password${user ? ` — ${user.name}` : ''}`} size="sm">
      <div className="space-y-4">
        <FormField label="New Password" required hint="At least 8 characters">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
        </FormField>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} loading={saving}>Update Password</Button>
        </div>
      </div>
    </Modal>
  );
}
