"use client"

import { Sparkles, CheckCircle2, AlertCircle } from "lucide-react"
import type { AiReport } from "@/lib/analyzer/types"

interface ExecutiveSummaryProps {
  report: AiReport
}

export function ExecutiveSummary({ report }: ExecutiveSummaryProps) {
  return (
    <div className="bg-blue-50/70 rounded-2xl border border-blue-200/80 p-5 sm:p-6 text-neutral-800">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              AI Executive Verdict
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
              {report.source === "ai" ? "Gemini Synthesized" : "Rules Derived"}
            </span>
          </div>
          <p className="text-sm font-semibold text-neutral-900 leading-snug">
            {report.verdict}
          </p>
          <p className="text-xs text-neutral-600 leading-relaxed">
            {report.perception}
          </p>

          {(report.strengths.length > 0 || report.gaps.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 mt-3 border-t border-blue-200/60 text-xs">
              {report.strengths.length > 0 && (
                <div className="space-y-1">
                  <span className="font-semibold text-emerald-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Key Identified Strengths
                  </span>
                  <ul className="space-y-1 text-neutral-700">
                    {report.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">&bull;</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {report.gaps.length > 0 && (
                <div className="space-y-1">
                  <span className="font-semibold text-amber-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Primary Optimization Gaps
                  </span>
                  <ul className="space-y-1 text-neutral-700">
                    {report.gaps.map((g, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">&bull;</span>
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
