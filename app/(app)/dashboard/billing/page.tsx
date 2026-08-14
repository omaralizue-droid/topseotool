"use client"
import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { CreditCard, Check, Sparkles, ArrowRight, ShieldCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { PLANS } from "@/types"
import { toast } from "sonner"

export default function DashboardBillingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleCheckout = async (planKey: string) => {
    setLoadingPlan(planKey)
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey }),
      })
      const data = await res.json()
      if (data.url) {
        toast.success(`Upgraded plan to ${PLANS[planKey]?.name}!`)
        window.location.href = data.url
      }
    } catch {
      toast.error("Failed to initiate checkout")
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="pb-2 border-b border-border/40">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold tracking-tight">Subscription & Quota Entitlements</h1>
          <Badge variant="brand">Module 11</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Manage your SaaS plan subscription, usage meters, and billing limits.</p>
      </div>

      {/* Quota Usage Meter Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Website Projects</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono-nums">1 / 5</span>
              <span className="text-xs text-muted-foreground">4 remaining</span>
            </div>
            <Progress value={20} className="h-1.5" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Monthly SEO Audits</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono-nums">3 / 10</span>
              <span className="text-xs text-muted-foreground">7 remaining</span>
            </div>
            <Progress value={30} className="h-1.5" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">AI Search Queries</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono-nums">42 / 250</span>
              <span className="text-xs text-muted-foreground">208 remaining</span>
            </div>
            <Progress value={17} className="h-1.5" />
          </CardContent>
        </Card>
      </div>

      {/* Available Upgrade Plans */}
      <div className="space-y-4 pt-4">
        <h2 className="text-base font-semibold">Available Subscription Plans</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {Object.entries(PLANS).map(([key, plan]) => (
            <Card key={key} className="p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-base">{plan.name}</span>
                  <Badge variant="outline" className="text-[10px] font-mono">${plan.price}/mo</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{plan.description}</p>
                <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  <li>• {plan.limits.projects} Projects</li>
                  <li>• {plan.limits.auditsPerMonth} Audits/mo</li>
                  <li>• {plan.limits.aiQueriesPerMonth} AI Queries/mo</li>
                </ul>
              </div>
              <Button
                size="sm"
                variant={key === "AGENCY" ? "brand" : "outline"}
                onClick={() => handleCheckout(key)}
                disabled={loadingPlan === key}
              >
                {loadingPlan === key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : `Select ${plan.name}`}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}