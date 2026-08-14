import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertTriangle, Info } from "lucide-react"

interface AttributesGridProps {
  positive: string[]
  negative: string[]
  neutral: string[]
}

export function AttributesGrid({ positive, negative, neutral }: AttributesGridProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Positive Attributes */}
      <Card className="border-emerald-200 dark:border-emerald-900/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            Positive Brand Attributes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {positive.map((attr) => (
            <div key={attr} className="p-2.5 rounded bg-emerald-50/60 dark:bg-emerald-950/20 text-xs text-foreground font-medium flex items-center gap-2">
              <span className="text-emerald-600 dark:text-emerald-400">✓</span>
              <span>{attr}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Neutral Attributes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
            <Info className="h-4 w-4" />
            Factual / Neutral Descriptors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {neutral.map((attr) => (
            <div key={attr} className="p-2.5 rounded bg-muted/60 text-xs text-foreground font-medium flex items-center gap-2">
              <span className="text-muted-foreground">•</span>
              <span>{attr}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Negative / Critical Attributes */}
      <Card className="border-red-200 dark:border-red-900/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertTriangle className="h-4 w-4" />
            Reputation Concerns & Limits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {negative.map((attr) => (
            <div key={attr} className="p-2.5 rounded bg-red-50/60 dark:bg-red-950/20 text-xs text-foreground font-medium flex items-center gap-2">
              <span className="text-red-600 dark:text-red-400">⚠</span>
              <span>{attr}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}