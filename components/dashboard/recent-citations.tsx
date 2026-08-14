import { Link2, ExternalLink } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"

interface CitationItem {
  id: string
  sourceUrl: string
  sourceTitle: string
  citedInEngine: string
  citationStrength?: number | null
}

interface RecentCitationsProps {
  citations?: CitationItem[]
}

export function RecentCitations({ citations = [] }: RecentCitationsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Link2 className="h-4 w-4 text-brand" />
          Recent AI Citations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {citations.length === 0 ? (
          <EmptyState
            icon={Link2}
            title="No AI citations recorded"
            description="Discover which domain URLs are cited as authoritative sources by LLMs."
            action={{ label: "View Citations", href: "/dashboard/ai-visibility" }}
            className="p-6"
          />
        ) : (
          <div className="space-y-2.5">
            {citations.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/60 hover:border-brand/30 transition-colors">
                <div className="min-w-0 flex-1 pr-3">
                  <p className="text-xs font-semibold text-foreground truncate">{c.sourceTitle}</p>
                  <a
                    href={c.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-muted-foreground hover:text-brand transition-colors flex items-center gap-1 truncate mt-0.5"
                  >
                    <span className="truncate">{c.sourceUrl}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-[10px] uppercase font-mono">{c.citedInEngine}</Badge>
                  {c.citationStrength && (
                    <span className="text-xs font-bold text-brand font-mono-nums">{c.citationStrength}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}