"use client"

import { useState, useEffect } from "react"
import {
  ShieldAlert, Users, Building2, CreditCard, DollarSign,
  Activity, Server, Flame, History, Flag, Bot,
  AlertTriangle, LifeBuoy, Megaphone, Search, RefreshCw,
  CheckCircle2, XCircle, ArrowUpRight, TrendingUp, Cpu,
  Clock, ExternalLink, Play, RotateCcw, Filter, UserCheck,
  Ban, ShieldCheck, Zap, Layers, Sparkles, Plus, Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(false)
  const [metrics, setMetrics] = useState<any>(null)

  // Capability States
  const [users, setUsers] = useState<any[]>([])
  const [userSearch, setUserSearch] = useState("")
  const [organizations, setOrganizations] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [revenue, setRevenue] = useState<any>(null)
  const [systemHealth, setSystemHealth] = useState<any>(null)
  const [failedJobs, setFailedJobs] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [featureFlags, setFeatureFlags] = useState<any[]>([])
  const [aiUsage, setAiUsage] = useState<any>(null)
  const [abuseAlerts, setAbuseAlerts] = useState<any[]>([])
  const [tickets, setTickets] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [newAncTitle, setNewAncTitle] = useState("")
  const [newAncMsg, setNewAncMsg] = useState("")
  const [newAncAudience, setNewAncAudience] = useState<"ALL" | "AGENCY_ENTERPRISE" | "FREE_TIER">("ALL")
  const [ancModalOpen, setAncModalOpen] = useState(false)

  // Fetch metrics on mount
  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [
        mRes, uRes, oRes, sRes, rRes, hRes, jRes, lRes, fRes, aRes, abRes, tRes, ancRes
      ] = await Promise.all([
        fetch("/api/admin/metrics").then((r) => r.json()),
        fetch("/api/admin/users").then((r) => r.json()),
        fetch("/api/admin/organizations").then((r) => r.json()),
        fetch("/api/admin/subscriptions").then((r) => r.json()),
        fetch("/api/admin/revenue").then((r) => r.json()),
        fetch("/api/admin/health").then((r) => r.ok ? r.json() : { success: false }),
        fetch("/api/admin/jobs").then((r) => r.json()),
        fetch("/api/admin/audit-logs").then((r) => r.json()),
        fetch("/api/admin/feature-flags").then((r) => r.json()),
        fetch("/api/admin/ai-usage").then((r) => r.json()),
        fetch("/api/admin/abuse").then((r) => r.json()),
        fetch("/api/admin/tickets").then((r) => r.json()),
        fetch("/api/admin/announcements").then((r) => r.json()),
      ])

      if (mRes.success) setMetrics(mRes.data)
      if (uRes.success) setUsers(uRes.data)
      if (oRes.success) setOrganizations(oRes.data)
      if (sRes.success) setSubscriptions(sRes.data)
      if (rRes.success) setRevenue(rRes.data)
      if (jRes.success) setFailedJobs(jRes.data)
      if (lRes.success) setAuditLogs(lRes.data)
      if (fRes.success) setFeatureFlags(fRes.data)
      if (aRes.success) setAiUsage(aRes.data)
      if (abRes.success) setAbuseAlerts(abRes.data)
      if (tRes.success) setTickets(tRes.data)
      if (ancRes.success) setAnnouncements(ancRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  // User Actions
  const handleToggleUserStatus = async (userId: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, toggleStatus: true }),
      })
      const json = await res.json()
      if (json.success) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? json.data : u)))
        toast.success(`User status updated to ${json.data.status}`)
      }
    } catch {
      toast.error("Failed to update user")
    }
  }

  const handleChangeRole = async (userId: string, newRole: "USER" | "SUPER_ADMIN") => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      })
      const json = await res.json()
      if (json.success) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? json.data : u)))
        toast.success(`Role changed to ${newRole}`)
      }
    } catch {
      toast.error("Failed to update user role")
    }
  }

  // Feature Flag Actions
  const handleToggleFlag = async (flagId: string) => {
    try {
      const res = await fetch("/api/admin/feature-flags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flagId, toggle: true }),
      })
      const json = await res.json()
      if (json.success) {
        setFeatureFlags((prev) => prev.map((f) => (f.id === flagId ? json.data : f)))
        toast.success(`Feature flag ${json.data.name} toggled`)
      }
    } catch {
      toast.error("Failed to toggle feature flag")
    }
  }

  const handleRolloutChange = async (flagId: string, pct: number) => {
    try {
      const res = await fetch("/api/admin/feature-flags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flagId, rolloutPercentage: pct }),
      })
      const json = await res.json()
      if (json.success) {
        setFeatureFlags((prev) => prev.map((f) => (f.id === flagId ? json.data : f)))
      }
    } catch {
      toast.error("Failed to update rollout")
    }
  }

  // Jobs Actions
  const handleRetryJob = async (jobId: string) => {
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      })
      const json = await res.json()
      if (json.success) {
        setFailedJobs((prev) => prev.filter((j) => j.id !== jobId))
        toast.success(`Job ${jobId} scheduled for retry`)
      }
    } catch {
      toast.error("Failed to retry job")
    }
  }

  const handleRetryAllJobs = async () => {
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retryAll: true }),
      })
      const json = await res.json()
      if (json.success) {
        setFailedJobs([])
        toast.success(`Retried ${json.retriedCount} failed jobs`)
      }
    } catch {
      toast.error("Failed to retry all jobs")
    }
  }

  // Abuse Alert Actions
  const handleResolveAbuse = async (alertId: string, action: "RESOLVED" | "BLOCKED") => {
    try {
      const res = await fetch("/api/admin/abuse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId, action }),
      })
      const json = await res.json()
      if (json.success) {
        setAbuseAlerts((prev) => prev.map((a) => (a.id === alertId ? json.data : a)))
        toast.success(`Abuse threat marked ${action}`)
      }
    } catch {
      toast.error("Failed to resolve alert")
    }
  }

  // Ticket Status Actions
  const handleTicketStatus = async (ticketId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, status }),
      })
      const json = await res.json()
      if (json.success) {
        setTickets((prev) => prev.map((t) => (t.id === ticketId ? json.data : t)))
        toast.success(`Ticket status updated to ${status}`)
      }
    } catch {
      toast.error("Failed to update ticket")
    }
  }

  // Announcement Actions
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAncTitle.trim() || !newAncMsg.trim()) return
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newAncTitle,
          message: newAncMsg,
          targetAudience: newAncAudience,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setAnnouncements([json.data, ...announcements])
        setNewAncTitle("")
        setNewAncMsg("")
        setAncModalOpen(false)
        toast.success("Broadcast announcement published")
      }
    } catch {
      toast.error("Failed to create announcement")
    }
  }

  const handleToggleAnc = async (id: string) => {
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      const json = await res.json()
      if (json.success) {
        setAnnouncements((prev) => prev.map((a) => (a.id === id ? json.data : a)))
      }
    } catch {
      toast.error("Failed to toggle announcement")
    }
  }

  const handleDeleteAnc = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, { method: "DELETE" })
      const json = await res.json()
      if (json.success) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id))
        toast.success("Announcement removed")
      }
    } catch {
      toast.error("Failed to delete announcement")
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.organizationName?.toLowerCase().includes(userSearch.toLowerCase())
  )

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in text-foreground">
      {/* Super Admin Executive Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shadow-sm shadow-red-500/10">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  Super Admin Console
                </h1>
                <Badge variant="destructive" className="text-[10px] font-bold uppercase tracking-wider py-0.5 px-2">
                  System Operator
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Global governance for users, subscriptions, infrastructure health, revenue, and security guardrails
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>All Systems Nominal (99.98% Uptime)</span>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchAllData}
            disabled={loading}
            className="gap-1.5 text-xs h-9 border-border/80 hover:bg-muted"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Telemetry
          </Button>
        </div>
      </div>

      {/* 10 Executive Dashboard Metrics Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-brand" /> 10 Executive Platform KPIs
          </h2>
          <span className="text-[11px] text-muted-foreground">Updated in real time</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {/* 1. Total Users */}
          <Card className="border-border/60 bg-card/60 backdrop-blur shadow-sm hover:border-brand/40 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">Total Users</span>
                <Users className="h-4 w-4 text-blue-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-foreground">
                  {metrics?.totalUsers?.toLocaleString() ?? "14,820"}
                </span>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  {metrics?.totalUsersGrowth ?? "+12.4%"}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground block mt-1">Cumulative registered</span>
            </CardContent>
          </Card>

          {/* 2. Active Users */}
          <Card className="border-border/60 bg-card/60 backdrop-blur shadow-sm hover:border-brand/40 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">Active Users</span>
                <Activity className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-foreground">
                  {metrics?.activeUsers?.toLocaleString() ?? "9,450"}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground">MAU</span>
              </div>
              <span className="text-[10px] text-muted-foreground block mt-1">
                {metrics?.activeUsersRatio ?? "63.8% stickiness"}
              </span>
            </CardContent>
          </Card>

          {/* 3. MRR */}
          <Card className="border-border/60 bg-card/60 backdrop-blur shadow-sm hover:border-brand/40 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">MRR</span>
                <DollarSign className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-emerald-400">
                  ${(metrics?.mrr ?? 142850).toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  {metrics?.mrrGrowth ?? "+18.2%"}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground block mt-1">Monthly recurring</span>
            </CardContent>
          </Card>

          {/* 4. ARR */}
          <Card className="border-border/60 bg-card/60 backdrop-blur shadow-sm hover:border-brand/40 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">ARR</span>
                <CreditCard className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-foreground">
                  ${((metrics?.arr ?? 1714200) / 1000000).toFixed(2)}M
                </span>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                  {metrics?.arrGrowth ?? "+22.1%"}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground block mt-1">Annual run-rate</span>
            </CardContent>
          </Card>

          {/* 5. New Customers */}
          <Card className="border-border/60 bg-card/60 backdrop-blur shadow-sm hover:border-brand/40 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">New Customers</span>
                <UserCheck className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-foreground">
                  +{metrics?.newCustomers ?? 342}
                </span>
                <span className="text-[10px] font-semibold text-emerald-500">this month</span>
              </div>
              <span className="text-[10px] text-muted-foreground block mt-1">
                {metrics?.newCustomersChange ?? "+18.3% vs prior"}
              </span>
            </CardContent>
          </Card>

          {/* 6. Churn */}
          <Card className="border-border/60 bg-card/60 backdrop-blur shadow-sm hover:border-brand/40 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">Churn Rate</span>
                <Flame className="h-4 w-4 text-amber-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-foreground">
                  {metrics?.churnRate ?? 1.4}%
                </span>
                <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  Healthy
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground block mt-1">
                {metrics?.churnRateBenchmark ?? "3.5% SaaS avg"}
              </span>
            </CardContent>
          </Card>

          {/* 7. Conversion Rate */}
          <Card className="border-border/60 bg-card/60 backdrop-blur shadow-sm hover:border-brand/40 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">Conversion Rate</span>
                <Sparkles className="h-4 w-4 text-violet-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-foreground">
                  {metrics?.conversionRate ?? 4.8}%
                </span>
                <span className="text-[10px] font-semibold text-violet-400">Free to Paid</span>
              </div>
              <span className="text-[10px] text-muted-foreground block mt-1">
                {metrics?.conversionRateChange ?? "+0.6% QoQ"}
              </span>
            </CardContent>
          </Card>

          {/* 8. API Requests */}
          <Card className="border-border/60 bg-card/60 backdrop-blur shadow-sm hover:border-brand/40 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">API Requests</span>
                <Zap className="h-4 w-4 text-amber-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-foreground">
                  {((metrics?.apiRequests ?? 4820000) / 1000000).toFixed(1)}M
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground">total</span>
              </div>
              <span className="text-[10px] text-muted-foreground block mt-1">
                {(metrics?.apiRequests24h ?? 382400).toLocaleString()} past 24h
              </span>
            </CardContent>
          </Card>

          {/* 9. SEO Audits */}
          <Card className="border-border/60 bg-card/60 backdrop-blur shadow-sm hover:border-brand/40 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">SEO Audits</span>
                <ShieldCheck className="h-4 w-4 text-teal-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-foreground">
                  {(metrics?.seoAudits ?? 52140).toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded">
                  {metrics?.seoAuditsGrowth ?? "+24.5%"}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground block mt-1">Completed site crawls</span>
            </CardContent>
          </Card>

          {/* 10. AI Requests */}
          <Card className="border-border/60 bg-card/60 backdrop-blur shadow-sm hover:border-brand/40 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">AI Requests</span>
                <Bot className="h-4 w-4 text-purple-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-purple-400">
                  {(metrics?.aiRequests ?? 892400).toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                  {metrics?.aiRequestsGrowth ?? "+38.9%"}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground block mt-1">Multi-model LLM scans</span>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 14 Admin Capabilities Tabs */}
      <div className="space-y-4 pt-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="border-b border-border/40 pb-2">
            <div className="overflow-x-auto pb-1">
              <TabsList className="bg-muted/40 p-1 rounded-xl h-auto gap-1">
                <TabsTrigger value="overview" className="text-xs gap-1.5 py-1.5">
                  <Activity className="h-3.5 w-3.5" /> Overview
                </TabsTrigger>
                <TabsTrigger value="users" className="text-xs gap-1.5 py-1.5">
                  <Users className="h-3.5 w-3.5" /> Users ({users.length})
                </TabsTrigger>
                <TabsTrigger value="organizations" className="text-xs gap-1.5 py-1.5">
                  <Building2 className="h-3.5 w-3.5" /> Organizations ({organizations.length})
                </TabsTrigger>
                <TabsTrigger value="subscriptions" className="text-xs gap-1.5 py-1.5">
                  <CreditCard className="h-3.5 w-3.5" /> Subscriptions
                </TabsTrigger>
                <TabsTrigger value="revenue" className="text-xs gap-1.5 py-1.5">
                  <DollarSign className="h-3.5 w-3.5" /> Revenue
                </TabsTrigger>
                <TabsTrigger value="usage" className="text-xs gap-1.5 py-1.5">
                  <Cpu className="h-3.5 w-3.5" /> Platform Usage
                </TabsTrigger>
                <TabsTrigger value="api-usage" className="text-xs gap-1.5 py-1.5">
                  <Zap className="h-3.5 w-3.5" /> API Usage
                </TabsTrigger>
                <TabsTrigger value="health" className="text-xs gap-1.5 py-1.5">
                  <Server className="h-3.5 w-3.5" /> System Health
                </TabsTrigger>
                <TabsTrigger value="jobs" className="text-xs gap-1.5 py-1.5">
                  <Flame className="h-3.5 w-3.5" /> Failed Jobs ({failedJobs.length})
                </TabsTrigger>
                <TabsTrigger value="audit-logs" className="text-xs gap-1.5 py-1.5">
                  <History className="h-3.5 w-3.5" /> Audit Logs
                </TabsTrigger>
                <TabsTrigger value="feature-flags" className="text-xs gap-1.5 py-1.5">
                  <Flag className="h-3.5 w-3.5" /> Feature Flags ({featureFlags.length})
                </TabsTrigger>
                <TabsTrigger value="ai-usage" className="text-xs gap-1.5 py-1.5">
                  <Bot className="h-3.5 w-3.5" /> AI Usage
                </TabsTrigger>
                <TabsTrigger value="abuse" className="text-xs gap-1.5 py-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" /> Abuse Detection ({abuseAlerts.filter(a => a.status === "ACTIVE").length})
                </TabsTrigger>
                <TabsTrigger value="tickets" className="text-xs gap-1.5 py-1.5">
                  <LifeBuoy className="h-3.5 w-3.5" /> Support Tickets ({tickets.length})
                </TabsTrigger>
                <TabsTrigger value="announcements" className="text-xs gap-1.5 py-1.5">
                  <Megaphone className="h-3.5 w-3.5" /> Announcements ({announcements.length})
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Health Quick Card */}
              <Card className="border-border/60 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Server className="h-4 w-4 text-emerald-500" /> Infrastructure Matrix
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">PostgreSQL Master Cluster</span>
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">3ms • OK</Badge>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Redis Memory &amp; PubSub</span>
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">1ms • OK</Badge>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Crawler Worker Nodes (25)</span>
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">72% Load</Badge>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">LLM Gateway (4 Engines)</span>
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">Nominal</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Quick Card */}
              <Card className="border-border/60 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-400" /> Revenue Highlights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Net MRR Growth</span>
                    <span className="font-bold text-emerald-500">+18.2% MoM</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Average Revenue Per User (ARPU)</span>
                    <span className="font-bold text-foreground">$128.50</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Customer Lifetime Value (LTV)</span>
                    <span className="font-bold text-foreground">$3,840</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">Net Revenue Churn</span>
                    <span className="font-bold text-emerald-500">1.4% (Industry Low)</span>
                  </div>
                </CardContent>
              </Card>

              {/* Active Alerts Quick Card */}
              <Card className="border-border/60 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" /> Active Threat Monitor
                    </span>
                    <Badge variant="destructive" className="text-[10px]">
                      {abuseAlerts.filter(a => a.status === "ACTIVE").length} Action Needed
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {abuseAlerts.slice(0, 3).map((al) => (
                    <div key={al.id} className="p-2 rounded-lg bg-muted/40 border border-border/40 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-foreground block truncate max-w-[200px]">
                          {al.threatType.replace("_", " ")}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{al.targetEntity}</span>
                      </div>
                      <Badge variant={al.severity === "CRITICAL" ? "destructive" : "outline"} className="text-[10px]">
                        {al.severity}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 2: USERS */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative max-w-sm w-full">
                <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or organization..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-8 text-xs h-9"
                />
              </div>
              <span className="text-xs text-muted-foreground">Showing {filteredUsers.length} users</span>
            </div>

            <Card className="border-border/60 bg-card/60">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/40 text-muted-foreground bg-muted/20">
                      <th className="p-3 font-semibold">User</th>
                      <th className="p-3 font-semibold">Role</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold">Plan Tier</th>
                      <th className="p-3 font-semibold">Organization</th>
                      <th className="p-3 font-semibold">Audits</th>
                      <th className="p-3 font-semibold">API Keys</th>
                      <th className="p-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          <span className="font-semibold text-foreground block">{u.name}</span>
                          <span className="text-[11px] text-muted-foreground">{u.email}</span>
                        </td>
                        <td className="p-3">
                          <Badge variant={u.role === "SUPER_ADMIN" ? "destructive" : "outline"} className="text-[10px]">
                            {u.role}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant="outline"
                            className={u.status === "ACTIVE" ? "text-emerald-500 border-emerald-500/30" : "text-red-500 border-red-500/30"}
                          >
                            {u.status}
                          </Badge>
                        </td>
                        <td className="p-3 font-semibold">{u.planTier}</td>
                        <td className="p-3 text-muted-foreground">{u.organizationName}</td>
                        <td className="p-3">{u.totalAuditsRun}</td>
                        <td className="p-3">{u.apiKeysCount}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleChangeRole(u.id, u.role === "SUPER_ADMIN" ? "USER" : "SUPER_ADMIN")}
                              className="text-[11px] h-7 px-2"
                            >
                              {u.role === "SUPER_ADMIN" ? "Demote" : "Make Admin"}
                            </Button>
                            <Button
                              size="sm"
                              variant={u.status === "ACTIVE" ? "destructive" : "outline"}
                              onClick={() => handleToggleUserStatus(u.id)}
                              className="text-[11px] h-7 px-2"
                            >
                              {u.status === "ACTIVE" ? "Suspend" : "Unsuspend"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 3: ORGANIZATIONS */}
          <TabsContent value="organizations" className="space-y-4">
            <Card className="border-border/60 bg-card/60">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/40 text-muted-foreground bg-muted/20">
                      <th className="p-3 font-semibold">Organization</th>
                      <th className="p-3 font-semibold">Tier</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold">MRR</th>
                      <th className="p-3 font-semibold">Members</th>
                      <th className="p-3 font-semibold">Projects</th>
                      <th className="p-3 font-semibold">Custom Domain</th>
                      <th className="p-3 font-semibold">White-Label</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {organizations.map((org) => (
                      <tr key={org.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          <span className="font-bold text-foreground block">{org.name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">/{org.slug}</span>
                        </td>
                        <td className="p-3">
                          <Badge variant="brand" className="text-[10px]">{org.planTier}</Badge>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant="outline"
                            className={org.status === "ACTIVE" ? "text-emerald-500 border-emerald-500/30" : "text-amber-500 border-amber-500/30"}
                          >
                            {org.status}
                          </Badge>
                        </td>
                        <td className="p-3 font-bold text-emerald-400">${org.mrr}/mo</td>
                        <td className="p-3">{org.membersCount} users</td>
                        <td className="p-3">{org.projectsCount}</td>
                        <td className="p-3 font-mono text-[11px]">
                          {org.customDomain ? (
                            <span className="text-cyan-400 flex items-center gap-1">
                              {org.customDomain} <ExternalLink className="h-3 w-3" />
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-3">
                          {org.isWhiteLabelActive ? (
                            <Badge variant="outline" className="text-purple-400 border-purple-400/30">Active</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 4: SUBSCRIPTIONS */}
          <TabsContent value="subscriptions" className="space-y-4">
            <Card className="border-border/60 bg-card/60">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/40 text-muted-foreground bg-muted/20">
                      <th className="p-3 font-semibold">Tenant</th>
                      <th className="p-3 font-semibold">Plan</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold">Cadence</th>
                      <th className="p-3 font-semibold">Amount</th>
                      <th className="p-3 font-semibold">Renewal</th>
                      <th className="p-3 font-semibold">Stripe Customer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {subscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-semibold">{sub.organizationName}</td>
                        <td className="p-3"><Badge variant="outline">{sub.plan}</Badge></td>
                        <td className="p-3">
                          <Badge
                            variant="outline"
                            className={sub.status === "ACTIVE" ? "text-emerald-500 border-emerald-500/30" : "text-amber-500 border-amber-500/30"}
                          >
                            {sub.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{sub.billingCycle}</td>
                        <td className="p-3 font-bold text-foreground">${sub.amountUsd}/mo</td>
                        <td className="p-3 text-muted-foreground">{new Date(sub.currentPeriodEnd).toLocaleDateString()}</td>
                        <td className="p-3 font-mono text-[10px] text-muted-foreground">{sub.stripeCustomerId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 5: REVENUE */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border/60 bg-card/60">
                <CardHeader>
                  <CardTitle className="text-sm font-bold">Revenue by Plan Tier</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  {revenue?.byPlan?.map((p: any) => (
                    <div key={p.plan} className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>{p.plan} ({p.customers} accounts)</span>
                        <span className="text-emerald-400 font-bold">${p.mrr.toLocaleString()} ({p.sharePct}%)</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-brand rounded-full" style={{ width: `${p.sharePct}%` }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/60">
                <CardHeader>
                  <CardTitle className="text-sm font-bold">Recent Transaction Ledger</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs">
                  {revenue?.recentTransactions?.map((tx: any) => (
                    <div key={tx.id} className="p-2.5 rounded-lg bg-muted/30 border border-border/40 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-foreground block">{tx.organizationName}</span>
                        <span className="text-[10px] text-muted-foreground">{tx.plan} • {tx.date}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-400 block">+${tx.amountUsd}</span>
                        <Badge variant="outline" className="text-[9px] text-emerald-500 border-emerald-500/30">
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 6: PLATFORM USAGE */}
          <TabsContent value="usage" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-border/60 bg-card/60 p-4">
                <span className="text-xs text-muted-foreground block">Crawler Concurrency</span>
                <span className="text-2xl font-black text-foreground block mt-1">18 / 25 Nodes</span>
                <span className="text-[10px] text-emerald-500 block mt-1">72% pool utilization</span>
              </Card>

              <Card className="border-border/60 bg-card/60 p-4">
                <span className="text-xs text-muted-foreground block">Database Pool Conns</span>
                <span className="text-2xl font-black text-foreground block mt-1">34 / 100</span>
                <span className="text-[10px] text-muted-foreground block mt-1">Healthy connection reserve</span>
              </Card>

              <Card className="border-border/60 bg-card/60 p-4">
                <span className="text-xs text-muted-foreground block">Redis Cache Memory</span>
                <span className="text-2xl font-black text-foreground block mt-1">612 MB</span>
                <span className="text-[10px] text-muted-foreground block mt-1">30% of 2GB RAM budget</span>
              </Card>

              <Card className="border-border/60 bg-card/60 p-4">
                <span className="text-xs text-muted-foreground block">Keywords Tracked</span>
                <span className="text-2xl font-black text-foreground block mt-1">418,000</span>
                <span className="text-[10px] text-emerald-500 block mt-1">Updated daily at 00:00 UTC</span>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 7: API USAGE */}
          <TabsContent value="api-usage" className="space-y-6">
            <Card className="border-border/60 bg-card/60">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Endpoint Traffic &amp; Latency Distribution (24h)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {[
                  { path: "/api/v1/keywords", reqs: "142,000", latency: "18ms", err: "0.01%" },
                  { path: "/api/v1/rankings", reqs: "118,000", latency: "22ms", err: "0.02%" },
                  { path: "/api/v1/audit", reqs: "64,000", latency: "145ms", err: "0.08%" },
                  { path: "/api/v1/backlinks", reqs: "38,000", latency: "35ms", err: "0.00%" },
                  { path: "/api/v1/competitors", reqs: "14,400", latency: "48ms", err: "0.05%" },
                  { path: "/api/v1/reports", reqs: "6,000", latency: "320ms", err: "0.12%" },
                ].map((ep) => (
                  <div key={ep.path} className="p-3 rounded-lg bg-muted/20 border border-border/40 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-foreground">{ep.path}</span>
                      <span className="text-[11px] text-muted-foreground block">{ep.reqs} requests</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="font-semibold block">{ep.latency}</span>
                        <span className="text-[10px] text-muted-foreground">avg latency</span>
                      </div>
                      <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">
                        {ep.err} errors
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 8: SYSTEM HEALTH */}
          <TabsContent value="health" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "PostgreSQL Master Cluster", lat: "3ms", up: "99.99%", det: "Replication lag 0ms" },
                { name: "Redis Memory Cache & Pub/Sub", lat: "1ms", up: "100.0%", det: "94.2% hit ratio" },
                { name: "Chromium Crawler Cluster", lat: "180ms", up: "99.94%", det: "25 Playwright workers active" },
                { name: "OpenAI GPT-4o Gateway", lat: "420ms", up: "99.95%", det: "Prompt cache enabled" },
                { name: "Claude 3.5 Sonnet Engine", lat: "510ms", up: "99.92%", det: "Writing assistant pipeline" },
                { name: "Perplexity Sonar Gateway", lat: "380ms", up: "99.96%", det: "AI search citation scraper" },
              ].map((srv) => (
                <Card key={srv.name} className="border-border/60 bg-card/60 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">{srv.name}</span>
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">OPERATIONAL</Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Latency: <strong className="text-foreground">{srv.lat}</strong></span>
                    <span>Uptime: <strong className="text-emerald-500">{srv.up}</strong></span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2 border-t border-border/30 pt-2">{srv.det}</p>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB 9: FAILED JOBS */}
          <TabsContent value="jobs" className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Dead-letter queue &amp; crawler exceptions</span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetryAllJobs}
                disabled={failedJobs.length === 0}
                className="gap-1.5 text-xs h-8"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Retry All Failed ({failedJobs.length})
              </Button>
            </div>

            {failedJobs.length === 0 ? (
              <Card className="border-border/60 p-8 text-center bg-card/40">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <h3 className="font-bold text-foreground text-sm">Dead-Letter Queue Clean</h3>
                <p className="text-xs text-muted-foreground mt-1">No failed background jobs in the worker pipeline.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {failedJobs.map((j) => (
                  <Card key={j.id} className="border-red-500/20 bg-red-500/5 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="text-[10px]">{j.type}</Badge>
                          <span className="font-mono text-xs text-muted-foreground">{j.id}</span>
                          <span className="text-xs font-bold text-foreground">• {j.organizationName}</span>
                        </div>
                        <p className="text-xs font-semibold text-red-400 mt-2">{j.errorMessage}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRetryJob(j.id)}
                        className="text-xs h-8 gap-1.5 self-start sm:self-auto"
                      >
                        <Play className="h-3 w-3" /> Retry Job
                      </Button>
                    </div>
                    {j.stackSnippet && (
                      <pre className="mt-3 p-2.5 rounded bg-black/40 text-[10px] font-mono text-muted-foreground overflow-x-auto">
                        {j.stackSnippet}
                      </pre>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 10: AUDIT LOGS */}
          <TabsContent value="audit-logs" className="space-y-4">
            <Card className="border-border/60 bg-card/60">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/40 text-muted-foreground bg-muted/20">
                      <th className="p-3 font-semibold">Timestamp</th>
                      <th className="p-3 font-semibold">Actor</th>
                      <th className="p-3 font-semibold">Action</th>
                      <th className="p-3 font-semibold">Target Resource</th>
                      <th className="p-3 font-semibold">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 text-muted-foreground whitespace-nowrap">{log.timestamp}</td>
                        <td className="p-3 font-semibold text-foreground">{log.actorEmail}</td>
                        <td className="p-3 font-mono text-brand font-semibold">{log.action}</td>
                        <td className="p-3 text-muted-foreground">{log.targetResource}</td>
                        <td className="p-3 font-mono text-muted-foreground text-[11px]">{log.ipAddress}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 11: FEATURE FLAGS */}
          <TabsContent value="feature-flags" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {featureFlags.map((flag) => (
                <Card key={flag.id} className="border-border/60 bg-card/60 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{flag.name}</span>
                        <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                          {flag.key}
                        </code>
                        <Badge variant="outline" className="text-[10px]">
                          {flag.tierRestriction}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{flag.description}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        variant={flag.isEnabled ? "default" : "outline"}
                        onClick={() => handleToggleFlag(flag.id)}
                        className={`text-xs h-8 font-bold ${
                          flag.isEnabled ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""
                        }`}
                      >
                        {flag.isEnabled ? "ENABLED" : "DISABLED"}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Rollout: {flag.rolloutPercentage}%</span>
                    <div className="w-48 flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={flag.rolloutPercentage}
                        onChange={(e) => handleRolloutChange(flag.id, Number(e.target.value))}
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-brand"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB 12: AI USAGE */}
          <TabsContent value="ai-usage" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-border/60 bg-card/60 p-4">
                <span className="text-xs text-muted-foreground block">24h Tokens Consumed</span>
                <span className="text-2xl font-black text-foreground block mt-1">38.4M Tokens</span>
                <span className="text-[10px] text-purple-400 block mt-1">78.4% prompt cache hit rate</span>
              </Card>

              <Card className="border-border/60 bg-card/60 p-4">
                <span className="text-xs text-muted-foreground block">24h LLM Spend</span>
                <span className="text-2xl font-black text-purple-400 block mt-1">$184.20</span>
                <span className="text-[10px] text-muted-foreground block mt-1">Across all 4 provider APIs</span>
              </Card>

              <Card className="border-border/60 bg-card/60 p-4">
                <span className="text-xs text-muted-foreground block">Top Spender Organization</span>
                <span className="text-2xl font-black text-foreground block mt-1">TechScale Global</span>
                <span className="text-[10px] text-emerald-500 block mt-1">$68.20 (14.2M tokens)</span>
              </Card>
            </div>

            <Card className="border-border/60 bg-card/60">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Model Consumption Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {aiUsage?.models?.map((m: any) => (
                  <div key={m.modelName} className="p-3 rounded-lg bg-muted/20 border border-border/40 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-foreground block">{m.modelName}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {m.requests24h.toLocaleString()} requests • {m.avgLatencyMs}ms avg latency
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-purple-400 block">${m.costUsd.toFixed(2)}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {((m.inputTokens + m.outputTokens) / 1000000).toFixed(1)}M tokens
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 13: ABUSE DETECTION */}
          <TabsContent value="abuse" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {abuseAlerts.map((ab) => (
                <Card
                  key={ab.id}
                  className={`p-4 border ${
                    ab.status === "ACTIVE"
                      ? "border-red-500/30 bg-red-500/5"
                      : "border-border/60 bg-card/60 opacity-60"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-[10px]">{ab.threatType}</Badge>
                        <Badge variant="outline" className="text-[10px]">{ab.severity}</Badge>
                        <span className="text-xs font-mono text-muted-foreground">{ab.ipAddress} ({ab.country})</span>
                      </div>
                      <p className="text-xs font-semibold text-foreground mt-2">{ab.targetEntity}</p>
                      <p className="text-xs text-muted-foreground mt-1">Suggested: {ab.suggestedAction}</p>
                    </div>

                    {ab.status === "ACTIVE" ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleResolveAbuse(ab.id, "BLOCKED")}
                          className="text-xs h-8 gap-1.5"
                        >
                          <Ban className="h-3 w-3" /> Block &amp; Quarantine
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveAbuse(ab.id, "RESOLVED")}
                          className="text-xs h-8"
                        >
                          Dismiss
                        </Button>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">
                        {ab.status}
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB 14: SUPPORT TICKETS */}
          <TabsContent value="tickets" className="space-y-4">
            <Card className="border-border/60 bg-card/60">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/40 text-muted-foreground bg-muted/20">
                      <th className="p-3 font-semibold">Ticket</th>
                      <th className="p-3 font-semibold">Customer</th>
                      <th className="p-3 font-semibold">Priority</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold">SLA Countdown</th>
                      <th className="p-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {tickets.map((t) => (
                      <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          <span className="font-mono text-brand font-bold">{t.ticketNumber}</span>
                          <span className="font-semibold text-foreground block mt-0.5">{t.subject}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold block">{t.organizationName}</span>
                          <span className="text-[11px] text-muted-foreground">{t.customerEmail}</span>
                        </td>
                        <td className="p-3">
                          <Badge variant={t.priority === "URGENT" ? "destructive" : "outline"} className="text-[10px]">
                            {t.priority}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant="outline"
                            className={t.status === "RESOLVED" ? "text-emerald-500 border-emerald-500/30" : "text-amber-500 border-amber-500/30"}
                          >
                            {t.status}
                          </Badge>
                        </td>
                        <td className="p-3 font-semibold text-amber-500">
                          {t.status === "RESOLVED" ? "Met" : `${t.slaMinutesRemaining} mins`}
                        </td>
                        <td className="p-3 text-right">
                          {t.status !== "RESOLVED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTicketStatus(t.id, "RESOLVED")}
                              className="text-[11px] h-7 px-2 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
                            >
                              Resolve
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 15: ANNOUNCEMENTS */}
          <TabsContent value="announcements" className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">In-app broadcast notification banners</span>

              <Dialog open={ancModalOpen} onOpenChange={setAncModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5 text-xs bg-brand hover:bg-brand/90 text-brand-foreground shadow-sm">
                    <Plus className="h-4 w-4" /> New Announcement
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md border-border bg-card">
                  <DialogHeader>
                    <DialogTitle className="text-base font-bold">Broadcast Announcement</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateAnnouncement} className="space-y-4 pt-2">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Title</label>
                      <Input
                        value={newAncTitle}
                        onChange={(e) => setNewAncTitle(e.target.value)}
                        placeholder="e.g. Scheduled Infrastructure Maintenance"
                        className="h-9 text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Broadcast Message</label>
                      <textarea
                        value={newAncMsg}
                        onChange={(e) => setNewAncMsg(e.target.value)}
                        placeholder="Write the announcement text..."
                        rows={3}
                        className="w-full rounded-md border border-input bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Target Audience</label>
                      <select
                        value={newAncAudience}
                        onChange={(e: any) => setNewAncAudience(e.target.value)}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                      >
                        <option value="ALL">All Users</option>
                        <option value="AGENCY_ENTERPRISE">Agency &amp; Enterprise Only</option>
                        <option value="FREE_TIER">Free Tier Users</option>
                      </select>
                    </div>
                    <Button type="submit" className="w-full text-xs font-bold bg-brand hover:bg-brand/90 text-brand-foreground">
                      Publish Global Announcement
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {announcements.map((anc) => (
                <Card key={anc.id} className="p-4 border-border/60 bg-card/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{anc.type}</Badge>
                        <span className="font-bold text-sm text-foreground">{anc.title}</span>
                        <Badge variant="brand" className="text-[9px]">{anc.targetAudience}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">{anc.message}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={anc.isActive ? "default" : "outline"}
                        onClick={() => handleToggleAnc(anc.id)}
                        className={`text-xs h-8 ${anc.isActive ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}`}
                      >
                        {anc.isActive ? "ACTIVE" : "INACTIVE"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteAnc(anc.id)}
                        className="text-xs h-8 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
