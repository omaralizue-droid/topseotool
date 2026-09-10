"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import {
  Bell, AlertTriangle, TrendingUp, ShieldAlert, CheckCircle2,
  Mail, MessageSquare, Plus, ExternalLink, RefreshCw, Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

interface ProjectAlertEvent {
  id: string
  title: string
  desc: string
  severity: "critical" | "warning" | "success"
  time: string
  channel: string
}

const PROJECT_ALERTS: ProjectAlertEvent[] = [
  {
    id: "a1",
    title: "Primary Keyword Moved to Top 2",
    desc: "'ai seo tools' improved from #5 to #2 on Google Desktop (United States).",
    severity: "success",
    time: "2 hours ago",
    channel: "Slack #seo-alerts"
  },
  {
    id: "a2",
    title: "New AI Search Citation Detected",
    desc: "Perplexity AI referenced /features in prompt 'Best enterprise AEO tools'.",
    severity: "success",
    time: "4 hours ago",
    channel: "Email"
  },
  {
    id: "a3",
    title: "High Toxic Backlink Anchor Flagged",
    desc: "Spam link with 78% toxicity score detected from free-seo-links-bot.ru.",
    severity: "warning",
    time: "Yesterday at 18:40",
    channel: "Email"
  },
  {
    id: "a4",
    title: "Crawl Broken Link (404) Identified",
    desc: "/blog/legacy-ranking-factors returned 404 on 3 internal links.",
    severity: "critical",
    time: "3 days ago",
    channel: "Slack #seo-alerts"
  }
]

export default function ProjectAlertsPage() {
  const params = useParams()
  const projectId = (params?.projectId as string) || "demo"

  const [alerts, setAlerts] = useState<ProjectAlertEvent[]>(PROJECT_ALERTS)
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [slackEnabled, setSlackEnabled] = useState(true)

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Bell className="h-6 w-6 text-brand" /> Project Surveillance &amp; Alerts
            </h1>
            <Badge variant="brand" className="text-[10px] font-bold py-0.5">24/7 Active</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time feed of keyword shifts, algorithm movements, crawl errors, and backlink changes for this domain
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5 text-brand" />
            <span>Email Alerts</span>
            <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5 text-brand" />
            <span>Slack Alerts</span>
            <Switch checked={slackEnabled} onCheckedChange={setSlackEnabled} />
          </div>
        </div>
      </div>

      {/* Alert Feed Table */}
      <Card className="border-border/80 overflow-hidden shadow-xs">
        <CardHeader className="py-3 px-5 border-b border-border/60 bg-muted/20">
          <CardTitle className="text-sm font-semibold">Recent Event Activity</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Automatic triggers based on your project's search engine preferences and rank radar
          </CardDescription>
        </CardHeader>

        <div className="divide-y divide-border/40">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {alert.severity === "success" && (
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  )}
                  {alert.severity === "warning" && (
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                  )}
                  {alert.severity === "critical" && (
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                      <ShieldAlert className="h-4 w-4" />
                    </div>
                  )}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{alert.title}</span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] font-semibold ${
                        alert.severity === "success"
                          ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5"
                          : alert.severity === "warning"
                          ? "border-amber-500/30 text-amber-500 bg-amber-500/5"
                          : "border-red-500/30 text-red-500 bg-red-500/5"
                      }`}
                    >
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.desc}</p>
                  <span className="text-[11px] text-muted-foreground font-mono block pt-0.5">
                    {alert.time} • Dispatched via {alert.channel}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Inspect
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
