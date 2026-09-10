"use client"

import { useState } from "react"
import Link from "next/link"
import {
  KeyRound, Plus, Copy, Check, Trash2, ShieldCheck,
  Code2, ExternalLink, RefreshCw, AlertTriangle, Eye, EyeOff, Terminal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEntitlements } from "@/hooks/use-entitlements"
import { UpgradePromptModal } from "@/components/billing/upgrade-prompt-modal"

interface ApiKeyItem {
  id: string
  name: string
  keyMasked: string
  fullKey: string
  created: string
  lastUsed: string
  scope: "Full Access" | "Read Only"
}

const INITIAL_KEYS: ApiKeyItem[] = [
  {
    id: "key_1",
    name: "Production Crawler Pipeline",
    keyMasked: "tst_live_9f82...38a1",
    fullKey: "tst_live_9f82d8c47b19401e938a1",
    created: "Oct 14, 2025",
    lastUsed: "2 mins ago",
    scope: "Full Access"
  },
  {
    id: "key_2",
    name: "CI/CD SEO Validation Webhook",
    keyMasked: "tst_live_41a0...92cc",
    fullKey: "tst_live_41a0e889104b281f92cc",
    created: "Nov 02, 2025",
    lastUsed: "1 day ago",
    scope: "Read Only"
  }
]

export default function ApiSettingsPage() {
  const { limits, planKey, isEnterprise } = useEntitlements()
  const [keys, setKeys] = useState<ApiKeyItem[]>(INITIAL_KEYS)
  const [createOpen, setCreateOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [newKeyScope, setNewKeyScope] = useState<"Full Access" | "Read Only">("Full Access")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [revealedId, setRevealedId] = useState<string | null>(null)
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyName.trim()) return

    const randomSuffix = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const fullKey = `tst_live_${randomSuffix}`

    const newKey: ApiKeyItem = {
      id: `key_${Date.now()}`,
      name: newKeyName.trim(),
      keyMasked: `${fullKey.substring(0, 12)}...${fullKey.substring(fullKey.length - 4)}`,
      fullKey,
      created: "Just now",
      lastUsed: "Never",
      scope: newKeyScope
    }

    setKeys([newKey, ...keys])
    setNewKeyName("")
    setCreateOpen(false)
  }

  const copyKey = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const deleteKey = (id: string) => {
    setKeys(prev => prev.filter(k => k.id !== id))
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <KeyRound className="h-6 w-6 text-brand" /> Enterprise REST API &amp; Webhooks
            </h1>
            <Badge variant="brand" className="text-[10px] font-bold py-0.5">REST v1</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Programmatic access to crawl engines, keyword metrics, backlink databases, and rank tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/developers">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs border-brand/40 text-brand hover:bg-brand/10">
              <Terminal className="h-4 w-4" /> Developer Dashboard &amp; Sandbox
            </Button>
          </Link>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 text-xs bg-brand hover:bg-brand/90 text-brand-foreground shadow-sm">
                <Plus className="h-4 w-4" /> Generate API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md border-border bg-card">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">Generate Secret API Key</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateKey} className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Key Description</label>
                  <Input
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Staging Server Crawler"
                    className="h-9 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Permissions Scope</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["Full Access", "Read Only"] as const).map((sc) => (
                      <button
                        key={sc}
                        type="button"
                        onClick={() => setNewKeyScope(sc)}
                        className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                          newKeyScope === sc
                            ? "border-brand bg-brand/10 text-brand"
                            : "border-border/60 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {sc}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setCreateOpen(false)} className="text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" variant="brand" size="sm" className="text-xs font-semibold">
                    Generate Key
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quota & Endpoint Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-border/80">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            API Monthly Allowance
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono-nums text-foreground">
              {(limits?.monthly_api_limit ?? 500).toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">calls / month</span>
          </div>
        </Card>

        <Card className="p-4 border-border/80">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Rate Limit
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono-nums text-foreground">
              {isEnterprise ? "1,200" : "120"}
            </span>
            <span className="text-xs text-muted-foreground">req / minute</span>
          </div>
        </Card>

        <Card className="p-4 border-border/80">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Active Secret Keys
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono-nums text-brand">
              {keys.length}
            </span>
            <span className="text-xs text-muted-foreground">keys provisioned</span>
          </div>
        </Card>
      </div>

      {/* Active API Keys Table */}
      <Card className="border-border/80 overflow-hidden shadow-xs">
        <CardHeader className="py-3 px-5 border-b border-border/60 bg-muted/20">
          <CardTitle className="text-sm font-semibold">Provisioned API Credentials</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Authenticate requests by including the <code className="text-brand font-mono">Authorization: Bearer &lt;TOKEN&gt;</code> header
          </CardDescription>
        </CardHeader>

        <div className="divide-y divide-border/40">
          {keys.map((k) => {
            const isRevealed = revealedId === k.id

            return (
              <div key={k.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{k.name}</span>
                    <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
                      {k.scope}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                    <span className="text-foreground">{isRevealed ? k.fullKey : k.keyMasked}</span>
                    <button
                      type="button"
                      onClick={() => setRevealedId(isRevealed ? null : k.id)}
                      className="text-muted-foreground hover:text-foreground"
                      title={isRevealed ? "Hide token" : "Reveal token"}
                    >
                      {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <span className="text-[11px] text-muted-foreground block pt-0.5">
                    Created {k.created} • Last used {k.lastUsed}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyKey(k.id, k.fullKey)}
                    className="h-8 text-xs gap-1"
                  >
                    {copiedId === k.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedId === k.id ? "Copied" : "Copy Key"}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteKey(k.id)}
                    className="h-8 text-xs text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Code Examples Card */}
      <Card className="border-border/80 p-5 space-y-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Code2 className="h-4 w-4 text-brand" /> Example Request: Instant SEO Crawl
        </CardTitle>

        <div className="p-4 rounded-xl bg-muted/50 border border-border/60 font-mono text-xs overflow-x-auto text-foreground">
          <code>{`curl -X POST https://topseotool.net/api/v1/audit \\
  -H "Authorization: Bearer ${keys[0]?.fullKey || "tst_live_demo"}" \\
  -H "Content-Type: application/json" \\
  -d '{"domain": "topseotool.net", "maxPages": 500}'`}</code>
        </div>
      </Card>

      <UpgradePromptModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        metricName="API Requests"
        currentPlanKey={planKey}
      />
    </div>
  )
}
