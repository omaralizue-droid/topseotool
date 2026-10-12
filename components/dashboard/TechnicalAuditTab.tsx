"use client"

import { useState } from "react"
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle } from "lucide-react"
import type { ReadinessCheck } from "@/lib/analyzer/types"

interface TechnicalAuditTabProps {
  checks: ReadinessCheck[]
}

export function TechnicalAuditTab({ checks }: TechnicalAuditTabProps) {
  const [auditFilter, setAuditFilter] = useState<"all" | "fail" | "warn" | "pass">("all")

  const filteredChecks = checks.filter((c) => {
    if (auditFilter === "all") return true
    return c.status === auditFilter
  })

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-neutral-900 mb-0.5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Technical &amp; Crawler Readiness Checks</span>
          </h4>
          <p className="text-xs text-neutral-500">
            Signals analyzed from your live website, robots.txt, metadata, and Schema.org markup.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg text-xs font-medium self-start">
          {(["all", "fail", "warn", "pass"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setAuditFilter(filter)}
              className={`px-2.5 py-1 rounded-md capitalize transition-colors cursor-pointer ${
                auditFilter === filter
                  ? "bg-white text-neutral-900 shadow-2xs font-bold"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredChecks.map((check) => (
          <div
            key={check.id}
            className="rounded-xl border border-neutral-200/90 p-4 bg-white flex items-start gap-3 shadow-2xs"
          >
            <div className="mt-0.5 shrink-0">
              {check.status === "pass" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : check.status === "warn" ? (
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-neutral-900">
                  {check.label}
                </span>
                <span
                  className={`text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                    check.status === "pass"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : check.status === "warn"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {check.status}
                </span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {check.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
