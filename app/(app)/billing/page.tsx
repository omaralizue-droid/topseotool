"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  CreditCard, Zap, BarChart3, Globe, Brain, AlertTriangle,
  CheckCircle2, XCircle, ArrowRight, Loader2, ExternalLink,
  ShieldCheck, TrendingUp, Clock, Ban, Search, Target, Link2,
  FileText, KeyRound, Tag, Download, RefreshCw, Sparkles, Check
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { PLANS, PLAN_ORDER, type PlanKey } from "@/types"
import type { MetricUsageItem } from "@/lib/billing/entitlements"
import type { BillingCadence, BillingInvoice, CouponValidation } from "@/lib/billing/types"

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
    limits: Record<string, any>
  }
  metricsList?: MetricUsageItem[]
  hasAnyWarning?: boolean
  hasAnyExceeded?: boolean
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

function usagePct(used: number, limit: number) {
  if (limit === 0) return 0
  return Math.min(100, Math.round((used / limit) * 100))
}

function statusBadge(status: string, cancelAtPeriodEnd: boolean) {
  if (cancelAtPeriodEnd) return <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10">Cancelling</Badge>
  if (status === "ACTIVE") return <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10">Active</Badge>
  if (status === "TRIALING") return <Badge variant="outline" className="text-purple-500 border-purple-500/30 bg-purple-500/10">Trial Active</Badge>
  if (status === "PAST_DUE") return <Badge variant="destructive">Payment Failed</Badge>
  if (status === "CANCELED") return <Badge variant="secondary">Cancelled</Badge>
  return <Badge variant="outline">{status}</Badge>
}

function planBadge(planKey: PlanKey) {
  if (planKey === "FREE") return <Badge variant="secondary">Free</Badge>
  if (planKey === "STARTER") return <Badge variant="outline" className="border-sky-500/40 text-sky-500">Starter</Badge>
  if (planKey === "PROFESSIONAL" || planKey === "PRO") return <Badge variant="brand">Professional</Badge>
  if (planKey === "AGENCY") return <Badge className="bg-violet-500 text-white">Agency</Badge>
  return <Badge className="bg-amber-500 text-white">Enterprise</Badge>
}

// ---------------------------------------------------------------------------
// Usage Meter Component
// ---------------------------------------------------------------------------
function UsageMeter({
  label, icon: Icon, used, limit, remaining,
}: {
  label: string
  icon: React.ElementType
  used: number
  limit: number
  remaining: number
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
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-medium text-foreground">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          {label}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">
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
        <p className="text-[10px] text-amber-500 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {remaining.toLocaleString()} remaining this billing cycle
        </p>
      )}
      {isOver && (
        <p className="text-[10px] text-red-500 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Quota reached — upgrade to unlock more capacity
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Billing Page
// ---------------------------------------------------------------------------
export default function BillingPage() {
  const queryClient = useQueryClient()
  const [cadence, setCadence] = useState<BillingCadence>("MONTHLY")
  const [couponInput, setCouponInput] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  // Fetch Usage & Subscription
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

  // Fetch Invoices
  const { data: invoices, isLoading: invoicesLoading } = useQuery<BillingInvoice[]>({
    queryKey: ["billing-invoices"],
    queryFn: async () => {
      const res = await fetch("/api/billing/invoices")
      const data = await res.json()
      if (!res.ok) return []
      return data.data ?? []
    },
  })

  // Checkout Mutation
  const checkoutMutation = useMutation({
    mutationFn: async ({ planKey, trialDays }: { planKey: PlanKey; trialDays?: number }) => {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planKey,
          cadence,
          trialDays,
          couponCode: appliedCoupon?.valid ? appliedCoupon.code : undefined,
        }),
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

  // Change Plan Mutation (Immediate Upgrade / Downgrade with Proration)
  const changePlanMutation = useMutation({
    mutationFn: async (newPlanKey: PlanKey) => {
      const res = await fetch("/api/billing/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPlanKey, cadence }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Plan change failed")
      return data.data
    },
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ["billing-usage"] })
      queryClient.invalidateQueries({ queryKey: ["billing-invoices"] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  // Resume Subscription Mutation
  const resumeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/billing/resume", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to resume subscription")
      return data.data
    },
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ["billing-usage"] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  // Cancel Mutation
  const cancelMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/billing/cancel", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Cancel failed")
      return data.data as { message: string }
    },
    onSuccess: (data) => {
      toast.success(data.message)
      setShowCancelConfirm(false)
      queryClient.invalidateQueries({ queryKey: ["billing-usage"] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  // Customer Portal Mutation
  const portalMutation = useMutation({
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

  // Validate Coupon
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponInput.trim()) return
    setValidatingCoupon(true)
    try {
      const res = await fetch(`/api/billing/coupon?code=${encodeURIComponent(couponInput)}&cadence=${cadence}`)
      const data = await res.json()
      if (data.ok && data.data.valid) {
        setAppliedCoupon(data.data)
        toast.success(`Coupon applied: ${data.data.description}`)
      } else {
        setAppliedCoupon(null)
        toast.error(data.data?.description || "Invalid coupon code")
      }
    } catch {
      toast.error("Failed to validate coupon code")
    } finally {
      setValidatingCoupon(false)
    }
  }

  const currentPlanKey = usage?.planKey ?? "FREE"
  const isPaid = currentPlanKey !== "FREE"
  const isPastDue = usage?.status === "PAST_DUE"
  const isCancelling = usage?.cancelAtPeriodEnd ?? false

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-fade-in text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1 flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-brand" /> Billing &amp; Subscriptions
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your subscription tier, billing cadence, payment methods, trials, and invoices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isPaid && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => portalMutation.mutate()}
              disabled={portalMutation.isPending}
              className="text-xs h-9 gap-1.5"
            >
              {portalMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
              Stripe Customer Portal
            </Button>
          )}
          <Button variant="outline" size="sm" asChild className="text-xs h-9">
            <Link href="/pricing">
              View Plans <ExternalLink className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </div>

      {/* FAILED PAYMENT / PAST DUE ALERT BANNER */}
      {isPastDue && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-500">Payment Failed: Action Required</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your last recurring renewal payment failed. You are currently in a grace period. Please update your card to avoid crawler and API suspension.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => portalMutation.mutate()}
            disabled={portalMutation.isPending}
            className="text-xs font-bold shrink-0"
          >
            Update Payment Method
          </Button>
        </div>
      )}

      {/* SUBSCRIPTION CANCELLING ALERT BANNER */}
      {isCancelling && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-500">Subscription Scheduled for Cancellation</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your plan will remain active until the end of the billing period on{" "}
                <strong>{usage?.periodEnd ? new Date(usage.periodEnd).toLocaleDateString() : "the end of cycle"}</strong>.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => resumeMutation.mutate()}
            disabled={resumeMutation.isPending}
            className="text-xs font-bold border-amber-500/40 text-amber-500 hover:bg-amber-500/10 shrink-0 gap-1.5"
          >
            {resumeMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Resume Subscription
          </Button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column: Active plan & Usage meters */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-border/60 bg-card/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-brand" />
                  Active Subscription
                </CardTitle>
                {isLoading
                  ? <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
                  : planBadge(currentPlanKey)
                }
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <div key={i} className="h-4 bg-muted animate-pulse rounded" />)}
                </div>
              ) : usage ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Account Status</span>
                    {statusBadge(usage.status, usage.cancelAtPeriodEnd)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rate</span>
                    <span className="font-bold text-foreground">
                      {usage.plan.price === 0 ? "Free ($0)" : `$${usage.plan.price} / month`}
                    </span>
                  </div>
                  {usage.periodEnd && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {usage.cancelAtPeriodEnd ? "Cancels On" : "Next Renewal"}
                      </span>
                      <span className="font-semibold text-foreground">
                        {new Date(usage.periodEnd).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-border/40 space-y-2">
                    <span className="font-semibold text-foreground block">Plan Entitlements</span>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>White-label Branding</span>
                      <Badge variant="outline" className={usage.canWhiteLabel ? "text-emerald-500 border-emerald-500/30" : "text-muted-foreground"}>
                        {usage.canWhiteLabel ? "Included" : "Agency/Enterprise"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Developer REST API</span>
                      <Badge variant="outline" className={usage.hasApiAccess ? "text-emerald-500 border-emerald-500/30" : "text-muted-foreground"}>
                        {usage.hasApiAccess ? "Enabled (v1)" : "Locked"}
                      </Badge>
                    </div>
                  </div>
                </>
              ) : null}
            </CardContent>
            {isPaid && !isCancelling && (
              <CardFooter className="pt-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full text-xs text-muted-foreground hover:text-destructive"
                >
                  Cancel Subscription
                </Button>
              </CardFooter>
            )}
          </Card>

          {/* Usage Meters */}
          <Card className="border-border/60 bg-card/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-brand" /> Resource Quotas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {usage && (
                <>
                  <UsageMeter
                    label="Active Projects"
                    icon={Globe}
                    used={usage.projectsUsed}
                    limit={usage.projectsLimit}
                    remaining={usage.projectsRemaining}
                  />
                  <UsageMeter
                    label="SEO Crawls & Audits"
                    icon={ShieldCheck}
                    used={usage.auditsUsed}
                    limit={usage.auditsLimit}
                    remaining={usage.auditsRemaining}
                  />
                  <UsageMeter
                    label="AI Search Scans"
                    icon={Brain}
                    used={usage.aiQueriesUsed}
                    limit={usage.aiQueriesLimit}
                    remaining={usage.aiQueriesRemaining}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Promo / Coupon Input */}
          <Card className="border-border/60 bg-card/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Tag className="h-4 w-4 text-brand" /> Have a Coupon or Promo Code?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. GROWTH20, LAUNCH100"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="text-xs h-8 font-mono"
                  />
                  <Button
                    size="sm"
                    type="submit"
                    disabled={validatingCoupon || !couponInput.trim()}
                    className="text-xs h-8 bg-brand hover:bg-brand/90"
                  >
                    {validatingCoupon ? <Loader2 className="h-3 w-3 animate-spin" /> : "Apply"}
                  </Button>
                </div>
                {appliedCoupon && (
                  <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[11px] font-semibold flex items-center justify-between">
                    <span>{appliedCoupon.code}: {appliedCoupon.description}</span>
                    <button
                      type="button"
                      onClick={() => setAppliedCoupon(null)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Plans with Monthly / Annual Billing Toggle */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold">Select a Subscription Plan</h2>
              <p className="text-xs text-muted-foreground">Upgrades take effect immediately with Stripe proration.</p>
            </div>

            {/* Monthly / Annual Billing Toggle */}
            <div className="inline-flex items-center p-1 rounded-xl bg-muted/40 border border-border/40">
              <button
                type="button"
                onClick={() => setCadence("MONTHLY")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  cadence === "MONTHLY"
                    ? "bg-brand text-brand-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setCadence("ANNUAL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  cadence === "ANNUAL"
                    ? "bg-brand text-brand-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>Annual Billing</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Plan Cards Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {PLAN_ORDER.map((planKey) => {
              const plan = PLANS[planKey]
              const isCurrent = planKey === currentPlanKey
              const isHigher = PLAN_ORDER.indexOf(planKey) > PLAN_ORDER.indexOf(currentPlanKey)
              const priceToDisplay = cadence === "ANNUAL" ? plan.yearlyPrice : plan.price
              const hasTrial = (planKey === "PROFESSIONAL" || planKey === "AGENCY") && !isPaid

              return (
                <div
                  key={planKey}
                  className={`relative p-5 rounded-xl border flex flex-col transition-all ${
                    isCurrent
                      ? "border-brand bg-brand-muted/20 shadow-sm shadow-brand/10"
                      : "border-border/60 bg-card/60 hover:border-brand/30"
                  }`}
                >
                  {plan.badge && !isCurrent && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-brand text-brand-foreground px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                      {plan.badge}
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Current Plan
                    </div>
                  )}

                  <div className="mb-3">
                    <div className="flex items-baseline gap-1 mb-0.5">
                      <span className="text-2xl font-extrabold font-mono">${priceToDisplay}</span>
                      <span className="text-xs text-muted-foreground">/mo</span>
                      {cadence === "ANNUAL" && plan.price > 0 && (
                        <span className="text-[11px] text-muted-foreground line-through ml-1.5 font-mono">
                          ${plan.price}
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-sm text-foreground">{plan.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
                    {hasTrial && (
                      <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
                        <Sparkles className="h-3 w-3" /> 14-Day Free Trial
                      </div>
                    )}
                  </div>

                  <ul className="space-y-1.5 mb-5 flex-1 border-t border-border/30 pt-3">
                    {plan.features.slice(0, 5).map((f) => (
                      <li key={f} className="flex items-start gap-1.5 text-xs text-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Button size="sm" variant="outline" disabled className="w-full text-xs h-9">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Active Plan
                    </Button>
                  ) : isPaid && isHigher ? (
                    <Button
                      size="sm"
                      variant="brand"
                      onClick={() => changePlanMutation.mutate(planKey)}
                      disabled={changePlanMutation.isPending}
                      className="w-full text-xs h-9 font-bold bg-brand hover:bg-brand/90 text-brand-foreground"
                    >
                      {changePlanMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <TrendingUp className="h-3.5 w-3.5" />}
                      Upgrade to {plan.name} (Instant Proration)
                    </Button>
                  ) : isPaid && !isHigher && planKey !== "FREE" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => changePlanMutation.mutate(planKey)}
                      disabled={changePlanMutation.isPending}
                      className="w-full text-xs h-9"
                    >
                      Switch to {plan.name}
                    </Button>
                  ) : hasTrial ? (
                    <Button
                      size="sm"
                      variant="brand"
                      onClick={() => checkoutMutation.mutate({ planKey, trialDays: 14 })}
                      disabled={checkoutMutation.isPending}
                      className="w-full text-xs h-9 font-bold bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {checkoutMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                      Start 14-Day Free Trial
                    </Button>
                  ) : planKey === "FREE" ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowCancelConfirm(true)}
                      className="w-full text-xs h-9 text-muted-foreground"
                    >
                      Downgrade to Free
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="brand"
                      onClick={() => checkoutMutation.mutate({ planKey })}
                      disabled={checkoutMutation.isPending}
                      className="w-full text-xs h-9 font-bold bg-brand hover:bg-brand/90 text-brand-foreground"
                    >
                      {checkoutMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
                      Subscribe to {plan.name}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>

          {/* INVOICES & BILLING HISTORY */}
          <Card className="border-border/60 bg-card/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-brand" /> Invoices &amp; Billing History
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Download official PDF receipts and tax invoices generated by Stripe.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  {invoices?.length ?? 0} Invoices
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? (
                <div className="p-4 text-center text-xs text-muted-foreground">Loading invoice history...</div>
              ) : invoices && invoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/40 text-muted-foreground bg-muted/20">
                        <th className="p-2.5 font-semibold">Date</th>
                        <th className="p-2.5 font-semibold">Invoice ID</th>
                        <th className="p-2.5 font-semibold">Plan Description</th>
                        <th className="p-2.5 font-semibold">Amount</th>
                        <th className="p-2.5 font-semibold">Status</th>
                        <th className="p-2.5 font-semibold text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-2.5 whitespace-nowrap font-medium text-foreground">{inv.date}</td>
                          <td className="p-2.5 font-mono text-[11px] text-muted-foreground">{inv.number}</td>
                          <td className="p-2.5 text-foreground">{inv.planName}</td>
                          <td className="p-2.5 font-bold font-mono text-emerald-400">${inv.amountUsd.toFixed(2)}</td>
                          <td className="p-2.5">
                            <Badge
                              variant="outline"
                              className={inv.status === "paid" ? "text-emerald-500 border-emerald-500/30" : "text-amber-500 border-amber-500/30"}
                            >
                              {inv.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-2.5 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              asChild
                              className="text-[11px] h-7 px-2 gap-1 text-brand hover:text-brand"
                            >
                              <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="h-3 w-3" /> PDF
                              </a>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No invoices found. Invoices will appear here automatically upon subscription billing.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="max-w-md w-full border-border bg-card p-6 space-y-4">
            <h3 className="text-base font-bold text-foreground">Cancel Subscription?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your subscription will remain active until the end of your current billing period. After that, your account will downgrade to Free, and higher quotas will be disabled.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCancelConfirm(false)}
                className="text-xs"
              >
                Keep Subscription
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="text-xs"
              >
                {cancelMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirm Cancellation"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}