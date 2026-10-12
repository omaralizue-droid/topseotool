"use client"

import type { PlatformScore } from "@/lib/analyzer/types"

interface EngineRadarChartProps {
  platformScores: PlatformScore[]
  brand: string
}

export function EngineRadarChart({ platformScores, brand }: EngineRadarChartProps) {
  if (!platformScores.length) return null

  // Radar geometry calculations
  const size = 320
  const center = size / 2
  const radius = 110
  const total = platformScores.length
  const angleStep = (Math.PI * 2) / total

  // Concentric polygon rings (20%, 40%, 60%, 80%, 100%)
  const rings = [0.2, 0.4, 0.6, 0.8, 1.0]

  const getCoordinates = (index: number, valueFactor: number) => {
    const angle = index * angleStep - Math.PI / 2
    const r = radius * valueFactor
    const x = center + r * Math.cos(angle)
    const y = center + r * Math.sin(angle)
    return { x, y }
  }

  // Polygon points for Visibility Score
  const scorePolygon = platformScores
    .map((p, i) => {
      const factor = Math.max(0.1, Math.min(1.0, p.scorePercent / 100))
      const { x, y } = getCoordinates(i, factor)
      return `${x},${y}`
    })
    .join(" ")

  // Polygon points for Fact Accuracy
  const accuracyPolygon = platformScores
    .map((p, i) => {
      const factor = Math.max(0.1, Math.min(1.0, p.accuracyPercent / 100))
      const { x, y } = getCoordinates(i, factor)
      return `${x},${y}`
    })
    .join(" ")

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-neutral-100">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
            <span>AI Model Visibility Radar</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
              Multi-Engine Footprint
            </span>
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Radial footprint comparing visibility penetration vs. fact grounding accuracy for <strong>{brand}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-neutral-600">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-600/70 border border-blue-600 inline-block" />
            Visibility Score %
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500/70 border border-emerald-500 inline-block" />
            Accuracy Grounding %
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-around gap-6">
        {/* SVG Radar */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg width={size} height={size} className="overflow-visible">
            {/* Background circular web rings */}
            {rings.map((ring, rIdx) => {
              const ringPoints = platformScores
                .map((_, i) => {
                  const { x, y } = getCoordinates(i, ring)
                  return `${x},${y}`
                })
                .join(" ")
              return (
                <polygon
                  key={rIdx}
                  points={ringPoints}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray={rIdx === rings.length - 1 ? undefined : "3 3"}
                />
              )
            })}

            {/* Axis spokes */}
            {platformScores.map((_, i) => {
              const { x, y } = getCoordinates(i, 1.0)
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
              )
            })}

            {/* Visibility Score Polygon */}
            <polygon
              points={scorePolygon}
              fill="rgba(37, 99, 235, 0.2)"
              stroke="#2563eb"
              strokeWidth="2"
            />

            {/* Accuracy Polygon */}
            <polygon
              points={accuracyPolygon}
              fill="rgba(16, 185, 129, 0.15)"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="4 2"
            />

            {/* Radar vertex dots & labels */}
            {platformScores.map((p, i) => {
              const { x, y } = getCoordinates(i, Math.max(0.1, p.scorePercent / 100))
              const labelPos = getCoordinates(i, 1.22)

              return (
                <g key={p.id}>
                  <circle cx={x} cy={y} r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-[11px] font-bold fill-neutral-800 font-sans"
                  >
                    {p.name}
                  </text>
                  <text
                    x={labelPos.x}
                    y={labelPos.y + 12}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-[9.5px] font-mono fill-neutral-500"
                  >
                    {p.scorePercent}%
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Quick Highlights Legend */}
        <div className="grid grid-cols-2 gap-2.5 w-full max-w-sm text-xs">
          {platformScores.map((p) => (
            <div
              key={p.id}
              className="p-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50/50 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-bold text-neutral-900">{p.name}</span>
                <span className="font-mono font-extrabold text-blue-600">
                  {p.scorePercent}%
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-neutral-500">
                <span>Accuracy: {p.accuracyPercent}%</span>
                <span className="capitalize text-[10px] font-mono text-neutral-400">
                  {p.sentiment}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
