'use client';

import React, { useState, useEffect } from 'react';
import { 
  Cpu, CheckCircle2, AlertTriangle, Key, RefreshCw, Power, Shield, Activity
} from 'lucide-react';

interface ProviderConfig {
  id: string;
  name: string;
  enabled: boolean;
  hasApiKey: boolean;
  modelName: string;
  lastHealthCheck?: string;
  status: 'healthy' | 'degraded' | 'not_configured';
  lastError?: string;
  callsCount: number;
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, []);

  async function fetchProviders() {
    try {
      const res = await fetch('/api/admin/providers');
      const data = await res.json();
      if (data.providers) setProviders(data.providers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleProvider(p: ProviderConfig) {
    try {
      const res = await fetch('/api/admin/providers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: p.id,
          enabled: !p.enabled
        })
      });
      if (res.ok) {
        setProviders(prev => prev.map(item => item.id === p.id ? { ...item, enabled: !p.enabled } : item));
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI & Search Provider Integrations</h1>
          <p className="text-slate-400 text-sm mt-1">
            Engine status, credential presence, health checks, and engine availability toggles.
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchProviders();
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-sm font-medium transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Run Health Check
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map((p) => (
          <div key={p.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-white">{p.name}</h3>
                <span className="text-xs font-mono text-slate-400 mt-0.5 block">Model: {p.modelName}</span>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                p.status === 'healthy' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : p.status === 'degraded' 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {p.status === 'healthy' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {p.status === 'degraded' && <AlertTriangle className="w-3.5 h-3.5" />}
                <span className="capitalize">{p.status.replace('_', ' ')}</span>
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-blue-400" /> API Credential Status:
                </span>
                <span className={`font-mono font-medium ${p.hasApiKey ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {p.hasApiKey ? '✓ Configured (Secret Safe)' : '⚠️ Not Set (Fallback active)'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Audit Invocations:</span>
                <span className="font-mono text-slate-200">{p.callsCount} calls</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Last Verified:</span>
                <span className="text-slate-400">{p.lastHealthCheck ? new Date(p.lastHealthCheck).toLocaleTimeString() : 'Never'}</span>
              </div>

              {p.lastError && (
                <div className="p-2.5 bg-rose-950/20 border border-rose-900/40 rounded text-rose-300 text-[11px] font-mono">
                  Error: {p.lastError}
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Engine is {p.enabled ? <strong className="text-white">Active in scans</strong> : <span className="text-slate-500">Disabled</span>}
              </span>
              <button
                onClick={() => toggleProvider(p)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  p.enabled
                    ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40'
                    : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/40'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                {p.enabled ? 'Disable Provider' : 'Enable Provider'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
