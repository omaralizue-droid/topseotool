'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Globe, Shield, CheckCircle2, AlertTriangle, ArrowLeft,
  Printer, Share2, Sparkles, Database, ExternalLink, Activity, Info
} from 'lucide-react';

export default function ReportDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function init() {
      if (!id) return;
      try {
        const res = await fetch(`/api/reports/${id}`);
        if (!res.ok) {
          if (!ignore) setError('Report not found or private');
          return;
        }
        const data = await res.json();
        if (!ignore) setReport(data.report);
      } catch (err: any) {
        if (!ignore) setError(err.message || 'Failed to load report');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, [id]);

  function handlePrint() {
    window.print();
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 animate-spin text-blue-500" />
          <span>Loading verified report...</span>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
        <h1 className="text-xl font-bold text-white mb-2">Report Unavailable</h1>
        <p className="text-slate-400 text-sm max-w-md mb-6">{error || 'This report may be private or deleted.'}</p>
        <Link
          href="/"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition"
        >
          Return to Homepage
        </Link>
      </div>
    );
  }

  const payload = report.payload || {};
  const readiness = payload.readiness || {};
  const providers = payload.providers || [];
  const competitors = payload.competitors || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 print:bg-white print:text-black">
      {/* Top Header / Actions Bar (Hidden on print) */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-6 py-4 print:hidden">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/reports"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-sm">{report.brandName}</span>
              <span className="text-xs text-slate-400 font-mono">({report.domain})</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition border border-slate-700"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copied ? 'Link Copied!' : 'Share Link'}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition shadow-md shadow-blue-600/20"
            >
              <Printer className="w-3.5 h-3.5" /> Print / PDF
            </button>
          </div>
        </div>
      </header>

      {/* Main Report Document */}
      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8 print:p-0 print:space-y-6">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-8 print:border-neutral-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-3 print:border-neutral-400 print:text-black">
                <Sparkles className="w-3 h-3" /> Official TopSEOTool Audit
              </div>
              <h1 className="text-3xl font-extrabold text-white print:text-black tracking-tight">
                AI Brand Visibility Report
              </h1>
              <p className="text-slate-400 print:text-neutral-600 text-sm mt-1">
                Generated for <span className="text-white print:text-black font-semibold">{report.brandName}</span> ({report.domain}) on {new Date(report.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}.
              </p>
            </div>
            <div className="text-right sm:text-right">
              <div className="text-xs uppercase tracking-wider text-slate-400 print:text-neutral-500 font-semibold">Overall Visibility Score</div>
              <div className="text-4xl font-extrabold text-blue-400 print:text-black mt-1">
                {report.overallScore}<span className="text-xl text-slate-500 print:text-neutral-400">/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 print:border-neutral-300 print:bg-white">
            <div className="text-xs text-slate-400 print:text-neutral-500 font-medium uppercase">Technical AI Readiness</div>
            <div className="text-2xl font-bold text-white print:text-black mt-2">{report.readinessScore}%</div>
            <p className="text-xs text-slate-400 print:text-neutral-600 mt-1">
              Crawler access (robots.txt), schema markup, and metadata optimization.
            </p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 print:border-neutral-300 print:bg-white">
            <div className="text-xs text-slate-400 print:text-neutral-500 font-medium uppercase">AI Engine Mention Rate</div>
            <div className="text-2xl font-bold text-white print:text-black mt-2">{report.mentionRate}%</div>
            <p className="text-xs text-slate-400 print:text-neutral-600 mt-1">
              Percentage of multi-engine queries where brand was directly recognized.
            </p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 print:border-neutral-300 print:bg-white">
            <div className="text-xs text-slate-400 print:text-neutral-500 font-medium uppercase">Verified Citations</div>
            <div className="text-2xl font-bold text-white print:text-black mt-2">{report.citationsCount}</div>
            <p className="text-xs text-slate-400 print:text-neutral-600 mt-1">
              Explicit backlinks and domain reference points returned by search & LLM syntheses.
            </p>
          </div>
        </div>

        {/* Technical Readiness Details */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 print:border-neutral-300 print:bg-white space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white print:text-black">1. Technical AI Readiness Breakdown</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800/80 print:bg-neutral-50 print:border-neutral-200">
              <span className="text-xs text-slate-400 print:text-neutral-500">Robots.txt & AI Crawlers</span>
              <div className="text-sm font-semibold mt-1 text-slate-200 print:text-black">
                {readiness.robotsTxtAllowed ? '✓ Allowed (GPTBot, PerplexityBot)' : '⚠️ Restrictive Crawl Rules'}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800/80 print:bg-neutral-50 print:border-neutral-200">
              <span className="text-xs text-slate-400 print:text-neutral-500">JSON-LD Schema Markup</span>
              <div className="text-sm font-semibold mt-1 text-slate-200 print:text-black">
                {readiness.hasJsonLd ? `✓ Detected (${readiness.schemaTypes?.join(', ') || 'Entity'})` : '✗ Missing Schema'}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800/80 print:bg-neutral-50 print:border-neutral-200">
              <span className="text-xs text-slate-400 print:text-neutral-500">OpenGraph & Meta Tags</span>
              <div className="text-sm font-semibold mt-1 text-slate-200 print:text-black">
                {readiness.hasOpenGraph ? '✓ Configured' : '⚠️ Incomplete'}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800/80 print:bg-neutral-50 print:border-neutral-200">
              <span className="text-xs text-slate-400 print:text-neutral-500">Crawl Latency / Health</span>
              <div className="text-sm font-semibold mt-1 text-slate-200 print:text-black">
                {readiness.statusCode === 200 ? '✓ 200 OK Fast' : `HTTP ${readiness.statusCode || 200}`}
              </div>
            </div>
          </div>
        </div>

        {/* AI Engine & Provider Evidence */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 print:border-neutral-300 print:bg-white space-y-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white print:text-black">2. AI Engine Brand Mentions & Evidence</h2>
          </div>
          <p className="text-xs text-slate-400 print:text-neutral-600">
            Real multi-provider queries testing brand recognition and knowledge graph retrieval.
          </p>

          <div className="space-y-3 pt-2">
            {providers.length > 0 ? (
              providers.map((p: any, idx: number) => {
                const isNotConfigured = p.status === "not_configured";
                const isFailed = p.status === "failed" || p.status === "error";
                const isRateLimited = p.status === "rate_limited";
                const isCompleted = p.status === "completed" || (!p.status && typeof p.mentioned === "boolean");

                return (
                  <div key={idx} className="p-4 rounded-lg bg-slate-950/50 border border-slate-800/80 print:bg-neutral-50 print:border-neutral-200 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white print:text-black uppercase tracking-wider">{p.provider || p.name}</span>
                        {p.model && (
                          <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            {p.model}
                          </span>
                        )}
                      </div>
                      
                      {isCompleted && (
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          p.mentioned ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {p.mentioned ? 'Mention Confirmed' : 'No Direct Mention'}
                        </span>
                      )}
                      {isNotConfigured && (
                        <span className="text-xs px-2 py-0.5 rounded font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          API Not Configured
                        </span>
                      )}
                      {isRateLimited && (
                        <span className="text-xs px-2 py-0.5 rounded font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Rate Limited (429)
                        </span>
                      )}
                      {isFailed && (
                        <span className="text-xs px-2 py-0.5 rounded font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Check Unavailable
                        </span>
                      )}
                    </div>

                    {p.query && (
                      <div className="text-[11px] text-slate-400 font-mono">
                        Query tested: &ldquo;{p.query}&rdquo;
                      </div>
                    )}

                    {p.citationUrls && p.citationUrls.length > 0 ? (
                      <div className="text-xs text-blue-400 space-y-1">
                        <span className="text-slate-400 text-[11px] block">Verified Citations:</span>
                        {p.citationUrls.map((url: string, cIdx: number) => (
                          <div key={cIdx} className="truncate">
                            <a href={url} target="_blank" rel="noreferrer" className="underline hover:text-blue-300">
                              {url}
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : p.citationUrl ? (
                      <div className="text-xs text-blue-400 truncate">
                        Citation: <a href={p.citationUrl} target="_blank" rel="noreferrer" className="underline hover:text-blue-300">{p.citationUrl}</a>
                      </div>
                    ) : null}

                    {p.snippet && (
                      <p className="text-xs text-slate-300 print:text-neutral-700 bg-slate-900/80 p-2.5 rounded border border-slate-800/50 font-mono">
                        &ldquo;{p.snippet}&rdquo;
                      </p>
                    )}

                    {p.error && (
                      <p className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800/60 font-mono">
                        {p.error}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800 text-sm text-slate-400">
                Detailed provider evidence recorded during technical audit.
              </div>
            )}
            <p className="text-[11px] text-slate-500 italic pt-2">
              Note: Provider evidence captures API search grounding at scan timestamp. End-user consumer chat experiences may vary with conversational personalization and geographic routing.
            </p>
          </div>
        </div>

        {/* Competitor Benchmarking */}
        {competitors.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 print:border-neutral-300 print:bg-white space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white print:text-black">3. Competitor Benchmarking</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Entity</th>
                    <th className="py-2.5 px-4 font-semibold">Domain</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr className="bg-blue-900/20">
                    <td className="py-2.5 px-4 font-bold text-white">{report.brandName} (Your Brand)</td>
                    <td className="py-2.5 px-4 font-mono text-slate-300">{report.domain}</td>
                    <td className="py-2.5 px-4 text-center font-bold text-blue-400">{report.overallScore}/100</td>
                  </tr>
                  {competitors.map((comp: any, i: number) => (
                    <tr key={i}>
                      <td className="py-2.5 px-4 text-slate-200">{comp.name || comp.domain}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-400">{comp.domain}</td>
                      <td className="py-2.5 px-4 text-center text-slate-300">{comp.score || '—'}/100</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Disclaimer */}
        <div className="pt-6 border-t border-slate-800 text-center text-xs text-slate-500 print:text-neutral-500">
          <p>
            Generated securely by TopSEOTool Enterprise AI Visibility Platform. 
            All audits are conducted with rate-limited, authorized search and LLM indexing models.
          </p>
        </div>
      </main>
    </div>
  );
}
