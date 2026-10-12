"use client"

import { Globe, ExternalLink } from "lucide-react"

interface SourceItem {
  domain: string
  count: number
  own: boolean
}

interface SourcesTabProps {
  topCitedSources: SourceItem[]
}

export function SourcesTab({ topCitedSources }: SourcesTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-bold text-neutral-900 mb-1 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-600" />
          <span>High-Authority Grounding Domains</span>
        </h4>
        <p className="text-xs text-neutral-500">
          Web domains that AI engines retrieve facts from when formulating answers about your category.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {topCitedSources.map((s, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              s.own
                ? "bg-blue-50/50 border-blue-200"
                : "bg-white border-neutral-200"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600 shrink-0 font-mono text-xs">
                #{idx + 1}
              </div>
              <div className="min-w-0">
                <a
                  href={`https://${s.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-neutral-900 hover:text-blue-600 truncate flex items-center gap-1 group"
                >
                  <span className="truncate">{s.domain}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 shrink-0" />
                </a>
                <span className="text-[11px] text-neutral-500">
                  {s.own ? "Your Verified Domain" : "Third-Party Authority Source"}
                </span>
              </div>
            </div>

            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 shrink-0">
              {s.count} citation{s.count === 1 ? "" : "s"}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
