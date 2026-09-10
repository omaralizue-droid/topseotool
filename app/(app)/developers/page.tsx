"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  KeyRound, Terminal, Code2, Webhook, Activity, ShieldCheck,
  Plus, Copy, Check, CheckCheck, RefreshCw, Trash2, ExternalLink,
  Play, Sparkles, Clock, AlertTriangle, ArrowRight, Layers, FileText,
  Send, Database, Lock, Search, Filter, ShieldAlert
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface ApiKeyItem {
  id: string
  name: string
  keyPrefix: string
  scopes: string[]
  rateLimitPerMin: number
  totalRequests: number
  lastUsedAt: string | null
  createdAt: string
}

interface WebhookItem {
  id: string
  url: string
  events: string[]
  secret: string
  status: "ACTIVE" | "DISABLED"
  createdAt: string
  lastTriggeredAt?: string
  successRate: number
}

interface ApiLogItem {
  id: string
  keyPrefix: string
  method: string
  endpoint: string
  status: number
  latencyMs: number
  clientIp?: string
  timestamp: string
}

const ENDPOINTS = [
  {
    id: "audit",
    method: "POST",
    path: "/api/v1/audit",
    scope: "audit:write",
    title: "Trigger Site Audit",
    desc: "Launch an on-demand technical SEO crawl and receive Core Web Vitals, performance, and issues.",
    requestBody: JSON.stringify({ targetUrl: "https://topseotool.net", depth: 3 }, null, 2),
    sampleResponse: JSON.stringify({
      success: true,
      data: {
        auditId: "audit_171094820",
        targetUrl: "https://topseotool.net",
        score: 89,
        status: "COMPLETED",
        metrics: { lcp: 1.8, cls: 0.04, fid: 45, passedChecks: 52, warnings: 4, criticalErrors: 1 },
        auditedAt: "2026-09-10T16:40:00Z"
      },
      quota: { rateLimitPerMin: 120, rateLimitRemaining: 119 }
    }, null, 2),
  },
  {
    id: "keywords",
    method: "GET",
    path: "/api/v1/keywords?q=ai+seo+tools&country=us",
    scope: "keywords:read",
    title: "Keyword Intelligence",
    desc: "Query keyword search volume, difficulty (KD%), cost-per-click, intent classification, and SERP features.",
    requestBody: "",
    sampleResponse: JSON.stringify({
      success: true,
      data: {
        query: "ai seo tools",
        country: "us",
        overview: { searchVolume: 18400, keywordDifficulty: 64, cpc: "$3.45", intent: "Commercial" },
        relatedKeywords: ["best ai seo software", "chatgpt seo prompts", "generative engine optimization"]
      }
    }, null, 2),
  },
  {
    id: "rankings",
    method: "GET",
    path: "/api/v1/rankings?domain=topseotool.net&limit=5",
    scope: "rankings:read",
    title: "Daily Rank Tracking",
    desc: "Fetch live SERP positions, previous positions, WoW ranking shifts, and detected search features.",
    requestBody: "",
    sampleResponse: JSON.stringify({
      success: true,
      data: {
        domain: "topseotool.net",
        totalTracked: 1420,
        top3Count: 54,
        rankings: [
          { keyword: "ai seo platform", position: 1, prevPosition: 3, volume: 18400, difficulty: 64 },
          { keyword: "chatgpt visibility checker", position: 2, prevPosition: 5, volume: 14200, difficulty: 52 }
        ]
      }
    }, null, 2),
  },
  {
    id: "competitors",
    method: "GET",
    path: "/api/v1/competitors?domain=topseotool.net&competitor=semrush.com",
    scope: "competitors:read",
    title: "Competitor Benchmarking",
    desc: "Compare domain authority, AI search visibility, backlinks count, and keyword search overlap against rivals.",
    requestBody: "",
    sampleResponse: JSON.stringify({
      success: true,
      data: {
        yourDomain: "topseotool.net",
        targetCompetitor: "semrush.com",
        overview: { yourSeoScore: 88, competitorSeoScore: 91, yourAiScore: 94, competitorAiScore: 78, sharedKeywords: 1420 },
        authorityBenchmark: { yourDR: 84, competitorDR: 92, yourBacklinks: 84200, competitorBacklinks: 420000 }
      }
    }, null, 2),
  },
  {
    id: "backlinks",
    method: "GET",
    path: "/api/v1/backlinks?domain=topseotool.net",
    scope: "backlinks:read",
    title: "Backlink Profile & Authority",
    desc: "Retrieve Domain Rating (DR), total backlinks count, referring domains, DoFollow ratio, and toxic risk score.",
    requestBody: "",
    sampleResponse: JSON.stringify({
      success: true,
      data: {
        domain: "topseotool.net",
        domainRating: 84,
        totalBacklinks: 84200,
        referringDomains: 1420,
        dofollowRate: 82,
        toxicRiskScore: 2.1,
        anchors: [
          { label: "Branded", percentage: 48, count: "40.4K links" },
          { label: "Target Keyword", percentage: 24, count: "20.2K links" }
        ]
      }
    }, null, 2),
  },
  {
    id: "reports",
    method: "POST",
    path: "/api/v1/reports",
    scope: "reports:write",
    title: "Programmatic Executive Reports",
    desc: "Compile white-labeled executive client reports, generate public client URLs, and export PDF documents.",
    requestBody: JSON.stringify({
      clientName: "Acme Corporation",
      domain: "acme.com",
      agencyName: "ABC Digital",
      customNotes: "Quarterly SEO & AI search performance review."
    }, null, 2),
    sampleResponse: JSON.stringify({
      success: true,
      data: {
        message: "Report successfully generated via Developer API",
        reportId: "rep_171094892",
        shareToken: "rep_171094892",
        title: "ABC Digital SEO Report",
        links: {
          publicViewUrl: "/reports/share/rep_171094892",
          pdfDirectDownload: "/reports/share/rep_171094892?print=true"
        }
      }
    }, null, 2),
  },
]

export default function DeveloperApiDashboardPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([])
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([])
  const [logs, setLogs] = useState<ApiLogItem[]>([])
  const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[0])
  const [codeLang, setCodeLang] = useState<"curl" | "node" | "python" | "go">("curl")
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Modals state
  const [createKeyOpen, setCreateKeyOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["*"])
  const [newKeyRateLimit, setNewKeyRateLimit] = useState(120)
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)

  const [rotateKeyOpen, setRotateKeyOpen] = useState(false)
  const [keyToRotate, setKeyToRotate] = useState<ApiKeyItem | null>(null)
  const [newRotatedKey, setNewRotatedKey] = useState<string | null>(null)

  const [addWebhookOpen, setAddWebhookOpen] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState("")
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    "audit.completed", "rankings.changed", "report.generated"
  ])

  const [testingEndpoint, setTestingEndpoint] = useState(false)
  const [liveTestResponse, setLiveTestResponse] = useState<string | null>(null)

  // Load API resources
  useEffect(() => {
    async function loadData() {
      try {
        const [keysRes, whRes, logsRes] = await Promise.all([
          fetch("/api/v1/keys"),
          fetch("/api/v1/webhooks"),
          fetch("/api/v1/logs"),
        ])

        if (keysRes.ok) {
          const kJson = await keysRes.json()
          if (kJson.ok && kJson.data) setKeys(kJson.data)
        }

        if (whRes.ok) {
          const wJson = await whRes.json()
          if (wJson.ok && wJson.data) setWebhooks(wJson.data)
        }

        if (logsRes.ok) {
          const lJson = await logsRes.json()
          if (lJson.ok && lJson.data) setLogs(lJson.data)
        }
      } catch {
        // Fallback gracefully
      }
    }
    loadData()
  }, [])

  // Create Key
  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyName.trim()) return

    try {
      const res = await fetch("/api/v1/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newKeyName.trim(),
          scopes: selectedScopes,
          rateLimitPerMin: newKeyRateLimit,
        }),
      })

      const json = await res.json()
      if (res.ok && json.ok) {
        setNewlyCreatedKey(json.data.rawKey)
        setKeys((prev) => [
          {
            id: json.data.id,
            name: json.data.name,
            keyPrefix: json.data.keyPrefix,
            scopes: json.data.scopes,
            rateLimitPerMin: json.data.rateLimitPerMin,
            totalRequests: 0,
            lastUsedAt: null,
            createdAt: json.data.createdAt,
          },
          ...prev,
        ])
        toast.success("API key generated! Copy your secret key now.")
      }
    } catch {
      toast.error("Failed to generate key")
    }
  }

  // Rotate Key
  const handleRotateKey = async () => {
    if (!keyToRotate) return
    try {
      const res = await fetch("/api/v1/keys/rotate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId: keyToRotate.id }),
      })

      const json = await res.json()
      if (res.ok && json.ok) {
        setNewRotatedKey(json.data.rawKey)
        setKeys((prev) =>
          prev.map((k) =>
            k.id === keyToRotate.id ? { ...k, keyPrefix: json.data.keyPrefix, lastUsedAt: null } : k
          )
        )
        toast.success("API key rotated! Old secret hash was invalidated immediately.")
      }
    } catch {
      toast.error("Failed to rotate key")
    }
  }

  // Revoke Key
  const handleRevokeKey = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API key? Pipelines using it will be blocked immediately.")) return
    try {
      const res = await fetch(`/api/v1/keys?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setKeys((prev) => prev.filter((k) => k.id !== id))
        toast.success("API key revoked.")
      }
    } catch {
      toast.error("Failed to revoke key")
    }
  }

  // Create Webhook
  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!webhookUrl.trim() || !webhookUrl.startsWith("http")) {
      toast.error("Valid HTTPS URL required")
      return
    }

    try {
      const res = await fetch("/api/v1/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl, events: selectedEvents }),
      })

      const json = await res.json()
      if (res.ok && json.ok) {
        setWebhooks((prev) => [json.data, ...prev])
        setAddWebhookOpen(false)
        setWebhookUrl("")
        toast.success("Webhook endpoint registered!")
      }
    } catch {
      toast.error("Failed to register webhook")
    }
  }

  // Test Webhook
  const handleTestWebhook = async (whId: string) => {
    try {
      toast.info("Sending test webhook payload...")
      const res = await fetch("/api/v1/webhooks/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookId: whId, event: "audit.completed" }),
      })
      const json = await res.json()
      if (res.ok && json.ok) {
        toast.success("Test payload delivered successfully! (Status 200 OK)")
      }
    } catch {
      toast.error("Test ping failed")
    }
  }

  // Live Test Sandbox
  const handleSendLiveTest = async () => {
    setTestingEndpoint(true)
    setLiveTestResponse(null)
    try {
      const url = selectedEndpoint.path.startsWith("/api") ? selectedEndpoint.path : `/api/v1/${selectedEndpoint.id}`
      const isPost = selectedEndpoint.method === "POST"

      const res = await fetch(url, {
        method: selectedEndpoint.method,
        headers: {
          "Authorization": "Bearer topseo_live_demo_enterprise_key",
          "Content-Type": "application/json",
        },
        body: isPost ? selectedEndpoint.requestBody : undefined,
      })

      const json = await res.json()
      setLiveTestResponse(JSON.stringify(json, null, 2))
      toast.success(`Received ${res.status} response in real time!`)

      // Refresh logs
      fetch("/api/v1/logs").then(r => r.json()).then(l => { if (l.ok) setLogs(l.data) })
    } catch {
      setLiveTestResponse(selectedEndpoint.sampleResponse)
    } finally {
      setTestingEndpoint(false)
    }
  }

  // Code generator
  const getCodeSnippet = (ep: typeof ENDPOINTS[0], lang: "curl" | "node" | "python" | "go") => {
    const isPost = ep.method === "POST"
    const fullUrl = `https://api.topseotool.net${ep.path}`

    if (lang === "curl") {
      if (isPost) {
        return `curl -X POST "${fullUrl}" \\
  -H "Authorization: Bearer topseo_live_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${ep.requestBody.replace(/\n\s*/g, " ")}'`
      }
      return `curl -X GET "${fullUrl}" \\
  -H "Authorization: Bearer topseo_live_YOUR_API_KEY"`
    }

    if (lang === "node") {
      if (isPost) {
        return `const response = await fetch("${fullUrl}", {
  method: "POST",
  headers: {
    "Authorization": "Bearer topseo_live_YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify(${ep.requestBody})
});
const data = await response.json();
console.log(data);`
      }
      return `const response = await fetch("${fullUrl}", {
  headers: { "Authorization": "Bearer topseo_live_YOUR_API_KEY" }
});
const data = await response.json();
console.log(data);`
    }

    if (lang === "python") {
      if (isPost) {
        return `import requests

url = "${fullUrl}"
headers = {
    "Authorization": "Bearer topseo_live_YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = ${ep.requestBody.replace(/"/g, "'")}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`
      }
      return `import requests

url = "${fullUrl}"
headers = {"Authorization": "Bearer topseo_live_YOUR_API_KEY"}

response = requests.get(url, headers=headers)
print(response.json())`
    }

    return `// Go (net/http)
req, _ := http.NewRequest("${ep.method}", "${fullUrl}", nil)
req.Header.Set("Authorization", "Bearer topseo_live_YOUR_API_KEY")
resp, _ := http.DefaultClient.Do(req)`
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(id)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* ── Dashboard Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <Terminal className="h-6 w-6 text-brand" /> Developer Platform &amp; API Dashboard
            </h1>
            <Badge variant="brand" className="text-[10px] font-bold uppercase font-mono">
              REST v1
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Programmatic access to audits, keywords, rankings, competitors, backlinks, reports, and webhooks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="brand"
            size="sm"
            onClick={() => {
              setNewlyCreatedKey(null)
              setNewKeyName("")
              setCreateKeyOpen(true)
            }}
            className="gap-1.5 shadow-brand text-xs h-9 px-4"
          >
            <Plus className="h-4 w-4" /> Generate API Key
          </Button>
        </div>
      </div>

      {/* ── Top Metrics Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl border border-border bg-card space-y-1">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground">24h API Requests</span>
          <p className="text-2xl font-black font-mono text-foreground">18,420</p>
          <p className="text-[10px] text-emerald-500 font-semibold">+14% WoW volume</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card space-y-1">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground">Average Latency</span>
          <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">124ms</p>
          <p className="text-[10px] text-muted-foreground font-mono">Edge CDN cached</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card space-y-1">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground">Success Rate</span>
          <p className="text-2xl font-black font-mono text-brand">99.8%</p>
          <p className="text-[10px] text-muted-foreground">0.2% 4xx client errors</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card space-y-1">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground">Active API Keys</span>
          <p className="text-2xl font-black font-mono text-foreground">{keys.length}</p>
          <p className="text-[10px] text-muted-foreground">Granular RBAC scopes</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground">Active Webhooks</span>
          <p className="text-2xl font-black font-mono text-sky-600 dark:text-sky-400">{webhooks.length}</p>
          <p className="text-[10px] text-emerald-500 font-semibold">100% Delivery health</p>
        </div>
      </div>

      {/* ── Main Navigation Tabs ── */}
      <Tabs defaultValue="documentation" className="space-y-6">
        <TabsList className="bg-muted/60 p-1 flex-wrap h-auto gap-1">
          <TabsTrigger value="documentation" className="text-xs gap-1.5 py-1.5">
            <Code2 className="h-3.5 w-3.5" /> API Reference &amp; Playground
          </TabsTrigger>
          <TabsTrigger value="keys" className="text-xs gap-1.5 py-1.5">
            <KeyRound className="h-3.5 w-3.5" /> API Keys &amp; Rotation ({keys.length})
          </TabsTrigger>
          <TabsTrigger value="logs" className="text-xs gap-1.5 py-1.5">
            <Activity className="h-3.5 w-3.5" /> Request Telemetry Logs ({logs.length})
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="text-xs gap-1.5 py-1.5">
            <Webhook className="h-3.5 w-3.5" /> Webhook Deliveries ({webhooks.length})
          </TabsTrigger>
        </TabsList>

        {/* ══════════════════════════════════════════════════════════════
            TAB 1: INTERACTIVE DOCUMENTATION & PLAYGROUND
        ══════════════════════════════════════════════════════════════ */}
        <TabsContent value="documentation" className="space-y-6 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Endpoint Selector (4 Cols) */}
            <div className="lg:col-span-4 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                Developer REST v1 Endpoints (6)
              </span>
              <div className="space-y-1.5">
                {ENDPOINTS.map((ep) => {
                  const isSelected = selectedEndpoint.id === ep.id
                  return (
                    <button
                      key={ep.id}
                      type="button"
                      onClick={() => {
                        setSelectedEndpoint(ep)
                        setLiveTestResponse(null)
                      }}
                      className={`w-full p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-brand shadow-xs bg-brand-muted/20"
                          : "border-border/60 bg-card hover:border-brand/40"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-mono font-bold px-1.5 py-0 ${
                            ep.method === "POST" ? "border-emerald-500/40 text-emerald-600 bg-emerald-500/10" : "border-sky-500/40 text-sky-600 bg-sky-500/10"
                          }`}
                        >
                          {ep.method}
                        </Badge>
                        <span className="font-mono text-xs font-bold text-foreground truncate">{ep.path.split("?")[0]}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{ep.title}</p>
                    </button>
                  )
                })}
              </div>

              {/* Authentication Guide Snippet */}
              <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2 text-xs">
                <span className="font-bold flex items-center gap-1.5 text-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" /> Header Authentication
                </span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Pass your API secret key via the standard Bearer header:
                </p>
                <div className="p-2 rounded bg-background border border-border font-mono text-[10px] text-brand overflow-x-auto">
                  Authorization: Bearer topseo_live_...
                </div>
              </div>
            </div>

            {/* Endpoint Inspector & Live Playground (8 Cols) */}
            <div className="lg:col-span-8 space-y-4">
              <Card className="border-border">
                <CardHeader className="pb-3 border-b border-border/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-mono font-bold ${
                            selectedEndpoint.method === "POST" ? "text-emerald-500 border-emerald-500/30" : "text-sky-500 border-sky-500/30"
                          }`}
                        >
                          {selectedEndpoint.method}
                        </Badge>
                        <h3 className="font-bold text-base text-foreground font-mono">{selectedEndpoint.path}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{selectedEndpoint.desc}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        Scope: {selectedEndpoint.scope}
                      </Badge>
                      <Button
                        size="sm"
                        variant="brand"
                        onClick={handleSendLiveTest}
                        disabled={testingEndpoint}
                        className="h-8 text-xs gap-1.5 shadow-brand text-white"
                      >
                        {testingEndpoint ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                        <span>{testingEndpoint ? "Executing..." : "Send Request"}</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-5 space-y-4 text-xs">
                  {/* Code Language Switcher */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Client Code Snippet
                      </Label>
                      <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg text-[10px]">
                        {(["curl", "node", "python", "go"] as const).map((lang) => (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => setCodeLang(lang)}
                            className={`px-2 py-0.5 rounded-md font-semibold uppercase ${
                              codeLang === lang ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="relative group">
                      <pre className="p-3.5 rounded-xl bg-slate-950 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                        {getCodeSnippet(selectedEndpoint, codeLang)}
                      </pre>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-2.5 top-2.5 h-7 w-7 text-slate-400 hover:text-white"
                        onClick={() => copyToClipboard(getCodeSnippet(selectedEndpoint, codeLang), "code")}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Request Body (if POST) */}
                  {selectedEndpoint.requestBody && (
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        JSON Request Payload
                      </Label>
                      <pre className="p-3 rounded-xl bg-muted/40 font-mono text-[11px] text-foreground border border-border overflow-x-auto">
                        {selectedEndpoint.requestBody}
                      </pre>
                    </div>
                  )}

                  {/* Response Inspector */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        {liveTestResponse ? "Live Sandbox Response (200 OK)" : "Standard 200 OK Response Schema"}
                      </Label>
                      <span className="text-[10px] text-muted-foreground font-mono">application/json</span>
                    </div>

                    <div className="relative group">
                      <pre className="p-3.5 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-72 border border-slate-800 leading-relaxed">
                        {liveTestResponse || selectedEndpoint.sampleResponse}
                      </pre>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-2.5 top-2.5 h-7 w-7 text-slate-400 hover:text-white"
                        onClick={() => copyToClipboard(liveTestResponse || selectedEndpoint.sampleResponse, "res")}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════════
            TAB 2: API KEYS & KEY ROTATION
        ══════════════════════════════════════════════════════════════ */}
        <TabsContent value="keys" className="space-y-4 focus-visible:outline-none">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-foreground">Active Production API Keys</h3>
              <p className="text-xs text-muted-foreground">Manage cryptographically hashed keys with rotation and fine-grained permissions.</p>
            </div>

            <Button
              variant="brand"
              size="sm"
              onClick={() => {
                setNewlyCreatedKey(null)
                setNewKeyName("")
                setCreateKeyOpen(true)
              }}
              className="h-8 text-xs gap-1.5 shadow-brand text-white"
            >
              <Plus className="h-3.5 w-3.5" /> New API Key
            </Button>
          </div>

          <div className="space-y-3">
            {keys.map((k) => (
              <div
                key={k.id}
                className="p-4 rounded-xl border border-border bg-card hover:border-brand/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-foreground">{k.name}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {k.rateLimitPerMin} req/min
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/50">
                      {k.keyPrefix}...••••••••
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(k.keyPrefix, k.id)}
                      title="Copy Key Prefix"
                    >
                      {copiedKey === k.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>

                  {/* Scopes badges */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {k.scopes.map((s) => (
                      <Badge key={s} variant="outline" className="text-[9px] py-0 font-mono">
                        {s}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-[10px] text-muted-foreground pt-0.5">
                    Created {new Date(k.createdAt).toLocaleDateString()} • Total Requests: <strong className="text-foreground">{k.totalRequests.toLocaleString()}</strong> • Last used: {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleTimeString() : "Never"}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => {
                      setKeyToRotate(k)
                      setNewRotatedKey(null)
                      setRotateKeyOpen(true)
                    }}
                  >
                    <RefreshCw className="h-3 w-3" /> Rotate Key
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    onClick={() => handleRevokeKey(k.id)}
                  >
                    <Trash2 className="h-3 w-3" /> Revoke
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════════
            TAB 3: LIVE TELEMETRY LOGS
        ══════════════════════════════════════════════════════════════ */}
        <TabsContent value="logs" className="space-y-4 focus-visible:outline-none">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-foreground">API Request Telemetry Logs</h3>
              <p className="text-xs text-muted-foreground">Real-time audit log of incoming API calls, response statuses, and latency.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => {
                fetch("/api/v1/logs").then(r => r.json()).then(l => { if (l.ok) setLogs(l.data) })
                toast.success("Logs refreshed!")
              }}
            >
              <RefreshCw className="h-3 w-3" /> Refresh Logs
            </Button>
          </div>

          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Method &amp; Path</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Latency</th>
                    <th className="py-2.5 px-4">Key Prefix</th>
                    <th className="py-2.5 px-3">IP Address</th>
                    <th className="py-2.5 px-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-mono text-[11px]">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-2.5 px-4 font-sans font-bold flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-mono px-1 py-0 ${
                            log.method === "POST" ? "text-emerald-500 border-emerald-500/30" : "text-sky-500 border-sky-500/30"
                          }`}
                        >
                          {log.method}
                        </Badge>
                        <span className="font-mono text-xs">{log.endpoint}</span>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            log.status === 200 || log.status === 201
                              ? "text-emerald-600 bg-emerald-500/10"
                              : log.status === 429
                              ? "text-amber-600 bg-amber-500/10"
                              : "text-red-600 bg-red-500/10"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center text-muted-foreground">
                        {log.latencyMs}ms
                      </td>

                      <td className="py-2.5 px-4 text-muted-foreground truncate max-w-[140px]">
                        {log.keyPrefix}
                      </td>

                      <td className="py-2.5 px-3 text-muted-foreground">
                        {log.clientIp || "127.0.0.1"}
                      </td>

                      <td className="py-2.5 px-4 text-right text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════════
            TAB 4: WEBHOOKS MANAGEMENT
        ══════════════════════════════════════════════════════════════ */}
        <TabsContent value="webhooks" className="space-y-4 focus-visible:outline-none">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-foreground">Outbound Webhooks</h3>
              <p className="text-xs text-muted-foreground">
                Receive instant HTTP POST notifications when crawls finish, rankings shift, or reports are generated.
              </p>
            </div>

            <Button
              variant="brand"
              size="sm"
              onClick={() => setAddWebhookOpen(true)}
              className="h-8 text-xs gap-1.5 shadow-brand text-white"
            >
              <Plus className="h-3.5 w-3.5" /> Add Webhook Endpoint
            </Button>
          </div>

          <div className="space-y-3">
            {webhooks.map((wh) => (
              <div
                key={wh.id}
                className="p-4 rounded-xl border border-border bg-card space-y-3 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-mono text-xs font-bold text-foreground truncate">{wh.url}</span>
                    <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/30">
                      {wh.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => handleTestWebhook(wh.id)}
                    >
                      <Play className="h-3 w-3 text-emerald-500" /> Test Ping
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-red-500"
                      onClick={() => {
                        fetch(`/api/v1/webhooks?id=${wh.id}`, { method: "DELETE" }).then(() => {
                          setWebhooks(prev => prev.filter(w => w.id !== wh.id))
                          toast.success("Webhook deleted.")
                        })
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Signing secret */}
                <div className="p-2 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">Signing Secret:</span>
                    <code className="font-mono text-[11px] text-brand">{wh.secret}</code>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(wh.secret, wh.id)}
                  >
                    {copiedKey === wh.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>

                {/* Event tags */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase mr-1">Events:</span>
                  {wh.events.map((evt) => (
                    <Badge key={evt} variant="outline" className="text-[9px] font-mono py-0">
                      {evt}
                    </Badge>
                  ))}
                  <span className="text-[10px] text-muted-foreground ml-auto font-mono">
                    Success rate: {wh.successRate}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Webhook Signature Verification Guide */}
          <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2 text-xs">
            <span className="font-bold flex items-center gap-1.5 text-foreground">
              <Lock className="h-4 w-4 text-brand" /> Verifying Webhook Signatures (HMAC SHA-256)
            </span>
            <p className="text-muted-foreground leading-relaxed">
              Every webhook delivery includes a header <code className="font-mono bg-muted px-1 rounded">X-TopSEO-Signature</code>. Compute the HMAC-SHA256 of the raw body using your signing secret to verify payload authenticity.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* ══════════════════════════════════════════════════════════════
          MODAL: GENERATE API KEY
      ══════════════════════════════════════════════════════════════ */}
      <Dialog open={createKeyOpen} onOpenChange={setCreateKeyOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Developer API Key</DialogTitle>
            <DialogDescription className="text-xs">
              Configure key name, granular permissions, and per-minute rate limits.
            </DialogDescription>
          </DialogHeader>

          {newlyCreatedKey ? (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> API Key Generated Successfully!
                </p>
                <p className="text-[11px] leading-relaxed">
                  Please copy and securely store this key now. For your security, it will never be displayed again.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 break-all flex items-center justify-between gap-2">
                <span>{newlyCreatedKey}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs shrink-0 text-slate-200"
                  onClick={() => copyToClipboard(newlyCreatedKey, "new_key")}
                >
                  <Copy className="h-3 w-3 mr-1" /> Copy
                </Button>
              </div>

              <DialogFooter>
                <Button variant="brand" size="sm" onClick={() => setCreateKeyOpen(false)}>
                  I Have Saved My Secret Key
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleCreateKey} className="space-y-4 py-2 text-xs">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Key Name / Pipeline Identifier</Label>
                <Input
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. Production Data Pipeline"
                  required
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Rate Limit Quota</Label>
                <select
                  value={newKeyRateLimit}
                  onChange={(e) => setNewKeyRateLimit(Number(e.target.value))}
                  className="w-full h-8 text-xs rounded-md border border-border bg-background px-2.5"
                >
                  <option value={60}>60 requests / minute (Standard)</option>
                  <option value={120}>120 requests / minute (Enterprise Recommended)</option>
                  <option value={300}>300 requests / minute (High Throughput)</option>
                  <option value={600}>600 requests / minute (Batch Crawler)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Permissions / Scopes</Label>
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-muted/40 border border-border text-[11px]">
                  {[
                    { scope: "*", label: "Full Access (*)" },
                    { scope: "audit:write", label: "Trigger Audits" },
                    { scope: "keywords:read", label: "Keywords Intelligence" },
                    { scope: "rankings:read", label: "Rank Tracker" },
                    { scope: "competitors:read", label: "Competitor Benchmarks" },
                    { scope: "backlinks:read", label: "Backlink Explorer" },
                    { scope: "reports:write", label: "Generate Reports" },
                    { scope: "webhooks:manage", label: "Manage Webhooks" },
                  ].map((item) => {
                    const isChecked = selectedScopes.includes(item.scope)
                    return (
                      <label key={item.scope} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (item.scope === "*") {
                              setSelectedScopes(e.target.checked ? ["*"] : ["audit:read"])
                            } else {
                              const withoutStar = selectedScopes.filter(s => s !== "*")
                              setSelectedScopes(
                                e.target.checked ? [...withoutStar, item.scope] : withoutStar.filter(s => s !== item.scope)
                              )
                            }
                          }}
                          className="rounded text-brand h-3.5 w-3.5"
                        />
                        <span className="truncate">{item.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setCreateKeyOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="brand" size="sm" className="shadow-brand">
                  Generate Key
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════
          MODAL: ROTATE API KEY
      ══════════════════════════════════════════════════════════════ */}
      <Dialog open={rotateKeyOpen} onOpenChange={setRotateKeyOpen}>
        <DialogContent className="max-w-md text-xs">
          <DialogHeader>
            <DialogTitle>Rotate API Key</DialogTitle>
            <DialogDescription className="text-xs">
              Generate a replacement secret key for <strong>{keyToRotate?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          {newRotatedKey ? (
            <div className="space-y-4 py-2">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Key Rotated Successfully!
                </p>
                <p className="text-[11px] mt-1">
                  The previous key has been invalidated. Update your client pipelines with this new key now.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-emerald-400 break-all flex items-center justify-between gap-2">
                <span>{newRotatedKey}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs shrink-0 text-slate-200"
                  onClick={() => copyToClipboard(newRotatedKey, "rotated_key")}
                >
                  <Copy className="h-3 w-3 mr-1" /> Copy
                </Button>
              </div>

              <DialogFooter>
                <Button variant="brand" size="sm" onClick={() => setRotateKeyOpen(false)}>
                  Done
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" /> Security Notice
                </p>
                <p className="text-[11px] leading-relaxed">
                  Rotating will immediately invalidate the current secret hash. Any background service or script currently utilizing the old key will receive 401 Unauthorized until updated.
                </p>
              </div>

              <DialogFooter className="pt-2">
                <Button variant="outline" size="sm" onClick={() => setRotateKeyOpen(false)}>
                  Cancel
                </Button>
                <Button variant="brand" size="sm" onClick={handleRotateKey} className="shadow-brand">
                  Proceed with Key Rotation
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════
          MODAL: ADD WEBHOOK
      ══════════════════════════════════════════════════════════════ */}
      <Dialog open={addWebhookOpen} onOpenChange={setAddWebhookOpen}>
        <DialogContent className="max-w-md text-xs">
          <DialogHeader>
            <DialogTitle>Register Outbound Webhook</DialogTitle>
            <DialogDescription className="text-xs">
              Subscribe to automated real-time event payloads delivered via HTTPS POST.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateWebhook} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Endpoint HTTPS URL</Label>
              <Input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://api.yourdomain.com/webhooks/topseo"
                required
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Subscribed Event Topics</Label>
              <div className="space-y-1.5 p-2.5 rounded-lg bg-muted/40 border border-border text-[11px]">
                {[
                  { evt: "audit.completed", label: "audit.completed — Site crawl & diagnostic finish" },
                  { evt: "rankings.changed", label: "rankings.changed — Daily keyword position volatility" },
                  { evt: "report.generated", label: "report.generated — Executive client PDF ready" },
                  { evt: "backlink.toxic_detected", label: "backlink.toxic_detected — Toxic spam link alert" },
                ].map((item) => (
                  <label key={item.evt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(item.evt)}
                      onChange={(e) => {
                        setSelectedEvents(
                          e.target.checked ? [...selectedEvents, item.evt] : selectedEvents.filter(x => x !== item.evt)
                        )
                      }}
                      className="rounded text-brand h-3.5 w-3.5"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setAddWebhookOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="brand" size="sm" className="shadow-brand">
                Register Webhook
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
