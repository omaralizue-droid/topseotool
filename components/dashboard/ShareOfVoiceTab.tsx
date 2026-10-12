"use client"

import { BarChart3 } from "lucide-react"

interface ShareOfVoiceItem {
  name: string
  count: number
  isTarget: boolean
}

interface ShareOfVoiceTabProps {
  sovList: ShareOfVoiceItem[]
}

export function ShareOfVoiceTab({ sovList }: ShareOfVoiceTabProps) {
  if (!sovList.length) return null

  const maxCount = Math.max(...sovList.map((x) => x.count), 1)

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-bold text-neutral-900 mb-1 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <span>AI Share of Voice in Recommendations</span>
        </h4>
        <p className="text-xs text-neutral-500">
          Frequency of brand recommendations across all tested queries in this category.
        </p>
      </div>

      <div className="space-y-3 max-w-xl">
        {sovList.map((item) => {
          const pct = Math.round((item.count / maxCount) * 100)

          return (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`font-medium ${
                    item.isTarget ? "text-blue-600 font-bold" : "text-neutral-800"
                  }`}
                >
                  {item.name} {item.isTarget ? "(Your Brand)" : ""}
                </span>
                <span className="font-mono text-neutral-500">
                  {item.count} mention{item.count === 1 ? "" : "s"}
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.isTarget ? "bg-blue-600" : "bg-neutral-400"
                  }`}
                  style={{ width: `${Math.max(pct, 6)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
