"use client"

import React from "react"

interface TrendPoint {
  date: string
  seoScore: number
  aiVisibility: number
}

export function ScoreTrendChart({
  data,
  accentColor = "#6366f1",
}: {
  data: TrendPoint[]
  accentColor?: string
}) {
  if (!data || data.length === 0) return null

  const W = 520
  const H = 160
  const padL = 36
  const padR = 20
  const padT = 20
  const padB = 30
  const chartW = W - padL - padR
  const chartH = H - padT - padB

  const minVal = 50
  const maxVal = 100

  const getX = (idx: number) => padL + (idx / (data.length - 1)) * chartW
  const getY = (val: number) => padT + chartH - ((val - minVal) / (maxVal - minVal)) * chartH

  // Generate paths
  const seoPoints = data.map((d, i) => `${getX(i)},${getY(d.seoScore)}`)
  const aiPoints = data.map((d, i) => `${getX(i)},${getY(d.aiVisibility)}`)

  const seoLine = seoPoints.join(" ")
  const aiLine = aiPoints.join(" ")

  const seoArea = `${getX(0)},${getY(minVal)} ${seoLine} ${getX(data.length - 1)},${getY(minVal)}`
  const aiArea = `${getX(0)},${getY(minVal)} ${aiLine} ${getX(data.length - 1)},${getY(minVal)}`

  return (
    <div className="w-full bg-card p-4 rounded-xl border border-border">
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>SEO Health</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: accentColor }} />
            <span>AI Search Visibility</span>
          </div>
        </div>
        <span className="text-[11px] text-muted-foreground font-mono">Historical Performance</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible font-mono text-[10px]">
        {/* Horizontal grid lines */}
        {[60, 80, 100].map((level) => {
          const y = getY(level)
          return (
            <g key={level}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="currentColor" strokeOpacity={0.1} strokeDasharray="3 3" />
              <text x={padL - 6} y={y + 3} textAnchor="end" fill="currentColor" opacity={0.45} fontSize={9}>
                {level}
              </text>
            </g>
          )
        })}

        {/* AI Area & Line */}
        <polygon points={aiArea} fill={accentColor} fillOpacity={0.12} />
        <polyline points={aiLine} fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          <circle key={`ai-${i}`} cx={getX(i)} cy={getY(d.aiVisibility)} r={3.5} fill={accentColor} stroke="#ffffff" strokeWidth="1.5" />
        ))}

        {/* SEO Area & Line */}
        <polygon points={seoArea} fill="#10b981" fillOpacity={0.1} />
        <polyline points={seoLine} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          <circle key={`seo-${i}`} cx={getX(i)} cy={getY(d.seoScore)} r={3.5} fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
        ))}

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text key={`lbl-${i}`} x={getX(i)} y={H - 8} textAnchor="middle" fill="currentColor" opacity={0.6} fontSize={10}>
            {d.date}
          </text>
        ))}
      </svg>
    </div>
  )
}

export function KeywordDistributionChart({
  distribution,
  accentColor = "#6366f1",
}: {
  distribution: Array<{ tier: string; count: number; percentage: number }>
  accentColor?: string
}) {
  const tierColors = ["#10b981", accentColor, "#f59e0b", "#94a3b8"]

  return (
    <div className="w-full bg-card p-4 rounded-xl border border-border space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Keyword Ranking Tiers</h4>
        <span className="text-[11px] text-muted-foreground font-mono">1,420 Tracked Queries</span>
      </div>

      {/* Horizontal stacked progress bar */}
      <div className="w-full h-5 rounded-lg overflow-hidden flex bg-muted/40 p-0.5 gap-0.5">
        {distribution.map((item, idx) => (
          <div
            key={item.tier}
            style={{ width: `${item.percentage}%`, backgroundColor: tierColors[idx % tierColors.length] }}
            className="h-full rounded-xs transition-all duration-300"
            title={`${item.tier}: ${item.count} keywords (${item.percentage}%)`}
          />
        ))}
      </div>

      {/* Legend & Details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {distribution.map((item, idx) => (
          <div key={item.tier} className="p-2 rounded-lg bg-muted/30 border border-border/40 text-left">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tierColors[idx % tierColors.length] }} />
              <span className="text-[11px] font-medium text-foreground truncate">{item.tier}</span>
            </div>
            <p className="text-base font-extrabold font-mono text-foreground">{item.count.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">{item.percentage}% of catalog</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CompetitorBenchmarkChart({
  competitors,
  accentColor = "#6366f1",
}: {
  competitors: Array<{ domain: string; seoScore: number; aiScore: number; dr: number }>
  accentColor?: string
}) {
  return (
    <div className="w-full bg-card p-4 rounded-xl border border-border space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Competitor Domain Authority & AI Visibility</h4>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-emerald-500" /> SEO Health</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs" style={{ backgroundColor: accentColor }} /> AI Visibility</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-sky-500" /> Domain Rating</span>
        </div>
      </div>

      <div className="space-y-2.5 pt-1">
        {competitors.map((c, i) => {
          const isUserSite = i === 0
          return (
            <div
              key={c.domain}
              className={`p-2.5 rounded-lg border ${
                isUserSite ? "border-brand/40 bg-brand-muted/20" : "border-border/50 bg-muted/20"
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold flex items-center gap-1.5">
                  {c.domain}
                  {isUserSite && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full font-extrabold uppercase tracking-wide bg-brand text-brand-foreground">
                      Your Site
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">SEO {c.seoScore}</span>
                  <span className="text-brand font-bold">AI {c.aiScore}</span>
                  <span className="text-sky-600 dark:text-sky-400 font-bold">DR {c.dr}</span>
                </div>
              </div>

              {/* Multi-bars */}
              <div className="space-y-1">
                <div className="w-full h-1.5 bg-muted/60 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c.seoScore}%` }} />
                </div>
                <div className="w-full h-1.5 bg-muted/60 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${c.aiScore}%`, backgroundColor: accentColor }} />
                </div>
                <div className="w-full h-1.5 bg-muted/60 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: `${c.dr}%` }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
