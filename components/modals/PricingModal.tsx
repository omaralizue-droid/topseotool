"use client"

import { X, Check, Sparkles, Zap, ShieldCheck } from "lucide-react"

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-neutral-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 sm:p-8 text-center border-b border-neutral-100 bg-gradient-to-b from-blue-50/50 to-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 border border-blue-200 text-blue-800 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            SaaS Monetization &amp; Plans
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950">
            Scale Your AI Search Dominance
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto mt-2">
            Unlock real-time automated tracking across SearchGPT, Perplexity, Claude, and Gemini with scheduled surveillance alerts.
          </p>
        </div>

        {/* Tiers Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-5 overflow-y-auto">
          {/* Free Tier */}
          <div className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50/40 flex flex-col justify-between">
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-bold text-neutral-900">Community</h3>
                <p className="text-[11px] text-neutral-500">For individual founders</p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-neutral-950">$0</span>
                  <span className="text-xs text-neutral-400 font-mono">/month</span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-neutral-600 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>3 public audits per day</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Gemini Search Grounding</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Copyable Fix Files (llms.txt)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Basic Share of Voice</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Current Plan
            </button>
          </div>

          {/* Pro Tier (Featured) */}
          <div className="p-5 rounded-2xl border-2 border-blue-600 bg-white shadow-md relative flex flex-col justify-between">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase font-bold tracking-wider px-3 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
              Most Popular
            </span>

            <div>
              <div className="mb-4">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-blue-600" />
                  GEO Specialist
                </h3>
                <p className="text-[11px] text-neutral-500">For growing B2B products</p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-neutral-950">$49</span>
                  <span className="text-xs text-neutral-400 font-mono">/month</span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-neutral-700 mb-6">
                <li className="flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Unlimited live audits</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>6 Live Search Engines</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Competitor Side-by-Side</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Branded White-Label PDF Export</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Weekly scheduled alert monitor</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => {
                alert("Stripe Checkout will be connected in Phase 4 billing setup.")
              }}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
            >
              Upgrade to Pro
            </button>
          </div>

          {/* Agency Tier */}
          <div className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50/40 flex flex-col justify-between">
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  Agency / Enterprise
                </h3>
                <p className="text-[11px] text-neutral-500">For agencies &amp; teams</p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-neutral-950">$199</span>
                  <span className="text-xs text-neutral-400 font-mono">/month</span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-neutral-600 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Developer API v1 Access</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Client white-label portal</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Up to 15 team seats</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Priority crawler queue</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => {
                alert("Stripe Checkout will be connected in Phase 4 billing setup.")
              }}
              className="w-full py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-800 bg-white hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
