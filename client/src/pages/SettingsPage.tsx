import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { authApi } from '../api/authApi';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { toast } from 'sonner';
import {
  User,
  Shield,
  Palette,
  Sliders,
  AlertOctagon,
  Moon,
  Sun,
  Laptop,
  Check,
} from 'lucide-react';
import { ClockSettings } from '../components/clock';

export function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Danger zone state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsUpdatingProfile(true);
    try {
      const updated = await authApi.updateProfile({ name });
      updateUser(updated);
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Please enter your password to confirm deletion');
      return;
    }
    setIsDeletingAccount(true);
    try {
      await authApi.deleteAccount(deletePassword);
      toast.info('Account deleted successfully');
      await logout();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setIsDeletingAccount(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Manage your account profile, appearance, and security settings.
        </p>
      </div>

      {/* 1. Account Section */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-border">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            Account Profile
          </h2>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              Full Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              Email Address
            </label>
            <Input
              value={user?.email || ''}
              disabled
              className="bg-muted opacity-80 cursor-not-allowed"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Email address is linked to your authentication.
            </p>
          </div>

          <Button type="submit" size="sm" isLoading={isUpdatingProfile}>
            Save Changes
          </Button>
        </form>
      </div>

      {/* 2. Appearance Section */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-border">
          <Palette className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Appearance</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-2 block">
              Theme Mode
            </label>
            <div className="grid grid-cols-3 gap-3 max-w-md">
              {[
                { id: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
                { id: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
                { id: 'system', label: 'System', icon: <Laptop className="h-4 w-4" /> },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item.id as any)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                    theme === item.id
                      ? 'border-primary bg-primary/10 text-primary font-semibold shadow-2xs'
                      : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Clock Section */}
      <ClockSettings />

      {/* 4. Security Section */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-border">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            Security & Password
          </h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              Current Password
            </label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              New Password
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              Confirm New Password
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" size="sm" isLoading={isChangingPassword}>
            Update Password
          </Button>
        </form>
      </div>

      {/* 4. Danger Zone */}
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 space-y-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertOctagon className="h-5 w-5" />
          <h2 className="text-base font-semibold">Danger Zone</h2>
        </div>
        <p className="text-xs text-muted-foreground max-w-lg leading-relaxed">
          Permanently delete your Notely account and all associated notes, tags, and settings. This operation is irreversible.
        </p>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setIsDeleteModalOpen(true)}
        >
          Delete Account
        </Button>
      </div>

      {/* Account Deletion Password Prompt Dialog */}
      {isDeleteModalOpen && (
        <ConfirmDialog
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeletePassword('');
          }}
          onConfirm={handleDeleteAccount}
          title="Confirm Account Deletion"
          description="Please enter your current password to authorize permanent deletion of your Notely account."
          confirmLabel="Permanently Delete Account"
          variant="destructive"
          isLoading={isDeletingAccount}
        />
      )}
    </div>
  );
}
