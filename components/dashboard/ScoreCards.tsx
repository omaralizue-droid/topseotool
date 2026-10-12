"use client"

import type { VisibilityBreakdown } from "@/lib/analyzer/scoring"

interface ScoreCardsProps {
  overallScore: number
  tier: { label: string; tone: "great" | "good" | "fair" | "poor" }
  visibilityBreakdown: VisibilityBreakdown | null
  readinessScore: number
}

export function ScoreCards({
  overallScore,
  tier,
  visibilityBreakdown,
  readinessScore,
}: ScoreCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* Overall Score */}
      <div className="col-span-2 lg:col-span-1 bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
            Overall AI Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight text-neutral-950">
              {overallScore}
            </span>
            <span className="text-xs text-neutral-400 font-mono">/100</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              tier.tone === "great"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : tier.tone === "good"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : tier.tone === "fair"
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {tier.label}
          </span>
          <span className="text-[11px] text-neutral-400">
            Weighted 60/40
          </span>
        </div>
      </div>

      {/* Discovery Rate */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
            AI Discovery Rate
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold tracking-tight text-neutral-950">
              {visibilityBreakdown?.discoveryRate ?? 0}%
            </span>
          </div>
        </div>
        <p className="text-[11px] text-neutral-500 mt-3 pt-3 border-t border-neutral-100">
          Surfaced in unbranded category queries
        </p>
      </div>

      {/* Recognition Rate */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
            Recognition Rate
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold tracking-tight text-neutral-950">
              {visibilityBreakdown?.recognitionRate ?? 0}%
            </span>
          </div>
        </div>
        <p className="text-[11px] text-neutral-500 mt-3 pt-3 border-t border-neutral-100">
          Identified in brand &amp; review queries
        </p>
      </div>

      {/* Verified Citations */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
            Citation Rate
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold tracking-tight text-neutral-950">
              {visibilityBreakdown?.citationRate ?? 0}%
            </span>
          </div>
        </div>
        <p className="text-[11px] text-neutral-500 mt-3 pt-3 border-t border-neutral-100">
          Direct domain links cited in answers
        </p>
      </div>

      {/* Technical Readiness */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
            Technical Readiness
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-neutral-950">
              {readinessScore}
            </span>
            <span className="text-xs text-neutral-400 font-mono">/100</span>
          </div>
        </div>
        <p className="text-[11px] text-neutral-500 mt-3 pt-3 border-t border-neutral-100">
          Robots.txt, JSON-LD, speed &amp; tags
        </p>
      </div>
    </div>
  )
}
