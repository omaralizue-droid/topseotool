'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, Activity, CheckCircle2, AlertTriangle, ShieldCheck, 
  Cpu, FileText, ArrowUpRight, Clock, RefreshCw
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  async function fetchOverview() {
    try {
      const res = await fetch('/api/admin/overview');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 text-sm animate-pulse">
        Loading administrative telemetry...
      </div>
    );
  }

  const { users, scans, providers, system, recentAuditLogs } = data || {};

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Operational Overview</h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time platform metrics, user demographics, provider statuses, and security audit activity.
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchOverview();
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-sm font-medium transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Telemetry
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Registered Users</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">{users?.total || 0}</div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span className="text-emerald-400 font-medium">{users?.active || 0} active</span>
            <span>•</span>
            <span className="text-rose-400 font-medium">{users?.suspended || 0} suspended</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Total Scan Executions</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">{scans?.total || 0}</div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span className="text-emerald-400 font-medium">{scans?.completed || 0} succeeded</span>
            <span>•</span>
            <span className="text-rose-400 font-medium">{scans?.failed || 0} failed</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>AI Provider Integrations</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">{providers?.total || 0}</div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span className="text-emerald-400 font-medium">{providers?.healthy || 0} operational</span>
            <span>•</span>
            <span className="text-amber-400 font-medium">{providers?.withErrors || 0} degraded</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Database & Storage</span>
            <ShieldCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">Active</div>
          <div className="text-xs text-slate-400 mt-1">
            Engine: <span className="text-slate-300 font-mono">Atomic Relational Store</span>
          </div>
        </div>
      </div>

      {/* Subscription Breakdown & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier Distribution */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white">Customer Tier Distribution</h2>
          <div className="space-y-3">
            {Object.entries(users?.byPlan || {}).map(([plan, count]: [string, any]) => (
              <div key={plan} className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-sm font-semibold capitalize text-slate-300">{plan} Tier</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {count} accounts
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/admin/subscriptions"
            className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition pt-2"
          >
            Manage plans & limits <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Recent Security & Audit Logs */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Recent Administrative Audit Events</h2>
            <Link
              href="/admin/logs"
              className="text-xs text-blue-400 hover:text-blue-300 transition flex items-center gap-1"
            >
              View all logs <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentAuditLogs && recentAuditLogs.length > 0 ? (
              recentAuditLogs.map((log: any) => (
                <div key={log.id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-200">
                      <span className="text-rose-400 font-mono">[{log.action}]</span> {log.targetType}: {log.targetId}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Actor: {log.actorEmail}
                    </div>
                  </div>
                  <div className="text-slate-400 text-right">
                    <div>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <span className="text-[10px] text-emerald-400 font-medium">Recorded</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                No administrative audit actions recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
