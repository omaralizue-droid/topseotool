"use client"

import { ListTodo } from "lucide-react"
import type { ActionItem } from "@/lib/analyzer/types"

interface ActionPlanTabProps {
  actions: ActionItem[]
}

export function ActionPlanTab({ actions }: ActionPlanTabProps) {
  if (!actions.length) return null

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-bold text-neutral-900 mb-1 flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-blue-600" />
          <span>Prioritized GEO / AEO Strategic Action Plan</span>
        </h4>
        <p className="text-xs text-neutral-500">
          Specific architectural and content fixes ordered by impact to improve how generative engines recommend your brand.
        </p>
      </div>

      <div className="space-y-3">
        {actions.map((act, i) => (
          <div
            key={i}
            className="rounded-xl border border-neutral-200 p-4 bg-white flex flex-col sm:flex-row sm:items-start justify-between gap-3 shadow-2xs hover:border-neutral-300 transition-colors"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded ${
                    act.impact === "high"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : act.impact === "medium"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {act.impact} Impact
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                  {act.area}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  {act.effort} effort
                </span>
              </div>

              <h5 className="text-sm font-bold text-neutral-900">
                {act.title}
              </h5>
              <p className="text-xs text-neutral-600 leading-relaxed">
                <strong className="text-neutral-800">Why:</strong> {act.why}
              </p>
              <p className="text-xs text-neutral-800 leading-relaxed bg-neutral-50 p-2.5 rounded-lg border border-neutral-200/60 font-sans">
                <strong className="text-blue-700">How to fix:</strong> {act.how}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
