'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Activity, Clock, CheckCircle2, AlertTriangle, RefreshCw, 
  ExternalLink, ArrowRight, ShieldCheck, Zap
} from 'lucide-react';

interface ScanJob {
  id: string;
  websiteId?: string;
  domain: string;
  brandName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  overallScore?: number;
  reportId?: string;
  providersCompleted?: string[];
  providersFailed?: string[];
  startedAt: string;
  completedAt?: string;
}

export default function ScansHistoryPage() {
  const [scans, setScans] = useState<ScanJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScans();
  }, []);

  async function fetchScans() {
    try {
      const res = await fetch('/api/scans');
      const data = await res.json();
      if (data.scans) {
        setScans(data.scans);
      }
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Scan Execution History</h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time audit jobs, provider execution logs, and background worker completion statuses.
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchScans();
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-sm font-medium transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Logs
        </button>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm animate-pulse">
            Loading scan history...
          </div>
        ) : scans.length === 0 ? (
          <div className="p-12 text-center">
            <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-medium text-slate-300">No scans executed yet</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Scans are created when you analyze a domain or trigger an audit from the Websites page.
            </p>
            <Link
              href="/dashboard/websites"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition"
            >
              Start an Audit
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Domain / Brand</th>
                  <th className="px-6 py-3.5 font-semibold text-center">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-center">Score</th>
                  <th className="px-6 py-3.5 font-semibold">Engine Checks</th>
                  <th className="px-6 py-3.5 font-semibold">Execution Time</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {scans.map((scan) => {
                  const duration = scan.completedAt 
                    ? Math.round((new Date(scan.completedAt).getTime() - new Date(scan.startedAt).getTime()) / 1000)
                    : null;
                  
                  return (
                    <tr key={scan.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{scan.brandName}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{scan.domain}</div>
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
                      <td className="px-6 py-4 text-center">
                        {scan.overallScore !== undefined ? (
                          <span className="font-bold text-white text-sm">
                            {scan.overallScore}<span className="text-xs text-slate-500 font-normal">/100</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {scan.providersCompleted && scan.providersCompleted.length > 0 ? (
                            scan.providersCompleted.map(p => (
                              <span key={p} className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                                {p}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500">None yet</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        <div>{new Date(scan.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                        {duration !== null && (
                          <div className="text-[11px] text-slate-500 mt-0.5">{duration}s elapsed</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {scan.reportId ? (
                          <Link
                            href={`/report/${scan.reportId}`}
                            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium transition"
                          >
                            <span>Report</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
