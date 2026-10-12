"use client"

import { useState } from "react"
import { Globe, Sparkles, RefreshCw, XCircle, Users } from "lucide-react"

export interface PresetItem {
  name: string
  url: string
  competitors?: string
}

const PRESETS: PresetItem[] = [
  { name: "Linear", url: "linear.app", competitors: "Jira, Asana, Monday" },
  { name: "Stripe", url: "stripe.com", competitors: "Adyen, PayPal, Square" },
  { name: "Notion", url: "notion.so", competitors: "Coda, Confluence, Obsidian" },
  { name: "Shopify", url: "shopify.com", competitors: "WooCommerce, BigCommerce, Magento" },
  { name: "Vercel", url: "vercel.com", competitors: "Netlify, Cloudflare, AWS Amplify" },
]

interface ScanInputProps {
  brandInput: string
  setBrandInput: (val: string) => void
  urlInput: string
  setUrlInput: (val: string) => void
  competitorsInput: string
  setCompetitorsInput: (val: string) => void
  isAnalyzing: boolean
  errorMessage: string | null
  onSubmit: (e?: React.FormEvent) => void
}

export function ScanInput({
  brandInput,
  setBrandInput,
  urlInput,
  setUrlInput,
  competitorsInput,
  setCompetitorsInput,
  isAnalyzing,
  errorMessage,
  onSubmit,
}: ScanInputProps) {
  const [showCompetitors, setShowCompetitors] = useState(false)

  const handlePreset = (preset: PresetItem) => {
    setBrandInput(preset.name)
    setUrlInput(preset.url)
    if (preset.competitors) {
      setCompetitorsInput(preset.competitors)
      setShowCompetitors(true)
    }
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-neutral-200/90 p-4 sm:p-7 shadow-xs mb-8 transition-all hover:shadow-sm">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Brand or Company Name
            </label>
            <input
              type="text"
              value={brandInput}
              onChange={(e) => setBrandInput(e.target.value)}
              placeholder="e.g. Linear, Stripe, Acme"
              disabled={isAnalyzing}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all disabled:opacity-50"
            />
          </div>

          <div className="sm:col-span-7">
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Website URL or Domain <span className="text-blue-600">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="example.com or https://..."
                required
                disabled={isAnalyzing}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Optional Competitor Comparison Row */}
        {showCompetitors ? (
          <div className="pt-1 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Benchmark Competitors (Optional)
              </label>
              <button
                type="button"
                onClick={() => setShowCompetitors(false)}
                className="text-[11px] text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                Hide
              </button>
            </div>
            <input
              type="text"
              value={competitorsInput}
              onChange={(e) => setCompetitorsInput(e.target.value)}
              placeholder="e.g. Jira, Asana, Monday (comma separated)"
              disabled={isAnalyzing}
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
          </div>
        ) : (
          <div className="pt-0.5">
            <button
              type="button"
              onClick={() => setShowCompetitors(true)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              + Add Competitors for Benchmark Comparison
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-neutral-500 font-medium mr-1">
              Sample brands:
            </span>
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handlePreset(p)}
                disabled={isAnalyzing}
                className="text-xs px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 font-medium transition-colors disabled:opacity-50 cursor-pointer"
              >
                {p.name}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={isAnalyzing}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Audit...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze AI Visibility</span>
              </>
            )}
          </button>
        </div>
      </form>

      {errorMessage && (
        <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200/80 flex items-start gap-3 text-xs text-red-800">
          <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-0.5">Analysis Notice</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  )
}
