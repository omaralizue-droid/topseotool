import { Lightbulb, ArrowRight, CheckCircle2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"

interface RecItem {
  id: string
  type: string
  priority: string
  title: string
  description: string
  action?: string | null
  impact?: string | null
}

interface AIRecommendationsProps {
  recommendations?: RecItem[]
}

export function AIRecommendations({ recommendations = [] }: AIRecommendationsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          AI-Generated Action Plans (SEO & AEO)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <EmptyState
            icon={Lightbulb}
            title="No action recommendations yet"
            description="Run an audit or AI scan to generate prioritized optimization steps."
            action={{ label: "Run audit", href: "/dashboard/audit" }}
            className="p-6"
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-3.5 rounded-lg border border-border bg-card/60 space-y-2 hover:border-brand/30 transition-colors flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Badge variant={rec.priority === "HIGH" ? "brand" : "secondary"} className="text-[10px]">
                      {rec.priority} Priority
                    </Badge>
                    {rec.impact && <span className="text-[11px] font-medium text-muted-foreground">Impact: {rec.impact}</span>}
                  </div>
                  <p className="text-xs font-semibold text-foreground">{rec.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{rec.description}</p>
                </div>
                {rec.action && (
                  <div className="pt-2 border-t border-border/50 text-[11px] text-brand font-medium">
                    → {rec.action}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}