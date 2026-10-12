"use client"

import { Cpu } from "lucide-react"
import type { PlatformScore } from "@/lib/analyzer/types"

interface PlatformMatrixProps {
  platformScores: PlatformScore[]
}

export function PlatformMatrix({ platformScores }: PlatformMatrixProps) {
  if (!platformScores.length) return null

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-2xs">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-base font-bold text-neutral-950">
              AI Platform Score &amp; Accuracy Breakdown
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
              6 Leading Engines
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time visibility score percentage and factual accuracy rating across the world&apos;s leading generative AI search models.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-neutral-500 font-medium shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            Visibility Score %
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            Accuracy %
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {platformScores.map((plat) => (
          <div
            key={plat.id}
            className="rounded-xl border border-neutral-200/90 p-4.5 bg-neutral-50/40 hover:bg-white hover:border-neutral-300 transition-all shadow-2xs flex flex-col justify-between"
          >
            <div>
              {/* Header: Platform & Model */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs"
                    style={{
                      backgroundColor: `${plat.accentColor}18`,
                      color: plat.accentColor,
                      border: `1px solid ${plat.accentColor}33`,
                    }}
                  >
                    {plat.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 leading-tight">
                      {plat.name}
                    </h4>
                    <span className="text-[11px] font-mono text-neutral-500">
                      {plat.model}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                    plat.status === "dominant"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : plat.status === "strong"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-neutral-100 text-neutral-700 border-neutral-200"
                  }`}
                >
                  {plat.rankLabel}
                </span>
              </div>

              {/* Dual Score Meters: Visibility & Accuracy */}
              <div className="grid grid-cols-2 gap-3 mb-3 bg-white p-3 rounded-xl border border-neutral-200/80">
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-neutral-500 font-medium">Score</span>
                    <span className="font-extrabold text-neutral-950 font-mono text-sm">
                      {plat.scorePercent}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${plat.scorePercent}%`,
                        backgroundColor: plat.accentColor,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
                    AI Visibility
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-neutral-500 font-medium">Accuracy</span>
                    <span className="font-extrabold text-emerald-600 font-mono text-sm">
                      {plat.accuracyPercent}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${plat.accuracyPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-emerald-600/80 font-mono mt-1 block">
                    Fact Grounding
                  </span>
                </div>
              </div>
            </div>

            {/* Engine & Crawler detail footer */}
            <div className="pt-2.5 border-t border-neutral-200/60 flex items-center justify-between text-[11px] text-neutral-600">
              <span className="truncate font-medium">{plat.details}</span>
              <span className="shrink-0 text-neutral-400 font-mono text-[10px] ml-1 uppercase">
                {plat.sentiment}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed comparison table */}
      <div className="overflow-x-auto rounded-xl border border-neutral-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50 border-b border-neutral-200 font-semibold text-neutral-600">
            <tr>
              <th className="py-3 px-4">Platform &amp; Model</th>
              <th className="py-3 px-4">Engine Type</th>
              <th className="py-3 px-4">Visibility Score</th>
              <th className="py-3 px-4">Accuracy Rate</th>
              <th className="py-3 px-4">Recommendation Rank</th>
              <th className="py-3 px-4">Sentiment</th>
              <th className="py-3 px-4">Crawler Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200/70 bg-white">
            {platformScores.map((p) => (
              <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="py-3 px-4 font-semibold text-neutral-900">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: p.accentColor }}
                    />
                    <span>{p.name}</span>
                    <span className="text-[10px] font-mono font-normal text-neutral-400">
                      ({p.model})
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-neutral-600 font-mono text-[11px]">
                  {p.engine}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900 font-mono">
                      {p.scorePercent}%
                    </span>
                    <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${p.scorePercent}%`,
                          backgroundColor: p.accentColor,
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-700 font-mono">
                      {p.accuracyPercent}%
                    </span>
                    <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${p.accuracyPercent}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      p.status === "dominant"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : p.status === "strong"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-neutral-100 text-neutral-700 border-neutral-200"
                    }`}
                  >
                    {p.rankLabel}
                  </span>
                </td>
                <td className="py-3 px-4 text-[11px] font-mono capitalize text-neutral-600">
                  {p.sentiment}
                </td>
                <td className="py-3 px-4 text-[11px] text-neutral-600">
                  {p.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
