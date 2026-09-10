"use client"

import { useState, useEffect } from "react"
import {
  Bell, AlertTriangle, CheckCircle2, ShieldAlert, Plus,
  Mail, Play, RefreshCw, Clock, ArrowUpRight, ArrowDownRight,
  Globe, ExternalLink, Zap, Check, Eye, Trash2, Sliders,
  Layers, Radio, AlertOctagon, CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { AlertRule, TriggeredAlert, AlertStatus, AlertSeverity } from "@/lib/alerts/alert-store"
import { ScheduledTaskDefinition, ScheduledTaskType } from "@/lib/scheduler/cron-engine"

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState<"inbox" | "schedules" | "rules" | "simulate">("inbox")
  const [alerts, setAlerts] = useState<TriggeredAlert[]>([])
  const [rules, setRules] = useState<AlertRule[]>([])
  const [schedules, setSchedules] = useState<ScheduledTaskDefinition[]>([])
  const [stats, setStats] = useState({ total: 0, unresolved: 0, critical: 0, warning: 0, resolved: 0 })
  const [loading, setLoading] = useState(true)
  const [executingTask, setExecutingTask] = useState<string | null>(null)
  const [simulatingType, setSimulatingType] = useState<string | null>(null)

  // Create rule state
  const [createOpen, setCreateOpen] = useState(false)
  const [newRuleName, setNewRuleName] = useState("")
  const [newRuleTrigger, setNewRuleTrigger] = useState<any>("RANKING_DROP")
  const [newRuleThreshold, setNewRuleThreshold] = useState("Keyword falls by >= 3 positions")
  const [newRuleChannel, setNewRuleChannel] = useState<"Email" | "In-App" | "Slack" | "Webhook">("Email")
  const [newRuleSeverity, setNewRuleSeverity] = useState<AlertSeverity>("CRITICAL")

  const fetchAlertsData = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/alerts")
      const data = await res.json()
      if (data.success) {
        setAlerts(data.alerts || [])
        setRules(data.rules || [])
        setSchedules(data.schedules || [])
        setStats(data.stats || { total: 0, unresolved: 0, critical: 0, warning: 0, resolved: 0 })
      }
    } catch (err) {
      console.error("Failed to load alerts data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlertsData()
  }, [])

  const handleUpdateStatus = async (id: string, newStatus: AlertStatus) => {
    try {
      const res = await fetch(`/api/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setAlerts((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
        )
        // Refresh stats
        fetchAlertsData()
      }
    } catch (err) {
      console.error("Failed to update alert status:", err)
    }
  }

  const handleToggleRule = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      })
      if (res.ok) {
        setRules((prev) =>
          prev.map((r) => (r.id === id ? { ...r, active: !currentActive } : r))
        )
      }
    } catch (err) {
      console.error("Failed to toggle rule:", err)
    }
  }

  const handleExecuteSchedule = async (type: ScheduledTaskType) => {
    try {
      setExecutingTask(type)
      const res = await fetch("/api/cron", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskType: type }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchAlertsData()
      }
    } catch (err) {
      console.error("Failed to run scheduled job:", err)
    } finally {
      setExecutingTask(null)
    }
  }

  const handleSimulateAlert = async (type: string) => {
    try {
      setSimulatingType(type)
      const res = await fetch("/api/alerts/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchAlertsData()
        setActiveTab("inbox")
      }
    } catch (err) {
      console.error("Failed to simulate alert:", err)
    } finally {
      setSimulatingType(null)
    }
  }

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRuleName.trim()) return

    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRuleName.trim(),
          triggerType: newRuleTrigger,
          thresholdText: newRuleThreshold,
          channel: newRuleChannel,
          severity: newRuleSeverity,
        }),
      })
      const data = await res.json()
      if (data.success && data.rule) {
        setRules((prev) => [data.rule, ...prev])
        setNewRuleName("")
        setCreateOpen(false)
      }
    } catch (err) {
      console.error("Failed to create rule:", err)
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Bell className="h-6 w-6 text-brand" /> SEO Alerts &amp; Surveillance
            </h1>
            <Badge variant="brand" className="text-[10px] font-bold py-0.5">
              Automated 24/7
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Automated notifications for ranking drops, health score decreases, lost backlinks, page outages, and keyword surges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAlertsData}
            className="text-xs gap-1.5 h-8 border-border/60"
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 text-xs bg-brand hover:bg-brand/90 text-brand-foreground shadow-sm h-8">
                <Plus className="h-3.5 w-3.5" /> Create Alert Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md border-border bg-card">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">New SEO Alert Rule</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleCreateRule} className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Rule Name</label>
                  <Input
                    value={newRuleName}
                    onChange={(e) => setNewRuleName(e.target.value)}
                    placeholder="e.g. Core Keyword Ranking Drop Alert"
                    className="h-9 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Trigger Condition</label>
                  <select
                    value={newRuleTrigger}
                    onChange={(e) => {
                      const val = e.target.value as any
                      setNewRuleTrigger(val)
                      if (val === "RANKING_DROP") setNewRuleThreshold("Keyword falls by >= 3 positions or exits Top 10")
                      else if (val === "HEALTH_DECREASE") setNewRuleThreshold("Technical health score drops by >= 5 points")
                      else if (val === "PAGE_UNAVAILABLE") setNewRuleThreshold("Monitored URL returns HTTP 4xx, 5xx, or timeout")
                      else if (val === "BACKLINK_LOST") setNewRuleThreshold("High-impact referring domain or dofollow backlink lost")
                      else if (val === "KEYWORD_IMPROVED") setNewRuleThreshold("Keyword moves up by >= 5 spots or enters Top 3")
                    }}
                    className="w-full h-9 px-3 rounded-md bg-muted/30 border border-border/60 text-xs font-medium text-foreground focus:outline-none"
                  >
                    <option value="RANKING_DROP">Ranking drops (>= 3 spots / drops off page 1)</option>
                    <option value="HEALTH_DECREASE">Website health decreases (>= 5 pts)</option>
                    <option value="PAGE_UNAVAILABLE">Important page becomes unavailable (4xx/5xx/timeout)</option>
                    <option value="BACKLINK_LOST">Backlinks are lost (referring domain / dofollow)</option>
                    <option value="KEYWORD_IMPROVED">Keywords improve significantly (+5 spots / Top 3)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Condition Description</label>
                  <Input
                    value={newRuleThreshold}
                    onChange={(e) => setNewRuleThreshold(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Severity</label>
                    <select
                      value={newRuleSeverity}
                      onChange={(e) => setNewRuleSeverity(e.target.value as AlertSeverity)}
                      className="w-full h-9 px-3 rounded-md bg-muted/30 border border-border/60 text-xs font-medium text-foreground focus:outline-none"
                    >
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="WARNING">WARNING</option>
                      <option value="INFO">INFO</option>
                      <option value="SUCCESS">SUCCESS</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Channel</label>
                    <select
                      value={newRuleChannel}
                      onChange={(e) => setNewRuleChannel(e.target.value as any)}
                      className="w-full h-9 px-3 rounded-md bg-muted/30 border border-border/60 text-xs font-medium text-foreground focus:outline-none"
                    >
                      <option value="Email">Email</option>
                      <option value="In-App">In-App</option>
                      <option value="Slack">Slack</option>
                      <option value="Webhook">Webhook</option>
                    </select>
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
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/60 bg-card/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Unresolved Alerts</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold mt-1 text-foreground">{stats.unresolved}</p>
          <span className="text-[10px] text-muted-foreground">Action required</span>
        </Card>

        <Card className="border-border/60 bg-card/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Critical Alerts</span>
            <AlertOctagon className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold mt-1 text-red-500">{stats.critical}</p>
          <span className="text-[10px] text-muted-foreground">High-priority outages &amp; drops</span>
        </Card>

        <Card className="border-border/60 bg-card/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Scheduled Crons</span>
            <Clock className="h-4 w-4 text-brand" />
          </div>
          <p className="text-2xl font-bold mt-1 text-foreground">{schedules.length}</p>
          <span className="text-[10px] text-muted-foreground">Weekly, Daily, Monthly tasks</span>
        </Card>

        <Card className="border-border/60 bg-card/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Resolved Alerts</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold mt-1 text-emerald-500">{stats.resolved}</p>
          <span className="text-[10px] text-muted-foreground">Closed historical incidents</span>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-2">
        <button
          onClick={() => setActiveTab("inbox")}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === "inbox"
              ? "bg-brand/15 text-brand"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Bell className="h-3.5 w-3.5" />
          Alert Inbox ({alerts.filter((a) => a.status !== "RESOLVED").length})
        </button>

        <button
          onClick={() => setActiveTab("schedules")}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === "schedules"
              ? "bg-brand/15 text-brand"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          Scheduled Crons ({schedules.length})
        </button>

        <button
          onClick={() => setActiveTab("rules")}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === "rules"
              ? "bg-brand/15 text-brand"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          Surveillance Rules ({rules.length})
        </button>

        <button
          onClick={() => setActiveTab("simulate")}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === "simulate"
              ? "bg-brand/15 text-brand"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          Test Simulator
        </button>
      </div>

      {/* TAB 1: ALERT INBOX */}
      {activeTab === "inbox" && (
        <Card className="border-border/60 shadow-xs overflow-hidden">
          <CardHeader className="py-3 px-5 border-b border-border/40 bg-muted/10">
            <CardTitle className="text-sm font-semibold">Live Alert Feed</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Real-time alerts triggered by background crawlers, rank tracker syncs, and uptime monitors.
            </CardDescription>
          </CardHeader>

          <div className="divide-y divide-border/40">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs">
                No alerts recorded yet. Click "Test Simulator" to fire sample alerts.
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                    alert.status === "RESOLVED"
                      ? "opacity-60 bg-muted/10"
                      : alert.status === "TRIGGERED"
                      ? "bg-red-500/[0.02]"
                      : "bg-background"
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-foreground">{alert.title}</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold py-0 ${
                          alert.severity === "CRITICAL"
                            ? "border-red-500/40 text-red-500 bg-red-500/10"
                            : alert.severity === "WARNING"
                            ? "border-amber-500/40 text-amber-500 bg-amber-500/10"
                            : alert.severity === "SUCCESS"
                            ? "border-emerald-500/40 text-emerald-500 bg-emerald-500/10"
                            : "border-brand/40 text-brand bg-brand/10"
                        }`}
                      >
                        {alert.severity}
                      </Badge>

                      <Badge
                        variant="secondary"
                        className={`text-[10px] py-0 ${
                          alert.status === "TRIGGERED"
                            ? "bg-red-500/20 text-red-400"
                            : alert.status === "ACKNOWLEDGED"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        {alert.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground">{alert.message}</p>

                    {/* Metadata indicators */}
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap pt-0.5">
                      <span className="flex items-center gap-1 font-mono text-[10px] bg-muted/40 px-1.5 py-0.5 rounded">
                        <Globe className="h-3 w-3" /> {alert.projectName || "topseotool.net"}
                      </span>

                      {alert.metadata?.delta && (
                        <span className={`font-semibold ${alert.metadata.delta < 0 ? "text-red-400" : "text-emerald-400"}`}>
                          Delta: {alert.metadata.delta > 0 ? `+${alert.metadata.delta}` : alert.metadata.delta}
                        </span>
                      )}

                      {alert.metadata?.statusCode && (
                        <span className="font-mono text-red-400 font-semibold">
                          HTTP {alert.metadata.statusCode}
                        </span>
                      )}

                      <span>Triggered {new Date(alert.triggeredAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {alert.status === "TRIGGERED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(alert.id, "ACKNOWLEDGED")}
                        className="text-xs h-7 gap-1 border-border/60"
                      >
                        <Eye className="h-3 w-3" /> Acknowledge
                      </Button>
                    )}

                    {alert.status !== "RESOLVED" && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleUpdateStatus(alert.id, "RESOLVED")}
                        className="text-xs h-7 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Check className="h-3 w-3" /> Resolve
                      </Button>
                    )}

                    {alert.status === "RESOLVED" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleUpdateStatus(alert.id, "TRIGGERED")}
                        className="text-xs h-7 text-muted-foreground hover:text-foreground"
                      >
                        Re-open
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* TAB 2: SCHEDULED CRONS */}
      {activeTab === "schedules" && (
        <Card className="border-border/60 shadow-xs overflow-hidden">
          <CardHeader className="py-3 px-5 border-b border-border/40 bg-muted/10">
            <CardTitle className="text-sm font-semibold">Scheduled Recurring SEO Tasks</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Automated background execution routines for audits, rank checks, reports, and link monitoring.
            </CardDescription>
          </CardHeader>

          <div className="divide-y divide-border/40">
            {schedules.map((task) => (
              <div key={task.type} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/20 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{task.title}</span>
                    <Badge variant="secondary" className="text-[10px] font-semibold py-0">
                      {task.frequency}
                    </Badge>
                    <code className="text-[10px] bg-muted/50 px-1.5 py-0.5 rounded font-mono text-muted-foreground">
                      {task.cronExpression}
                    </code>
                  </div>
                  <p className="text-xs text-muted-foreground">{task.description}</p>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Next run: {new Date(task.nextRunAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                    </span>
                    {task.lastRunAt && (
                      <span>• Last ran: {new Date(task.lastRunAt).toLocaleTimeString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExecuteSchedule(task.type)}
                    disabled={executingTask === task.type}
                    className="text-xs h-8 gap-1.5 border-border/60 font-semibold"
                  >
                    {executingTask === task.type ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-brand" />
                    ) : (
                      <Play className="h-3.5 w-3.5 text-brand" />
                    )}
                    Run Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 3: SURVEILLANCE RULES */}
      {activeTab === "rules" && (
        <Card className="border-border/60 shadow-xs overflow-hidden">
          <CardHeader className="py-3 px-5 border-b border-border/40 bg-muted/10">
            <CardTitle className="text-sm font-semibold">Active Monitoring Rules ({rules.length})</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Automated triggers continuously evaluating crawl outputs, SERP snapshots, and page availability.
            </CardDescription>
          </CardHeader>

          <div className="divide-y divide-border/40">
            {rules.map((rule) => (
              <div key={rule.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{rule.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold py-0 ${
                        rule.severity === "CRITICAL"
                          ? "border-red-500/40 text-red-500 bg-red-500/10"
                          : rule.severity === "WARNING"
                          ? "border-amber-500/40 text-amber-500 bg-amber-500/10"
                          : "border-emerald-500/40 text-emerald-500 bg-emerald-500/10"
                      }`}
                    >
                      {rule.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{rule.thresholdText}</p>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                    <span className="flex items-center gap-1 font-medium">
                      <Mail className="h-3 w-3" /> {rule.channel}
                    </span>
                    {rule.lastTriggeredAt && (
                      <span>• Last triggered: {new Date(rule.lastTriggeredAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-muted-foreground">{rule.active ? "Enabled" : "Disabled"}</span>
                  <Switch
                    checked={rule.active}
                    onCheckedChange={() => handleToggleRule(rule.id, rule.active)}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 4: TEST SIMULATOR */}
      {activeTab === "simulate" && (
        <Card className="border-border/60 shadow-xs overflow-hidden">
          <CardHeader className="py-3 px-5 border-b border-border/40 bg-muted/10">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" /> One-Click Alert Notification Simulator
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Trigger simulated real-world conditions on demand to verify instant alert dispatch, email queueing, and notification cards.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 1. Ranking Drops */}
              <div className="p-4 rounded-lg border border-border/60 bg-muted/10 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                    <span className="font-bold text-sm text-foreground">Ranking Drop</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Simulates target keyword dropping from #3 to #9 (-6 positions) below Top 5.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSimulateAlert("RANKING_DROP")}
                  disabled={simulatingType === "RANKING_DROP"}
                  className="w-full text-xs font-semibold gap-1.5 border-border/60"
                >
                  {simulatingType === "RANKING_DROP" ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                  )}
                  Simulate Drop Alert
                </Button>
              </div>

              {/* 2. Health Decreases */}
              <div className="p-4 rounded-lg border border-border/60 bg-muted/10 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="font-bold text-sm text-foreground">Health Decreases</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Simulates website health audit score falling from 94 to 85 (-9 pts) with 4 new critical issues.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSimulateAlert("HEALTH_DECREASE")}
                  disabled={simulatingType === "HEALTH_DECREASE"}
                  className="w-full text-xs font-semibold gap-1.5 border-border/60"
                >
                  {simulatingType === "HEALTH_DECREASE" ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                  )}
                  Simulate Health Drop
                </Button>
              </div>

              {/* 3. Page Unavailable */}
              <div className="p-4 rounded-lg border border-border/60 bg-muted/10 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldAlert className="h-4 w-4 text-red-500" />
                    <span className="font-bold text-sm text-foreground">Page Unavailable</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Simulates a key monitored URL (/pricing) throwing HTTP 500 Internal Server Error.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSimulateAlert("PAGE_UNAVAILABLE")}
                  disabled={simulatingType === "PAGE_UNAVAILABLE"}
                  className="w-full text-xs font-semibold gap-1.5 border-border/60"
                >
                  {simulatingType === "PAGE_UNAVAILABLE" ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                  )}
                  Simulate Page 500 Outage
                </Button>
              </div>

              {/* 4. Backlink Lost */}
              <div className="p-4 rounded-lg border border-border/60 bg-muted/10 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Trash2 className="h-4 w-4 text-amber-500" />
                    <span className="font-bold text-sm text-foreground">Backlinks Lost</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Simulates high-DA referring domain (searchengineland.com, DA 89) dropping target backlink.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSimulateAlert("BACKLINK_LOST")}
                  disabled={simulatingType === "BACKLINK_LOST"}
                  className="w-full text-xs font-semibold gap-1.5 border-border/60"
                >
                  {simulatingType === "BACKLINK_LOST" ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                  )}
                  Simulate Backlink Loss
                </Button>
              </div>

              {/* 5. Keyword Improves Significantly */}
              <div className="p-4 rounded-lg border border-border/60 bg-muted/10 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    <span className="font-bold text-sm text-foreground">Keyword Surge (Top 3)</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Simulates keyword jumping from #12 to #2 (+10 positions) directly into Top 3 SERP!
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSimulateAlert("KEYWORD_IMPROVED")}
                  disabled={simulatingType === "KEYWORD_IMPROVED"}
                  className="w-full text-xs font-semibold gap-1.5 border-border/60"
                >
                  {simulatingType === "KEYWORD_IMPROVED" ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                  )}
                  Simulate Keyword Surge
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
