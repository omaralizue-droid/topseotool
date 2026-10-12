"use client"

import { CheckCircle2, RefreshCw } from "lucide-react"

interface ScanProgressProps {
  currentStep: number
  stepMessage: string
}

export function ScanProgress({ currentStep, stepMessage }: ScanProgressProps) {
  const percent =
    currentStep === 1 ? 33 : currentStep === 2 ? 66 : currentStep === 3 ? 92 : 100

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-blue-200 p-6 sm:p-8 shadow-xs mb-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 animate-spin">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              Live AI Intelligence Audit in Progress
            </h3>
            <p className="text-xs text-neutral-500 font-mono">
              Step {currentStep} of 3
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-medium text-blue-600 px-2.5 py-1 rounded-full bg-blue-50">
          {percent}%
        </span>
      </div>

      <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden mb-5">
        <div
          className="h-full bg-blue-600 transition-all duration-500 rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="space-y-2.5 text-xs">
        <div
          className={`flex items-center gap-2.5 p-2 rounded-lg ${
            currentStep >= 1 ? "bg-blue-50/60 text-blue-900" : "text-neutral-400"
          }`}
        >
          {currentStep > 1 ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0" />
          )}
          <span className="font-medium">
            1. Deep crawl of homepage, robots.txt, sitemap &amp; Schema.org JSON-LD
          </span>
        </div>

        <div
          className={`flex items-center gap-2.5 p-2 rounded-lg ${
            currentStep >= 2 ? "bg-blue-50/60 text-blue-900" : "text-neutral-400"
          }`}
        >
          {currentStep > 2 ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : currentStep === 2 ? (
            <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0" />
          ) : (
            <div className="w-4 h-4 rounded-full border border-neutral-300 shrink-0" />
          )}
          <span className="font-medium">
            2. Querying live AI search engines with 6 realistic buyer questions
          </span>
        </div>

        <div
          className={`flex items-center gap-2.5 p-2 rounded-lg ${
            currentStep >= 3 ? "bg-blue-50/60 text-blue-900" : "text-neutral-400"
          }`}
        >
          {currentStep > 3 ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : currentStep === 3 ? (
            <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0" />
          ) : (
            <div className="w-4 h-4 rounded-full border border-neutral-300 shrink-0" />
          )}
          <span className="font-medium">
            3. Synthesizing strategic audit and ready-to-paste code fixes
          </span>
        </div>
      </div>

      <p className="mt-4 pt-3 border-t border-neutral-100 text-xs text-neutral-500 font-mono flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
        {stepMessage}
      </p>
    </div>
  )
}
