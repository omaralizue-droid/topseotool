import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Sparkles, Lightbulb, Info } from "lucide-react"

interface PerceptionSummaryProps {
  brandName: string
  summaryText: string
  missingInfoOpportunities: Array<{ gap: string; recommendation: string }>
}

export function PerceptionSummary({ brandName, summaryText, missingInfoOpportunities }: PerceptionSummaryProps) {
  return (
    <div className="space-y-6">
      {/* LLM Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand" />
              LLM Brand Perception Summary
            </CardTitle>
            <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded font-mono">
              Sampled AI responses analysis
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-foreground leading-relaxed italic bg-muted/30 p-4 rounded-lg border border-border/50">
            &ldquo;{summaryText}&rdquo;
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
            <Info className="h-3.5 w-3.5 shrink-0" />
            <span>Note: This represents analysis of sampled AI-generated outputs and does not constitute universal public opinion.</span>
          </div>
        </CardContent>
      </Card>

      {/* Missing Information Opportunities */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Missing AI Information Opportunities ({missingInfoOpportunities.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {missingInfoOpportunities.map((opp) => (
            <div key={opp.gap} className="p-3.5 rounded-lg border border-border bg-card text-xs space-y-1.5">
              <p className="font-semibold text-foreground">Gap: {opp.gap}</p>
              <p className="text-brand font-medium">→ Recommendation: {opp.recommendation}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}