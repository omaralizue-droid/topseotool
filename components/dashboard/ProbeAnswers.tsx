"use client"

import { Check, ExternalLink } from "lucide-react"
import type { ProbeResult, BrandProfile } from "@/lib/analyzer/types"

interface ProbeAnswersProps {
  probes: ProbeResult[]
  profile: BrandProfile
}

export function ProbeAnswers({ probes, profile }: ProbeAnswersProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-500">
          Live search-grounded answers returned for simulated buyer questions.
        </p>
        <span className="text-xs font-mono text-neutral-400">
          {probes.filter((p) => p.mentioned).length}/{probes.length} mentions
        </span>
      </div>

      <div className="space-y-4">
        {probes.map((probe) => (
          <div
            key={probe.id}
            className="rounded-xl border border-neutral-200/90 p-4 sm:p-5 hover:border-neutral-300 transition-colors bg-white shadow-2xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">
                  {probe.intent}
                </span>
                <h4 className="text-sm font-semibold text-neutral-900">
                  &ldquo;{probe.question}&rdquo;
                </h4>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {probe.mentioned ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Check className="w-3 h-3" />
                    Mentioned {probe.position ? `(#${probe.position})` : ""}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                    Not Mentioned
                  </span>
                )}

                {probe.sentiment !== "n/a" && (
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      probe.sentiment === "positive"
                        ? "bg-emerald-50 text-emerald-700"
                        : probe.sentiment === "mixed"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {probe.sentiment}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-neutral-50/80 rounded-lg p-3.5 text-xs text-neutral-700 leading-relaxed font-sans mb-3 border border-neutral-200/60 whitespace-pre-line">
              {probe.answer}
            </div>

            {/* Brands named & sources cited */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-neutral-100 text-[11px] text-neutral-500">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-neutral-700">
                  Brands Recommended:
                </span>
                {probe.brandsNamed.length > 0 ? (
                  probe.brandsNamed.map((b, i) => (
                    <span
                      key={i}
                      className={`px-1.5 py-0.5 rounded ${
                        b.toLowerCase() === profile.brand.toLowerCase()
                          ? "bg-blue-100 text-blue-800 font-bold"
                          : "bg-neutral-200/60 text-neutral-700"
                      }`}
                    >
                      {b}
                    </span>
                  ))
                ) : (
                  <span>None parsed</span>
                )}
              </div>

              {probe.sources.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-neutral-700">
                    Cited:
                  </span>
                  {probe.sources.slice(0, 3).map((s, idx) => (
                    <a
                      key={idx}
                      href={s.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-0.5"
                    >
                      <span>{s.domain}</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
