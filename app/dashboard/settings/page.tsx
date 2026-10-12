'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Lock, Bell, Trash2, CheckCircle2, AlertCircle, Shield, Mail
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');

  // Notifications
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          setProfile(d.user);
          setName(d.user.name || '');
          setCompany(d.user.company || '');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, company })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      setProfileMsg('Profile updated successfully.');
    } catch (err: any) {
      setProfileErr(err.message);
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setPassMsg('');
    setPassErr('');

    try {
      const res = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');
      setPassMsg('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPassErr(err.message);
    }
  }

  async function handleDeleteAccount() {
    const confirmation = prompt(
      'Type "DELETE MY ACCOUNT" to confirm permanent account deletion. All websites, scans, and reports will be removed:'
    );
    if (confirmation !== 'DELETE MY ACCOUNT') return;

    try {
      const res = await fetch('/api/user/account', { method: 'DELETE' });
      if (res.ok) {
        alert('Your account has been deleted.');
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Account & Security Settings</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your enterprise profile, security credentials, and platform notifications.
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <User className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-semibold text-white">Profile Information</h2>
        </div>

        {profileMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{profileMsg}</span>
          </div>
        )}
        {profileErr && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{profileErr}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="text"
              disabled
              value={profile?.email || ''}
              className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-400 cursor-not-allowed"
            />
            <p className="text-[11px] text-slate-500 mt-1">Primary identifier used for security sessions.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Organization / Brand</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Acme Media Corp"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition shadow-md shadow-blue-600/20"
          >
            Save Changes
          </button>
        </form>
      </div>

      {/* Password Management */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Lock className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-white">Password & Authentication</h2>
        </div>

        {passMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{passMsg}</span>
          </div>
        )}
        {passErr && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{passErr}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">Must be at least 8 characters long.</p>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Bell className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-semibold text-white">Notification Preferences</h2>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 cursor-pointer">
            <div>
              <div className="text-sm font-medium text-slate-200">Real-time Scan Alerts</div>
              <div className="text-xs text-slate-500">Receive an email when scheduled visibility audits finish.</div>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 accent-blue-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 cursor-pointer">
            <div>
              <div className="text-sm font-medium text-slate-200">Weekly Brand Visibility Digest</div>
              <div className="text-xs text-slate-500">Summary of mention rate trends and citation discoveries.</div>
            </div>
            <input
              type="checkbox"
              checked={weeklyDigest}
              onChange={(e) => setWeeklyDigest(e.target.checked)}
              className="w-4 h-4 accent-blue-600 rounded"
            />
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-950/10 border border-rose-900/40 rounded-xl p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-rose-400">
          <Trash2 className="w-5 h-5" />
          <h2 className="text-base font-semibold">Danger Zone</h2>
        </div>
        <p className="text-xs text-slate-400">
          Permanently delete your TopSEOTool account and all associated audits, domains, and saved reports. This action cannot be undone.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
