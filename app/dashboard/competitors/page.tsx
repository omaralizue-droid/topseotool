'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Trash2, Globe, Shield, RefreshCw, AlertCircle, CheckCircle2, TrendingUp
} from 'lucide-react';

interface Competitor {
  id: string;
  websiteId: string;
  domain: string;
  brandName: string;
  lastScore?: number;
  lastCheckedAt?: string;
}

interface Website {
  id: string;
  domain: string;
  brandName: string;
}

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState('');
  
  // Add modal/form
  const [isAdding, setIsAdding] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [targetWebId, setTargetWebId] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [compRes, webRes] = await fetchAll();
      if (webRes && webRes.websites) {
        setWebsites(webRes.websites);
        if (webRes.websites.length > 0 && !selectedWebsiteId) {
          setSelectedWebsiteId('all');
        }
      }
      if (compRes && compRes.competitors) {
        setCompetitors(compRes.competitors);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAll() {
    const [compRes, webRes] = await Promise.all([
      fetch('/api/competitors').then(r => r.json()),
      fetch('/api/websites').then(r => r.json()),
    ]);
    return [compRes, webRes];
  }

  async function handleAddCompetitor(e: React.FormEvent) {
    e.preventDefault();
    setActionError('');
    setActionLoading(true);

    try {
      const res = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: targetWebId || (websites[0]?.id || ''),
          domain: newDomain,
          brandName: newBrandName || newDomain.split('.')[0]
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add competitor');
      }

      setIsAdding(false);
      setNewDomain('');
      setNewBrandName('');
      await loadData();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteCompetitor(id: string) {
    if (!confirm('Are you sure you want to remove this competitor?')) return;
    try {
      const res = await fetch(`/api/competitors?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCompetitors(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  }

  const filteredCompetitors = selectedWebsiteId === 'all' || !selectedWebsiteId
    ? competitors
    : competitors.filter(c => c.websiteId === selectedWebsiteId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Competitor Benchmarking</h1>
          <p className="text-slate-400 text-sm mt-1">
            Compare your AI brand visibility, citation share, and readiness against direct market competitors.
          </p>
        </div>
        <button
          onClick={() => {
            setTargetWebId(websites[0]?.id || '');
            setIsAdding(true);
          }}
          disabled={websites.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" /> Add Competitor
        </button>
      </div>

      {/* Website Filter Tab */}
      {websites.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-sm">
          <span className="text-xs text-slate-500 font-medium uppercase mr-2">Filter By Brand:</span>
          <button
            onClick={() => setSelectedWebsiteId('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedWebsiteId === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            All Websites
          </button>
          {websites.map(w => (
            <button
              key={w.id}
              onClick={() => setSelectedWebsiteId(w.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedWebsiteId === w.id ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {w.brandName} ({w.domain})
            </button>
          ))}
        </div>
      )}

      {/* Add Competitor Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Track Competitor Domain</h3>
            <p className="text-xs text-slate-400">
              Add a competing domain to run comparative visibility tests under equivalent queries.
            </p>

            {actionError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleAddCompetitor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Tracked Website</label>
                <select
                  value={targetWebId}
                  onChange={(e) => setTargetWebId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {websites.map(w => (
                    <option key={w.id} value={w.id}>{w.brandName} ({w.domain})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Competitor Domain</label>
                <input
                  type="text"
                  placeholder="e.g. competitor.com"
                  required
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Competitor Brand Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
                >
                  {actionLoading ? 'Saving...' : 'Save Competitor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Competitors List */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm animate-pulse">
            Loading competitors...
          </div>
        ) : filteredCompetitors.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-medium text-slate-300">No competitors configured</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Add your key industry rivals to monitor how AI engines cite them versus your brand.
            </p>
            {websites.length > 0 && (
              <button
                onClick={() => {
                  setTargetWebId(websites[0]?.id || '');
                  setIsAdding(true);
                }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition"
              >
                <Plus className="w-4 h-4" /> Add Competitor
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Competitor</th>
                  <th className="px-6 py-3.5 font-semibold">Domain</th>
                  <th className="px-6 py-3.5 font-semibold">Targeted Website</th>
                  <th className="px-6 py-3.5 font-semibold text-center">Last Benchmark</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredCompetitors.map((comp) => {
                  const linkedWeb = websites.find(w => w.id === comp.websiteId);
                  return (
                    <tr key={comp.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-6 py-4 font-semibold text-white">
                        {comp.brandName}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-blue-400">
                        {comp.domain}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {linkedWeb ? `${linkedWeb.brandName} (${linkedWeb.domain})` : '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-400">
                          {comp.lastScore ? `${comp.lastScore}/100` : 'Pending Next Scan'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteCompetitor(comp.id)}
                          className="p-1.5 hover:bg-rose-500/10 hover:text-rose-400 text-slate-500 rounded-lg transition"
                          title="Remove competitor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
