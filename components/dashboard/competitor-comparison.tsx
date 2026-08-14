import { Users2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { EmptyState } from "@/components/ui/empty-state"

interface CompetitorItem {
  name: string
  domain: string
  seoScore: number
  aiVisibility: number
}

interface CompetitorComparisonProps {
  myBrandScore?: number
  myBrandVisibility?: number
  competitors?: CompetitorItem[]
}

export function CompetitorComparison({
  myBrandScore = 84,
  myBrandVisibility = 92,
  competitors = [],
}: CompetitorComparisonProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users2 className="h-4 w-4 text-brand" />
          Competitor Visibility Benchmark
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Your Brand */}
        <div className="p-3 rounded-lg border border-brand/30 bg-brand-muted/30">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-brand flex items-center gap-1 font-bold">★ Your Domain (TopSEOTool)</span>
            <span className="font-mono-nums text-foreground">AI Vis: {myBrandVisibility}% | SEO: {myBrandScore}</span>
          </div>
          <Progress value={myBrandVisibility} className="h-2 bg-brand/20" />
        </div>

        {/* Competitors List */}
        {competitors.length === 0 ? (
          <EmptyState
            icon={Users2}
            title="No competitors added"
            description="Add competitor domains to track side-by-side SEO and AI visibility scores."
            action={{ label: "Add competitor", href: "/dashboard/competitors" }}
            className="p-4"
          />
        ) : (
          competitors.map((comp) => (
            <div key={comp.domain} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{comp.name || comp.domain}</span>
                <span className="text-muted-foreground font-mono-nums">AI Vis: {comp.aiVisibility}% | SEO: {comp.seoScore}</span>
              </div>
              <Progress value={comp.aiVisibility} className="h-1.5" />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}