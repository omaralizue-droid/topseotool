'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, Search, ExternalLink, Calendar, 
  CheckCircle2, AlertTriangle, ArrowUpDown, Download, Share2
} from 'lucide-react';

interface Report {
  id: string;
  websiteId: string;
  domain: string;
  brandName: string;
  overallScore: number;
  readinessScore: number;
  mentionRate: number;
  citationsCount: number;
  status: 'ready' | 'processing' | 'failed';
  createdAt: string;
  isPublic: boolean;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch('/api/reports');
        const data = await res.json();
        if (!ignore && data.reports) {
          setReports(data.reports);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const filtered = reports.filter(r => {
    const matchesSearch = r.domain.toLowerCase().includes(search.toLowerCase()) || 
                          r.brandName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Visibility Reports</h1>
          <p className="text-slate-400 text-sm mt-1">
            Historical audit reports with provider citations, brand readiness, and actionable recommendations.
          </p>
        </div>
        <Link
          href="/dashboard/websites"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-blue-600/20"
        >
          <FileText className="w-4 h-4" /> Run New Scan
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search reports by domain or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="ready">Ready</option>
          <option value="processing">Processing</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Reports List */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm animate-pulse">
            Loading reports...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-medium text-slate-300">No reports found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Run your first visibility scan from the Websites tab or start from the public homepage.
            </p>
            <Link
              href="/dashboard/websites"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition"
            >
              Go to Websites
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Website / Brand</th>
                  <th className="px-6 py-3.5 font-semibold text-center">Overall Score</th>
                  <th className="px-6 py-3.5 font-semibold text-center">AI Readiness</th>
                  <th className="px-6 py-3.5 font-semibold text-center">Mention Rate</th>
                  <th className="px-6 py-3.5 font-semibold text-center">Citations</th>
                  <th className="px-6 py-3.5 font-semibold">Date</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filtered.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{report.brandName}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{report.domain}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        report.overallScore >= 70 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : report.overallScore >= 40 
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {report.overallScore}/100
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-300 font-medium">
                      {report.readinessScore}%
                    </td>
                    <td className="px-6 py-4 text-center text-slate-300 font-medium">
                      {report.mentionRate}%
                    </td>
                    <td className="px-6 py-4 text-center text-slate-300 font-medium">
                      {report.citationsCount}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {new Date(report.createdAt).toLocaleDateString(undefined, { 
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/report/${report.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-md text-xs font-medium transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Report
                      </Link>
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
