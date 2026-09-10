"use client"

import { useState } from "react"
import {
  Bell, AlertTriangle, CheckCircle2, ShieldAlert, Plus,
  Mail, MessageSquare, Webhook, Trash2, SwitchCamera,
  ExternalLink, TrendingDown, Link2, Globe
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

interface AlertRule {
  id: string
  name: string
  trigger: string
  channel: "Email" | "Slack" | "Webhook"
  active: boolean
  lastTriggered: string
  severity: "critical" | "warning" | "info"
}

const INITIAL_RULES: AlertRule[] = [
  {
    id: "r1",
    name: "Rank Drop Warning",
    trigger: "Any top 10 keyword falls by >= 3 positions",
    channel: "Slack",
    active: true,
    lastTriggered: "Yesterday at 14:22",
    severity: "critical"
  },
  {
    id: "r2",
    name: "Toxic Backlink Spike",
    trigger: "New referring domain with toxic score > 70% detected",
    channel: "Email",
    active: true,
    lastTriggered: "3 days ago",
    severity: "warning"
  },
  {
    id: "r3",
    name: "Crawl Error Detected",
    trigger: "5xx server error or 404 broken internal link found",
    channel: "Email",
    active: true,
    lastTriggered: "1 week ago",
    severity: "critical"
  },
  {
    id: "r4",
    name: "AI Citation Notification",
    trigger: "New brand mention cited in ChatGPT or Perplexity search",
    channel: "Webhook",
    active: true,
    lastTriggered: "2 hours ago",
    severity: "info"
  }
]

export default function AlertsPage() {
  const [rules, setRules] = useState<AlertRule[]>(INITIAL_RULES)
  const [createOpen, setCreateOpen] = useState(false)
  const [newRuleName, setNewRuleName] = useState("")
  const [newRuleTrigger, setNewRuleTrigger] = useState("Rank falls by >= 3 positions")
  const [newRuleChannel, setNewRuleChannel] = useState<"Email" | "Slack" | "Webhook">("Email")

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r))
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRuleName.trim()) return

    const newRule: AlertRule = {
      id: `rule_${Date.now()}`,
      name: newRuleName.trim(),
      trigger: newRuleTrigger,
      channel: newRuleChannel,
      active: true,
      lastTriggered: "Never",
      severity: "warning"
    }

    setRules([newRule, ...rules])
    setNewRuleName("")
    setCreateOpen(false)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Bell className="h-6 w-6 text-brand" /> SEO Alerts &amp; Surveillance
            </h1>
            <Badge variant="brand" className="text-[10px] font-bold py-0.5">Automated</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time notifications for keyword shifts, toxic backlinks, crawl errors, and AI citation spikes
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 text-xs bg-brand hover:bg-brand/90 text-brand-foreground shadow-sm">
              <Plus className="h-4 w-4" /> Create Alert Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md border-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">New SEO Alert Rule</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Rule Name</label>
                <Input
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  placeholder="e.g. Core Keyword Drop Alert"
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Trigger Condition</label>
                <select
                  value={newRuleTrigger}
                  onChange={(e) => setNewRuleTrigger(e.target.value)}
                  aria-label="Alert trigger condition"
                  className="w-full h-9 px-3 rounded-md bg-muted/30 border border-border/60 text-xs font-medium text-foreground focus:outline-none"
                >
                  <option value="Rank falls by >= 3 positions">Rank falls by &gt;= 3 positions</option>
                  <option value="Crawl discovers broken 404 link">Crawl discovers broken 404 link</option>
                  <option value="Toxic backlink score > 70%">Toxic backlink score &gt; 70%</option>
                  <option value="AI search citation lost">AI search citation lost</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Dispatch Channel</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Email", "Slack", "Webhook"] as const).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setNewRuleChannel(ch)}
                      className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                        newRuleChannel === ch
                          ? "border-brand bg-brand/10 text-brand"
                          : "border-border/60 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setCreateOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" variant="brand" size="sm" className="text-xs font-semibold">
                  Save Rule
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alert Rules List */}
      <Card className="border-border/80 overflow-hidden shadow-xs">
        <CardHeader className="py-3 px-5 border-b border-border/60 bg-muted/20">
          <CardTitle className="text-sm font-semibold">Active Monitoring Rules ({rules.length})</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Triggers evaluate 24/7 during automated crawl runs and daily rank updates
          </CardDescription>
        </CardHeader>

        <div className="divide-y divide-border/40">
          {rules.map((rule) => (
            <div key={rule.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-foreground">{rule.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold ${
                      rule.severity === "critical"
                        ? "border-red-500/40 text-red-500 bg-red-500/10"
                        : rule.severity === "warning"
                        ? "border-amber-500/40 text-amber-500 bg-amber-500/10"
                        : "border-brand/40 text-brand bg-brand/10"
                    }`}
                  >
                    {rule.severity.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{rule.trigger}</p>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                  <span className="flex items-center gap-1">
                    {rule.channel === "Email" && <Mail className="h-3 w-3" />}
                    {rule.channel === "Slack" && <MessageSquare className="h-3 w-3" />}
                    {rule.channel === "Webhook" && <Webhook className="h-3 w-3" />}
                    {rule.channel}
                  </span>
                  <span>•</span>
                  <span>Last fired: {rule.lastTriggered}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{rule.active ? "Active" : "Paused"}</span>
                  <Switch
                    checked={rule.active}
                    onCheckedChange={() => toggleRule(rule.id)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
