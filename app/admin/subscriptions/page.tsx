'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, ShieldCheck, Check, AlertCircle, RefreshCw, Sparkles, Layers
} from 'lucide-react';

export default function AdminSubscriptionsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  async function fetchSubscriptions() {
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

  const plans = [
    {
      id: 'free',
      name: 'Free Trial',
      price: '$0 / mo',
      credits: 5,
      websitesLimit: 1,
      competitorsLimit: 0,
      pdfReports: false,
      scheduledMonitoring: false,
    },
    {
      id: 'pro',
      name: 'Professional',
      price: '$49 / mo',
      credits: 50,
      websitesLimit: 5,
      competitorsLimit: 3,
      pdfReports: true,
      scheduledMonitoring: false,
    },
    {
      id: 'agency',
      name: 'Agency & Studio',
      price: '$149 / mo',
      credits: 250,
      websitesLimit: 25,
      competitorsLimit: 25,
      pdfReports: true,
      scheduledMonitoring: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom SLA',
      credits: 10000,
      websitesLimit: 999,
      competitorsLimit: 999,
      pdfReports: true,
      scheduledMonitoring: true,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Subscriptions & Entitlements</h1>
          <p className="text-slate-400 text-sm mt-1">
            System tier configurations, entitlement boundaries, and billing integration statuses.
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchSubscriptions();
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-sm font-medium transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Plan Entitlement Matrix */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-rose-400" />
          <h2 className="text-base font-bold text-white">Backend Plan Entitlement Schemas</h2>
        </div>
        <p className="text-xs text-slate-400">
          Enforced strictly by backend middleware and route handlers on every audit creation and domain link.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {plans.map((p) => (
            <div key={p.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{p.name}</span>
                <span className="text-xs font-mono text-rose-400">{p.price}</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800/60">
                <div className="flex justify-between">
                  <span className="text-slate-500">Scan Credits:</span>
                  <span className="font-mono font-semibold">{p.credits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tracked Domains:</span>
                  <span className="font-mono font-semibold">{p.websitesLimit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Competitors:</span>
                  <span className="font-mono font-semibold">{p.competitorsLimit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">PDF Reports:</span>
                  <span className="font-semibold">{p.pdfReports ? '✓ Yes' : '✗ No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scheduled Runs:</span>
                  <span className="font-semibold">{p.scheduledMonitoring ? '✓ Yes' : '✗ No'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Gateway Configuration Status */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-bold text-white">Payment Webhook Integrations</h2>
        </div>
        <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-white">Stripe / Webhook Integration Safeguard:</div>
            In compliance with enterprise security requirements, subscriptions are never updated via client-side requests. When <code className="text-rose-400 bg-slate-900 px-1 py-0.5 rounded">STRIPE_WEBHOOK_SECRET</code> is active in the production environment, signed webhook payloads automatically reconcile billing events.
          </div>
        </div>
      </div>
    </div>
  );
}
