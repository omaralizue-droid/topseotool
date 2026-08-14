import * as React from "react"
import { ArrowUpRight, ArrowDownRight, Minus, LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  score: number | string
  unit?: string
  previousScore?: number
  changePercent?: number
  icon: LucideIcon
  description?: string
  color?: string
}

export function MetricCard({
  title,
  score,
  unit = "%",
  previousScore,
  changePercent,
  icon: Icon,
  description,
  color = "text-brand",
}: MetricCardProps) {
  const isPositive = (changePercent ?? 0) > 0
  const isNegative = (changePercent ?? 0) < 0
  const isNeutral = changePercent === 0 || changePercent === undefined

  return (
    <Card className="relative overflow-hidden hover:border-brand/40 transition-all duration-200">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
          <div className={cn("p-2 rounded-lg bg-muted/60", color)}>
            <Icon className="h-4 w-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-extrabold tracking-tight font-mono-nums">{score}</span>
          {typeof score === "number" && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
        </div>

        <div className="flex items-center justify-between text-xs">
          {changePercent !== undefined ? (
            <Badge
              variant={isPositive ? "success" : isNegative ? "error" : "secondary"}
              className="flex items-center gap-0.5 px-1.5 py-0 text-[11px] font-mono-nums"
            >
              {isPositive && <ArrowUpRight className="h-3 w-3" />}
              {isNegative && <ArrowDownRight className="h-3 w-3" />}
              {isNeutral && <Minus className="h-3 w-3" />}
              {isPositive ? `+${changePercent}%` : `${changePercent}%`}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-[11px] font-medium">Real-time</span>
          )}

          {previousScore !== undefined && (
            <span className="text-muted-foreground text-[11px] font-mono-nums">
              vs prev: {previousScore}{unit}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}