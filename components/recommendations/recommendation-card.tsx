"use client"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Lightbulb, CheckCircle2, Clock, EyeOff, ExternalLink, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { SynthesizedRecommendation } from "@/lib/recommendations/recommendation-engine"

interface RecommendationCardProps {
  recommendation: SynthesizedRecommendation
  projectId: string
}

export function RecommendationCard({ recommendation, projectId }: RecommendationCardProps) {
  const [status, setStatus] = useState<"OPEN" | "IN_PROGRESS" | "COMPLETED" | "IGNORED">(recommendation.status)
  const [loading, setLoading] = useState(false)

  async function updateStatus(newStatus: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "IGNORED") {
    setStatus(newStatus)
    setLoading(true)
    try {
      await fetch(`/api/projects/${projectId}/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommendationId: recommendation.id, status: newStatus }),
      })
      toast.success(`Marked as ${newStatus.replace("_", " ")}`)
    } catch {
      toast.error("Failed to update status")
    } finally {
      setLoading(false)
    }
  }

  if (status === "IGNORED") {
    return (
      <div className="p-3 bg-muted/40 border border-border rounded-lg flex items-center justify-between text-xs text-muted-foreground">
        <span className="line-through">{recommendation.title}</span>
        <Button variant="ghost" size="sm" className="h-6 text-[11px]" onClick={() => updateStatus("OPEN")}>
          Undo Ignored
        </Button>
      </div>
    )
  }

  return (
    <Card className={`transition-all ${status === "COMPLETED" ? "opacity-75 bg-muted/20" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  recommendation.priority === "CRITICAL"
                    ? "error"
                    : recommendation.priority === "HIGH"
                    ? "brand"
                    : "secondary"
                }
                className="text-[10px]"
              >
                {recommendation.priority} Priority
              </Badge>
              <Badge variant="outline" className="text-[10px] uppercase font-mono">
                {recommendation.category}
              </Badge>
              <span className="text-[11px] text-muted-foreground font-mono">
                Source: {recommendation.sourceMetric}
              </span>
            </div>
            <CardTitle className="text-base font-bold pt-1">{recommendation.title}</CardTitle>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Badge
              variant={
                status === "COMPLETED"
                  ? "success"
                  : status === "IN_PROGRESS"
                  ? "brand"
                  : "outline"
              }
              className="text-xs"
            >
              {status.replace("_", " ")}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Problem */}
        <div className="text-xs space-y-1">
          <span className="font-semibold text-foreground">Problem:</span>
          <p className="text-muted-foreground leading-relaxed">{recommendation.problem}</p>
        </div>

        {/* Why it Matters */}
        <div className="text-xs space-y-1">
          <span className="font-semibold text-foreground">Why it matters:</span>
          <p className="text-muted-foreground leading-relaxed">{recommendation.whyItMatters}</p>
        </div>

        {/* Recommended Action */}
        <div className="p-3 rounded-lg bg-brand-muted/40 border border-brand/20 text-xs space-y-1">
          <span className="font-bold text-brand flex items-center gap-1">
            <ArrowRight className="h-3.5 w-3.5" /> Recommended Fix:
          </span>
          <p className="text-foreground font-medium leading-relaxed">{recommendation.recommendedAction}</p>
        </div>

        {/* Status Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>Impact: <strong className="text-foreground">{recommendation.expectedImpact}</strong></span>
            <span>Difficulty: <strong className="text-foreground">{recommendation.difficulty}</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            {status !== "IN_PROGRESS" && status !== "COMPLETED" && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[11px]"
                onClick={() => updateStatus("IN_PROGRESS")}
                disabled={loading}
              >
                <Clock className="h-3 w-3 mr-1 text-brand" /> In Progress
              </Button>
            )}

            {status !== "COMPLETED" && (
              <Button
                size="sm"
                variant="brand"
                className="h-7 text-[11px]"
                onClick={() => updateStatus("COMPLETED")}
                disabled={loading}
              >
                <CheckCircle2 className="h-3 w-3 mr-1" /> Complete
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-[11px] text-muted-foreground hover:text-destructive"
              onClick={() => updateStatus("IGNORED")}
              disabled={loading}
            >
              <EyeOff className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}