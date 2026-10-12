'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, CheckCircle2, AlertCircle, Shield, RefreshCw
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>({
    appName: 'TopSEOTool',
    freeScanCredits: 5,
    maxScanDurationSec: 60,
    rateLimitPerMin: 15,
    allowPublicScans: true,
    maintenanceMode: false,
  });
  const [loading, setLoading] = useState(true);
  const [savedMsg, setSavedMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function initSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (!ignore && data.settings) {
          setSettings(data.settings);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    initSettings();
    return () => {
      ignore = true;
    };
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSavedMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');
      setSavedMsg('System configuration persisted and audit-logged.');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System & Security Parameters</h1>
        <p className="text-slate-400 text-sm mt-1">
          Global SaaS operational policies, rate limiters, quotas, and public scan access controls.
        </p>
      </div>

      {savedMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Application Name</label>
            <input
              type="text"
              required
              value={settings.appName || ''}
              onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">New Account Free Scan Credits</label>
            <input
              type="number"
              required
              min={0}
              value={settings.freeScanCredits ?? 5}
              onChange={(e) => setSettings({ ...settings, freeScanCredits: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Max Scan Execution Timeout (seconds)</label>
            <input
              type="number"
              required
              min={10}
              max={300}
              value={settings.maxScanDurationSec ?? 60}
              onChange={(e) => setSettings({ ...settings, maxScanDurationSec: parseInt(e.target.value) || 60 })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Global Rate Limit (requests/min per IP)</label>
            <input
              type="number"
              required
              min={1}
              value={settings.rateLimitPerMin ?? 15}
              onChange={(e) => setSettings({ ...settings, rateLimitPerMin: parseInt(e.target.value) || 15 })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-3">
          <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 cursor-pointer">
            <div>
              <div className="text-sm font-medium text-slate-200">Allow Public Guest Scans</div>
              <div className="text-xs text-slate-500">Permit unregistered visitors on the homepage to run basic diagnostics.</div>
            </div>
            <input
              type="checkbox"
              checked={!!settings.allowPublicScans}
              onChange={(e) => setSettings({ ...settings, allowPublicScans: e.target.checked })}
              className="w-4 h-4 accent-rose-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 cursor-pointer">
            <div>
              <div className="text-sm font-medium text-slate-200">System Maintenance Mode</div>
              <div className="text-xs text-slate-500">Temporarily restrict background scan jobs during infrastructure upgrades.</div>
            </div>
            <input
              type="checkbox"
              checked={!!settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              className="w-4 h-4 accent-rose-600 rounded"
            />
          </label>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-rose-600/20"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
