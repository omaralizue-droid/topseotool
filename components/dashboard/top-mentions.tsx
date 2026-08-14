import { MessageSquare, CheckCircle2, AlertCircle } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"

interface MentionItem {
  id: string
  source: string
  query: string
  mentionText: string
  sentiment: string
}

interface TopMentionsProps {
  mentions?: MentionItem[]
}

export function TopMentions({ mentions = [] }: TopMentionsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-brand" />
          Top AI Brand Mentions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mentions.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No AI brand mentions logged yet"
            description="Run AI visibility scans to capture brand mentions in ChatGPT, Gemini, and Perplexity."
            action={{ label: "Run AI Scan", href: "/dashboard/ai-visibility" }}
            className="p-6"
          />
        ) : (
          <div className="space-y-3">
            {mentions.map((m) => (
              <div key={m.id} className="p-3 rounded-lg border border-border bg-card/60 space-y-1.5 hover:border-brand/30 transition-colors">
                <div className="flex items-center justify-between text-xs">
                  <Badge variant="outline" className="text-[10px] uppercase font-mono">{m.source}</Badge>
                  <Badge variant={m.sentiment === "POSITIVE" ? "success" : "secondary"} className="text-[10px]">
                    {m.sentiment}
                  </Badge>
                </div>
                <p className="text-xs font-semibold text-foreground line-clamp-1">&ldquo;{m.query}&rdquo;</p>
                <p className="text-xs text-muted-foreground line-clamp-2 italic leading-relaxed">
                  {m.mentionText}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}