import { useState } from 'react';
import toast from 'react-hot-toast';
import { User as UserIcon, Save, KeyRound } from 'lucide-react';
import { updateProfile, changePassword } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, FormField } from '../components/ui/Field';
import { ApiError } from '../api/client';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();

  // Profile details form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleSaveProfile() {
    setProfileErrors({});
    if (!name.trim()) {
      setProfileErrors({ name: 'Name is required' });
      return;
    }
    if (!email.trim()) {
      setProfileErrors({ email: 'Email is required' });
      return;
    }

    setSavingProfile(true);
    try {
      const updated = await updateProfile({ name: name.trim(), email: email.trim() });
      updateUser(updated);
      toast.success('Profile updated successfully.');
    } catch (err) {
      const apiErr = err as ApiError;
      toast.error(apiErr.message || 'Something went wrong while updating your profile.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword() {
    setPasswordErrors({});
    const errors: Record<string, string> = {};
    if (!currentPassword) errors.currentPassword = 'Current password is required';
    if (!newPassword || newPassword.length < 8) errors.newPassword = 'New password must be at least 8 characters';
    if (newPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const apiErr = err as ApiError;
      toast.error(apiErr.message || 'Something went wrong while changing your password.');
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="space-y-5 animate-fadeIn pb-10">
      <Card>
        <CardHeader
          title="Profile Information"
          subtitle="Update your name and email address"
          action={<UserIcon className="h-5 w-5 text-slate-300" />}
        />
        <div className="px-5 pb-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Full Name" required error={profileErrors.name}>
              <Input value={name} onChange={(e) => setName(e.target.value)} error={!!profileErrors.name} />
            </FormField>
            <FormField label="Email Address" required error={profileErrors.email}>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!profileErrors.email}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400">
            {user?.role && <p>Role: <span className="font-semibold text-slate-500 capitalize">{user.role}</span></p>}
            {user?.lastLoginAt && (
              <p>Last login: <span className="font-semibold text-slate-500">{new Date(user.lastLoginAt).toLocaleString()}</span></p>
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} loading={savingProfile}>
              <Save className="h-4 w-4" /> Save Profile
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Change Password"
          subtitle="Choose a strong password you haven't used before"
          action={<KeyRound className="h-5 w-5 text-slate-300" />}
        />
        <div className="px-5 pb-5 space-y-4">
          <FormField label="Current Password" required error={passwordErrors.currentPassword}>
            <Input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              error={!!passwordErrors.currentPassword}
            />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="New Password" required hint="At least 8 characters" error={passwordErrors.newPassword}>
              <Input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={!!passwordErrors.newPassword}
              />
            </FormField>
            <FormField label="Confirm New Password" required error={passwordErrors.confirmPassword}>
              <Input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={!!passwordErrors.confirmPassword}
              />
            </FormField>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleChangePassword} loading={savingPassword}>
              <KeyRound className="h-4 w-4" /> Update Password
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
