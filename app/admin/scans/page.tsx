'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Activity, CheckCircle2, AlertTriangle, RefreshCw, ExternalLink, Clock, ShieldCheck
} from 'lucide-react';

export default function AdminScansPage() {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScans();
  }, []);

  async function fetchScans() {
    try {
      const res = await fetch('/api/admin/scans');
      const data = await res.json();
      if (data.scans) setScans(data.scans);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Scan Jobs & Audits</h1>
          <p className="text-slate-400 text-sm mt-1">
            Global scan pipeline monitor, background worker statuses, and provider error traces.
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchScans();
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-sm font-medium transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Jobs
        </button>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm animate-pulse">
            Loading global scan jobs...
          </div>
        ) : scans.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No scan executions found in the database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Job ID / Domain</th>
                  <th className="px-6 py-3.5 font-semibold">User</th>
                  <th className="px-6 py-3.5 font-semibold text-center">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-center">Score</th>
                  <th className="px-6 py-3.5 font-semibold">Providers Completed</th>
                  <th className="px-6 py-3.5 font-semibold">Started At</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {scans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{scan.domain}</div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">{scan.id}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">
                      {scan.userId ? scan.userId.slice(0, 12) + '...' : 'Public Guest'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        scan.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : scan.status === 'running'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : scan.status === 'failed'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {scan.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {scan.status === 'running' && <Activity className="w-3.5 h-3.5 animate-spin" />}
                        {scan.status === 'failed' && <AlertTriangle className="w-3.5 h-3.5" />}
                        <span className="capitalize">{scan.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-white">
                      {scan.overallScore !== undefined ? `${scan.overallScore}/100` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {scan.providersCompleted && scan.providersCompleted.length > 0 ? (
                          scan.providersCompleted.map((p: string) => (
                            <span key={p} className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                              {p}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(scan.startedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {scan.reportId && (
                        <Link
                          href={`/report/${scan.reportId}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition"
                        >
                          <span>Report</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
