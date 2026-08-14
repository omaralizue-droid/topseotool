"use client"
import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  CreditCard, Zap, BarChart3, Globe, Brain, AlertTriangle,
  CheckCircle2, XCircle, ArrowRight, Loader2, ExternalLink,
  ShieldCheck, TrendingUp, Clock, Ban
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PLANS, PLAN_ORDER, type PlanKey } from "@/types"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface UsageData {
  planKey: PlanKey
  plan: {
    key: PlanKey
    name: string
    price: number
    yearlyPrice: number
    description: string
    features: string[]
    limits: {
      projects: number
      auditsPerMonth: number
      aiQueriesPerMonth: number
      whiteLabel: boolean
      apiAccess: boolean
    }
  }
  projectsUsed: number
  projectsLimit: number
  projectsRemaining: number
  auditsUsed: number
  auditsLimit: number
  auditsRemaining: number
  aiQueriesUsed: number
  aiQueriesLimit: number
  aiQueriesRemaining: number
  canWhiteLabel: boolean
  hasApiAccess: boolean
  canGenerateReports: boolean
  status: string
  cancelAtPeriodEnd: boolean
  periodEnd: string | null
  stripeCustomerId: string | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function usagePct(used: number, limit: number) {
  if (limit === 0) return 0
  return Math.min(100, Math.round((used / limit) * 100))
}

function statusBadge(status: string, cancelAtPeriodEnd: boolean) {
  if (cancelAtPeriodEnd) return <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/20">Cancelling</Badge>
  if (status === "ACTIVE" || status === "TRIALING") return <Badge variant="success">Active</Badge>
  if (status === "PAST_DUE") return <Badge variant="error">Past Due</Badge>
  if (status === "CANCELED") return <Badge variant="secondary">Cancelled</Badge>
  return <Badge variant="outline">{status}</Badge>
}

function planBadge(planKey: PlanKey) {
  if (planKey === "FREE") return <Badge variant="secondary">Free</Badge>
  if (planKey === "PRO") return <Badge variant="brand">Pro</Badge>
  if (planKey === "AGENCY") return <Badge className="bg-violet-500 text-white">Agency</Badge>
  return <Badge className="bg-amber-500 text-white">Business</Badge>
}

// ---------------------------------------------------------------------------
// Usage Meter Component
// ---------------------------------------------------------------------------
function UsageMeter({
  label, icon: Icon, used, limit, remaining, color = "brand"
}: {
  label: string
  icon: React.ElementType
  used: number
  limit: number
  remaining: number
  color?: string
}) {
  const pct = usagePct(used, limit)
  const isWarning = pct >= 80
  const isOver = pct >= 100

  const barColor = isOver
    ? "bg-red-500"
    : isWarning
    ? "bg-amber-500"
    : "bg-brand"

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-medium text-foreground">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          {label}
        </span>
        <span className="font-mono-nums text-xs text-muted-foreground">
          <span className={isOver ? "text-red-500 font-bold" : ""}>{used.toLocaleString()}</span>
          {" / "}
          {limit.toLocaleString()}
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isWarning && !isOver && (
        <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {remaining.toLocaleString()} remaining this month
        </p>
      )}
      {isOver && (
        <p className="text-[11px] text-red-500 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Limit reached — upgrade to continue
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Upgrade / Checkout action
// ---------------------------------------------------------------------------
function useCheckout() {
  return useMutation({
    mutationFn: async (planKey: PlanKey) => {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Checkout failed")
      return data.data as { url: string }
    },
    onSuccess: (data) => {
      window.location.href = data.url
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

function usePortal() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/billing/portal", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Portal failed")
      return data.data as { url: string }
    },
    onSuccess: (data) => {
      window.location.href = data.url
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

function useCancel() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/billing/cancel", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Cancel failed")
      return data.data as { message: string }
    },
    onSuccess: (data) => {
      toast.success(data.message)
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

// ---------------------------------------------------------------------------
// Main Billing Page
// ---------------------------------------------------------------------------
export default function BillingPage() {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const { data: usage, isLoading } = useQuery<UsageData>({
    queryKey: ["billing-usage"],
    queryFn: async () => {
      const res = await fetch("/api/billing/usage")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return data.data
    },
    staleTime: 30_000,
  })

  const checkout = useCheckout()
  const portal = usePortal()
  const cancel = useCancel()

  const currentPlanKey = usage?.planKey ?? "FREE"
  const isPaid = currentPlanKey !== "FREE"
  const isAtLimit = (usage?.auditsUsed ?? 0) >= (usage?.auditsLimit ?? 1)
    || (usage?.aiQueriesUsed ?? 0) >= (usage?.aiQueriesLimit ?? 1)
    || (usage?.projectsUsed ?? 0) >= (usage?.projectsLimit ?? 1)

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Billing & Subscription</h1>
          <p className="text-sm text-muted-foreground">Manage your plan, view usage, and update billing details.</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/pricing">
            View all plans <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
          </Link>
        </Button>
      </div>

      {/* Upgrade banner when near/over limit */}
      {!isLoading && isAtLimit && currentPlanKey !== "BUSINESS" && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">You've reached a usage limit</p>
            <p className="text-xs text-amber-700 dark:text-amber-400">Upgrade your plan to unlock more projects, audits, and AI queries.</p>
          </div>
          <Button size="sm" variant="brand" onClick={() => {
            const nextPlan = PLAN_ORDER[PLAN_ORDER.indexOf(currentPlanKey) + 1]
            if (nextPlan) checkout.mutate(nextPlan)
          }} disabled={checkout.isPending}>
            {checkout.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            Upgrade Now
          </Button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ------------------------------------------------------------------ */}
        {/* Left column: Current plan + usage meters */}
        {/* ------------------------------------------------------------------ */}
        <div className="lg:col-span-1 space-y-4">
          {/* Active subscription card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-brand" />
                  Active Plan
                </CardTitle>
                {isLoading
                  ? <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
                  : planBadge(currentPlanKey)
                }
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-4 bg-muted animate-pulse rounded" />)}
                </div>
              ) : usage ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    {statusBadge(usage.status, usage.cancelAtPeriodEnd)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-semibold font-mono-nums">
                      {usage.plan.price === 0 ? "Free" : `$${usage.plan.price}/mo`}
                    </span>
                  </div>
                  {usage.periodEnd && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {usage.cancelAtPeriodEnd ? "Cancels" : "Renews"}
                      </span>
                      <span className="font-medium text-xs">
                        {new Date(usage.periodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-border space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {usage.canWhiteLabel ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5" />}
                      White-label reports
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {usage.hasApiAccess ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5" />}
                      API access
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {usage.canGenerateReports ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5" />}
                      Report generation
                    </div>
                  </div>
                </>
              ) : null}
            </CardContent>
            <CardFooter className="flex flex-col gap-2 pt-0">
              {isPaid && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => portal.mutate()}
                  disabled={portal.isPending}
                >
                  {portal.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                  Manage Billing
                </Button>
              )}
              {isPaid && !usage?.cancelAtPeriodEnd && (
                <>
                  {!showCancelConfirm ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-muted-foreground hover:text-destructive text-xs"
                      onClick={() => setShowCancelConfirm(true)}
                    >
                      Cancel subscription
                    </Button>
                  ) : (
                    <div className="w-full p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-center space-y-2">
                      <p className="text-xs text-muted-foreground">You'll keep access until the period ends.</p>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={() => setShowCancelConfirm(false)}>
                          Keep plan
                        </Button>
                        <Button variant="destructive" size="sm" className="flex-1 text-xs" onClick={() => { cancel.mutate(); setShowCancelConfirm(false) }} disabled={cancel.isPending}>
                          {cancel.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Ban className="h-3 w-3" />}
                          Confirm
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
              {usage?.cancelAtPeriodEnd && (
                <p className="text-xs text-center text-muted-foreground">
                  Subscription will cancel at period end. Reactivate by upgrading again.
                </p>
              )}
            </CardFooter>
          </Card>

          {/* Usage meters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-brand" />
                Monthly Usage
              </CardTitle>
              <p className="text-xs text-muted-foreground">Resets on the 1st of each month</p>
            </CardHeader>
            <CardContent className="space-y-5">
              {isLoading ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-muted animate-pulse rounded" />
                      <div className="h-1.5 bg-muted animate-pulse rounded-full" />
                    </div>
                  ))}
                </div>
              ) : usage ? (
                <>
                  <UsageMeter
                    label="Projects"
                    icon={Globe}
                    used={usage.projectsUsed}
                    limit={usage.projectsLimit}
                    remaining={usage.projectsRemaining}
                  />
                  <UsageMeter
                    label="SEO Audits"
                    icon={ShieldCheck}
                    used={usage.auditsUsed}
                    limit={usage.auditsLimit}
                    remaining={usage.auditsRemaining}
                  />
                  <UsageMeter
                    label="AI Queries"
                    icon={Brain}
                    used={usage.aiQueriesUsed}
                    limit={usage.aiQueriesLimit}
                    remaining={usage.aiQueriesRemaining}
                  />
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Right column: Plan comparison & upgrade */}
        {/* ------------------------------------------------------------------ */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold mb-4">Available Plans</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {PLAN_ORDER.map((planKey) => {
              const plan = PLANS[planKey]
              const isCurrent = planKey === currentPlanKey
              const isHigher = PLAN_ORDER.indexOf(planKey) > PLAN_ORDER.indexOf(currentPlanKey)
              const isLower = PLAN_ORDER.indexOf(planKey) < PLAN_ORDER.indexOf(currentPlanKey)

              return (
                <div
                  key={planKey}
                  className={`relative p-5 rounded-xl border flex flex-col transition-all ${
                    isCurrent
                      ? "border-brand bg-brand-muted/30 shadow-sm shadow-brand/10"
                      : "border-border bg-card hover:border-brand/30"
                  }`}
                >
                  {plan.badge && !isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-brand-foreground px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                      {plan.badge}
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Current Plan
                    </div>
                  )}

                  <div className="mb-3">
                    <div className="flex items-baseline gap-1 mb-0.5">
                      <span className="text-2xl font-extrabold font-mono-nums">${plan.price}</span>
                      <span className="text-xs text-muted-foreground">/mo</span>
                    </div>
                    <p className="font-semibold text-sm">{plan.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{plan.description}</p>
                  </div>

                  <ul className="space-y-1.5 mb-4 flex-1">
                    {plan.features.slice(0, 5).map((f) => (
                      <li key={f} className="flex items-start gap-1.5 text-xs text-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                    {plan.features.length > 5 && (
                      <li className="text-xs text-muted-foreground pl-5">
                        +{plan.features.length - 5} more features
                      </li>
                    )}
                  </ul>

                  {isCurrent ? (
                    <Button size="sm" variant="outline" disabled className="w-full text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Current Plan
                    </Button>
                  ) : isHigher ? (
                    <Button
                      size="sm"
                      variant="brand"
                      className="w-full text-xs"
                      onClick={() => checkout.mutate(planKey)}
                      disabled={checkout.isPending}
                    >
                      {checkout.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <TrendingUp className="h-3.5 w-3.5" />}
                      Upgrade to {plan.name}
                    </Button>
                  ) : planKey === "FREE" ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full text-xs text-muted-foreground"
                      onClick={() => setShowCancelConfirm(true)}
                    >
                      Downgrade to Free
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs"
                      onClick={() => checkout.mutate(planKey)}
                      disabled={checkout.isPending}
                    >
                      {checkout.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
                      Switch to {plan.name}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Feature comparison table */}
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Plan Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 font-semibold text-muted-foreground">Feature</th>
                      {PLAN_ORDER.map((pk) => (
                        <th key={pk} className={`text-center py-2 px-2 font-semibold ${pk === currentPlanKey ? "text-brand" : "text-muted-foreground"}`}>
                          {PLANS[pk].name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { label: "Projects", key: "projects" as const, format: (n: number) => n >= 999 ? "Unlimited" : n.toString() },
                      { label: "SEO Audits / mo", key: "auditsPerMonth" as const, format: (n: number) => n >= 999 ? "Unlimited" : n.toString() },
                      { label: "AI Queries / mo", key: "aiQueriesPerMonth" as const, format: (n: number) => n >= 9999 ? "Unlimited" : n.toLocaleString() },
                      { label: "Team Seats", key: "teamSeats" as const, format: (n: number) => n >= 999 ? "Unlimited" : n === 0 ? "Owner only" : n.toString() },
                      { label: "Competitors", key: "competitors" as const, format: (n: number) => n >= 999 ? "Unlimited" : n.toString() },
                    ].map(({ label, key, format }) => (
                      <tr key={key}>
                        <td className="py-2.5 pr-4 text-muted-foreground">{label}</td>
                        {PLAN_ORDER.map((pk) => (
                          <td key={pk} className={`text-center py-2.5 px-2 font-mono-nums ${pk === currentPlanKey ? "font-semibold text-foreground" : ""}`}>
                            {format(PLANS[pk].limits[key] as number)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {[
                      { label: "White-label Reports", key: "whiteLabel" as const },
                      { label: "API Access", key: "apiAccess" as const },
                      { label: "Priority Support", key: "prioritySupport" as const },
                    ].map(({ label, key }) => (
                      <tr key={key}>
                        <td className="py-2.5 pr-4 text-muted-foreground">{label}</td>
                        {PLAN_ORDER.map((pk) => (
                          <td key={pk} className="text-center py-2.5 px-2">
                            {PLANS[pk].limits[key]
                              ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                              : <XCircle className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}