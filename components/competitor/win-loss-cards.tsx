import { Trophy, AlertCircle, Lightbulb } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface WinLossInsight {
  query: string
  winner: string
  userRank: number | null
  competitorRank: number | null
  opportunity: string
}

interface WinLossCardsProps {
  competitorWins: WinLossInsight[]
  userWins: WinLossInsight[]
  contentOpportunities: Array<{ topic: string; impact: string; difficulty: string; description: string }>
}

export function WinLossCards({ competitorWins, userWins, contentOpportunities }: WinLossCardsProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Competitors Winning */}
      <Card className="border-amber-200 dark:border-amber-900/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <AlertCircle className="h-4 w-4" />
            Where Competitors Are Winning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {competitorWins.map((item) => (
            <div key={item.query} className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 text-xs space-y-1">
              <p className="font-semibold text-foreground">&ldquo;{item.query}&rdquo;</p>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                <span>Winner: <strong className="text-foreground">{item.winner}</strong> (#1)</span>
                <span>Your Rank: #{item.userRank ?? "N/A"}</span>
              </div>
              <p className="text-[11px] text-brand font-medium pt-1">→ {item.opportunity}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Where You Are Winning */}
      <Card className="border-emerald-200 dark:border-emerald-900/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <Trophy className="h-4 w-4" />
            Where You Are Winning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {userWins.map((item) => (
            <div key={item.query} className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 text-xs space-y-1">
              <p className="font-semibold text-foreground">&ldquo;{item.query}&rdquo;</p>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">★ You Hold #1 Rank</span>
                <span>Comp Rank: #{item.competitorRank ?? "N/A"}</span>
              </div>
              <p className="text-[11px] text-muted-foreground pt-1">{item.opportunity}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Content Opportunities */}
      <Card className="border-brand/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-brand">
            <Lightbulb className="h-4 w-4" />
            Content Gap Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {contentOpportunities.map((opp) => (
            <div key={opp.topic} className="p-3 rounded-lg border border-border bg-card text-xs space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground truncate">{opp.topic}</p>
                <Badge variant="brand" className="text-[9px] px-1 py-0">{opp.impact} Impact</Badge>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">{opp.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}