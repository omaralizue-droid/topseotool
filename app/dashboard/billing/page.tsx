'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Check, ShieldCheck, Zap, AlertCircle, Building2, Sparkles, CheckCircle2
} from 'lucide-react';

export default function BillingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.user) setUser(d.user);
      })
      .finally(() => setLoading(false));
  }, []);

  const currentPlan = user?.plan || 'free';
  const scanCredits = user?.scanCredits ?? 0;

  const plans = [
    {
      id: 'free',
      name: 'Free Trial',
      price: '$0',
      period: 'forever',
      description: 'Essential AI visibility diagnostics for single websites.',
      features: [
        '5 AI visibility scan credits',
        '1 Tracked domain',
        'Standard report history',
        'Robots.txt & schema validation',
        'Community support',
      ],
      current: currentPlan === 'free',
      buttonText: currentPlan === 'free' ? 'Current Plan' : 'Downgrade',
      disabled: true,
    },
    {
      id: 'pro',
      name: 'Professional',
      price: '$49',
      period: 'per month',
      description: 'For growing brands, digital marketers, and in-house SEO teams.',
      features: [
        '50 AI visibility scan credits / mo',
        '5 Tracked domains',
        '3 Competitor benchmark profiles',
        'Multi-engine coverage (ChatGPT, Gemini, Perplexity)',
        'Printable PDF reports',
        'Priority technical support',
      ],
      popular: true,
      current: currentPlan === 'pro',
      buttonText: currentPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
    },
    {
      id: 'agency',
      name: 'Agency & Studio',
      price: '$149',
      period: 'per month',
      description: 'Built for agencies managing client brand authority and GEO optimization.',
      features: [
        '250 AI visibility scan credits / mo',
        '25 Tracked client websites',
        'Unlimited competitor analyses',
        'White-label PDF report export',
        'Automated scheduled monitoring',
        'Dedicated account manager',
      ],
      current: currentPlan === 'agency',
      buttonText: currentPlan === 'agency' ? 'Current Plan' : 'Upgrade to Agency',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      period: 'annual billing',
      description: 'Dedicated infrastructure, custom SLAs, and custom LLM evaluation suites.',
      features: [
        'Unlimited custom scan credits',
        'Unlimited client & subsidiary domains',
        'Custom LLM evaluation queries',
        'REST API access & webhook events',
        '99.9% uptime SLA',
        'Custom SSO & role-based teams',
      ],
      current: currentPlan === 'enterprise',
      buttonText: currentPlan === 'enterprise' ? 'Current Plan' : 'Contact Sales',
    },
  ];

  function handlePlanAction(planId: string) {
    if (planId === currentPlan) return;
    alert(
      'Payment provider integration (Stripe / LemonSqueezy) is currently in sandbox staging. No checkout session has been charged. Contact your administrator to adjust plan entitlements.'
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Subscription & Usage Metering</h1>
        <p className="text-slate-400 text-sm mt-1">
          Review your active SaaS tier, remaining scan credits, and enterprise feature allowances.
        </p>
      </div>

      {/* Current Usage Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Active Subscription</div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-white capitalize">{currentPlan} Tier</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Account ID: <span className="font-mono text-slate-300">{user?.id?.slice(0, 14)}...</span>
          </p>
        </div>

        <div className="flex items-center gap-8 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-8">
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Remaining Scan Credits</div>
            <div className="text-3xl font-extrabold text-blue-400 mt-0.5">{scanCredits}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Renewal Status</div>
            <div className="text-sm font-medium text-slate-300 mt-1">Free Tier / No Auto-Billing</div>
          </div>
        </div>
      </div>

      {/* Notice on Real Payments */}
      <div className="p-4 bg-slate-900 border border-blue-500/20 rounded-xl flex items-start gap-3 text-xs text-slate-300">
        <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Commercial SaaS Staging Note:</span> Live payment checkouts (Stripe/Paddle) require production webhook signing secrets. In accordance with enterprise specifications, plans cannot be upgraded by mock browser buttons. Upgrades are verified strictly through authenticated backend webhooks.
        </div>
      </div>

      {/* Tier Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`relative rounded-xl flex flex-col justify-between p-6 transition ${
              p.current
                ? 'bg-blue-950/20 border-2 border-blue-500 shadow-xl shadow-blue-500/10'
                : p.popular
                ? 'bg-slate-900/80 border border-blue-500/40'
                : 'bg-slate-900/60 border border-slate-800'
            }`}
          >
            {p.popular && !p.current && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-0.5 rounded-full shadow">
                Most Popular
              </span>
            )}
            {p.current && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-0.5 rounded-full shadow">
                Current Plan
              </span>
            )}

            <div>
              <h3 className="text-lg font-bold text-white">{p.name}</h3>
              <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{p.description}</p>
              
              <div className="my-5">
                <span className="text-3xl font-extrabold text-white">{p.price}</span>
                <span className="text-xs text-slate-400 ml-1.5">{p.period}</span>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-800 text-xs">
                {p.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2 text-slate-300">
                    <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handlePlanAction(p.id)}
              disabled={p.disabled || p.current}
              className={`w-full mt-6 py-2 px-4 rounded-lg text-xs font-semibold transition ${
                p.current
                  ? 'bg-slate-800 text-slate-500 cursor-default'
                  : p.popular
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {p.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
