"use client"

import { Users, Trophy, Award } from "lucide-react"
import type { CompetitorComparisonItem } from "@/lib/analyzer/scoring"

interface CompetitorComparisonProps {
  competitorItems: CompetitorComparisonItem[]
  targetBrand: string
}

export function CompetitorComparison({
  competitorItems,
  targetBrand,
}: CompetitorComparisonProps) {
  if (!competitorItems.length) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Competitor AI Recommendation Benchmark</span>
          </h4>
          <p className="text-xs text-neutral-500">
            Head-to-head comparison of recommendation frequency, positioning tier, and sentiment against top category contenders.
          </p>
        </div>
        <span className="text-xs font-mono text-neutral-400">
          {competitorItems.length} Brands Evaluated
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50 border-b border-neutral-200 font-semibold text-neutral-600">
            <tr>
              <th className="py-3 px-4">Brand</th>
              <th className="py-3 px-4">Recommendation Rate</th>
              <th className="py-3 px-4">Query Mentions</th>
              <th className="py-3 px-4">AI Prominence</th>
              <th className="py-3 px-4">Engine Sentiment</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200/70 bg-white">
            {competitorItems.map((item, idx) => (
              <tr
                key={item.brand}
                className={`transition-colors ${
                  item.isTarget
                    ? "bg-blue-50/50 hover:bg-blue-50/80 font-medium"
                    : "hover:bg-neutral-50/50"
                }`}
              >
                <td className="py-3.5 px-4 font-semibold text-neutral-900">
                  <div className="flex items-center gap-2">
                    {idx === 0 ? (
                      <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                    ) : item.isTarget ? (
                      <Award className="w-4 h-4 text-blue-600 shrink-0" />
                    ) : (
                      <span className="w-4 text-center font-mono text-neutral-400 text-[11px]">
                        #{idx + 1}
                      </span>
                    )}
                    <span>{item.brand}</span>
                    {item.isTarget && (
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold border border-blue-200">
                        Target Brand
                      </span>
                    )}
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900 font-mono">
                      {item.mentionPercent}%
                    </span>
                    <div className="w-20 h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.isTarget ? "bg-blue-600" : "bg-neutral-400"
                        }`}
                        style={{ width: `${Math.max(item.mentionPercent, 5)}%` }}
                      />
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4 font-mono text-neutral-700">
                  {item.mentionCount} queries
                </td>

                <td className="py-3.5 px-4">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                      item.prominence === "lead"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : item.prominence === "listed"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : item.prominence === "passing"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {item.prominence}
                  </span>
                </td>

                <td className="py-3.5 px-4">
                  <span
                    className={`text-[11px] font-mono capitalize ${
                      item.sentiment === "positive"
                        ? "text-emerald-700 font-medium"
                        : item.sentiment === "mixed"
                        ? "text-amber-700"
                        : "text-neutral-500"
                    }`}
                  >
                    {item.sentiment}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-[11px] text-neutral-600">
                  {item.isTarget ? (
                    <span className="text-blue-700 font-semibold">Active Subject</span>
                  ) : item.mentionCount > 0 ? (
                    <span>Direct Rival</span>
                  ) : (
                    <span className="text-neutral-400">Unsurfaced</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
