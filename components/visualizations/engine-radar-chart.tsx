"use client"

import { useState } from "react"
import type { EngineRankData } from "@/types/quick-check"

interface EngineRadarChartProps {
  engines: EngineRankData[]
  brandName: string
}

export function EngineRadarChart({ engines, brandName }: EngineRadarChartProps) {
  const [hoveredEngine, setHoveredEngine] = useState<EngineRankData | null>(null)

  // Radar chart constants
  const size = 320
  const center = size / 2
  const radius = 105
  const levels = [0.25, 0.5, 0.75, 1.0]
  const count = engines.length || 6

  // Compute (x, y) for a given index and value (0-100)
  const getCoordinates = (index: number, score: number) => {
    const angle = (Math.PI * 2 / count) * index - Math.PI / 2
    const distance = (score / 100) * radius
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle),
    }
  }

  // Polygon points
  const points = engines.map((e, i) => {
    // Score based on mentionRate and rankPosition
    const score = e.rankPosition === 1 ? 98 : e.rankPosition === 2 ? 88 : e.rankPosition === 3 ? 76 : e.mentionRate || 50
    const { x, y } = getCoordinates(i, score)
    return `${x},${y}`
  }).join(" ")

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 rounded-xl border border-border/70 bg-card/50 backdrop-blur-xs relative overflow-hidden">
      <div className="w-full flex items-center justify-between border-b border-border/60 pb-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
            Ecosystem Footprint &middot; 6-Axis Grounding Radar
          </span>
        </div>
        <span className="text-[9px] font-mono text-muted-foreground">
          {brandName} Cross-Model Authority
        </span>
      </div>

      <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          <defs>
            <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
            </radialGradient>
            <linearGradient id="polygonStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="50%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Concentric Reference Rings */}
          {levels.map((lvl, idx) => (
            <circle
              key={idx}
              cx={center}
              cy={center}
              r={radius * lvl}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray={idx < 3 ? "3 3" : undefined}
              className="text-border/50"
            />
          ))}

          {/* Radial Spokes */}
          {engines.map((_, i) => {
            const { x, y } = getCoordinates(i, 100)
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="currentColor"
                strokeWidth="1"
                className="text-border/40"
              />
            )
          })}

          {/* Filled Data Polygon */}
          <polygon
            points={points}
            fill="url(#radarGlow)"
            stroke="url(#polygonStroke)"
            strokeWidth="2.5"
            className="transition-all duration-700 ease-out"
          />

          {/* Vertex Markers & Labels */}
          {engines.map((e, i) => {
            const score = e.rankPosition === 1 ? 98 : e.rankPosition === 2 ? 88 : e.rankPosition === 3 ? 76 : e.mentionRate || 50
            const { x, y } = getCoordinates(i, score)
            const labelCoord = getCoordinates(i, 122)
            const isHovered = hoveredEngine?.engine === e.engine

            return (
              <g
                key={e.engine}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredEngine(e)}
                onMouseLeave={() => setHoveredEngine(null)}
              >
                {/* Node Circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4}
                  fill={e.color || "hsl(var(--primary))"}
                  stroke="white"
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  className="transition-all duration-200 shadow-sm"
                />

                {/* Text Label */}
                <text
                  x={labelCoord.x}
                  y={labelCoord.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={`text-[9px] font-mono uppercase font-bold transition-all ${
                    isHovered
                      ? "fill-foreground font-black scale-110"
                      : "fill-muted-foreground group-hover:fill-foreground"
                  }`}
                >
                  {e.name.split(" ")[0]}
                </text>
              </g>
            )
          })}

          {/* Center Brand Monogram */}
          <circle cx={center} cy={center} r={14} className="fill-card stroke-border/80" strokeWidth="1" />
          <text
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-[10px] font-serif font-black fill-foreground"
          >
            {brandName.slice(0, 1)}
          </text>
        </svg>

        {/* Hover Floating Details Card */}
        {hoveredEngine && (
          <div className="absolute bottom-2 inset-x-4 p-2.5 rounded-lg bg-card/95 border border-border shadow-md backdrop-blur-md flex items-center justify-between text-xs animate-in fade-in duration-150 font-mono">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: hoveredEngine.color }}
              />
              <span className="font-bold text-foreground">{hoveredEngine.name}</span>
              <span className="text-[10px] text-muted-foreground">({hoveredEngine.model})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {hoveredEngine.rankLabel}
              </span>
              <span className="text-muted-foreground text-[10px]">
                {hoveredEngine.mentionRate}% SOV
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="w-full flex items-center justify-around pt-2 border-t border-border/50 text-[10px] font-mono text-muted-foreground">
        <span>Inner: 50% Coverage</span>
        <span>&middot;</span>
        <span>Mid: 75% Citation</span>
        <span>&middot;</span>
        <span>Outer: #1 Market Leader</span>
      </div>
    </div>
  )
}
