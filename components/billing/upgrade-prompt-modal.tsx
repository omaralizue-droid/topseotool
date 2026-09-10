"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Building2,
  ExternalLink,
} from "lucide-react"
import { PLANS, PLAN_ORDER, type PlanKey } from "@/types"

interface UpgradePromptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  metricName?: string
  currentUsage?: number
  currentLimit?: number
  currentPlanKey?: PlanKey | string
}

export function UpgradePromptModal({
  open,
  onOpenChange,
  metricName,
  currentUsage,
  currentLimit,
  currentPlanKey = "FREE",
}: UpgradePromptModalProps) {
  const router = useRouter()

  const safePlanKey = (PLAN_ORDER.includes(currentPlanKey as PlanKey)
    ? currentPlanKey
    : "FREE") as PlanKey

  const currentIndex = PLAN_ORDER.indexOf(safePlanKey)
  const nextPlanKey: PlanKey =
    currentIndex < PLAN_ORDER.length - 1
      ? PLAN_ORDER[currentIndex + 1]
      : "ENTERPRISE"

  const currentPlan = PLANS[safePlanKey]
  const targetPlan = PLANS[nextPlanKey]
  const isTargetEnterprise = nextPlanKey === "ENTERPRISE"

  const handleUpgradeClick = () => {
    onOpenChange(false)
    router.push("/billing")
  }

  const handleContactSales = () => {
    onOpenChange(false)
    router.push("/pricing#enterprise")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden border-border bg-card">
        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-r from-brand/15 via-brand/10 to-amber-500/10 p-6 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              Quota Alert
            </Badge>
            <span className="text-xs text-muted-foreground">Monthly Quota Reached or Approaching</span>
          </div>

          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {metricName ? `Increase ${metricName} Quota` : "Scale Your Workspace Limits"}
          </DialogTitle>

          <DialogDescription className="text-sm text-muted-foreground mt-1.5">
            {metricName && currentLimit ? (
              <span>
                You have consumed{" "}
                <strong className="text-foreground font-mono-nums">
                  {currentUsage?.toLocaleString()} / {currentLimit?.toLocaleString()}
                </strong>{" "}
                of your {metricName.toLowerCase()} allowance on the {currentPlan.name} plan.
              </span>
            ) : (
              <span>
                Your team has hit resource capacity on the {currentPlan.name} plan. Upgrade to maintain uninterrupted SEO intelligence.
              </span>
            )}
          </DialogDescription>
        </div>

        {/* Comparison Body */}
        <div className="p-6 space-y-5">
          {/* Target Plan Card */}
          <div className="p-4 rounded-xl border border-brand/30 bg-brand/[0.03] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand">Recommended Tier</span>
                  {targetPlan.badge && (
                    <Badge className="bg-brand text-brand-foreground text-[10px] px-2 py-0">
                      {targetPlan.badge}
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg font-bold text-foreground mt-0.5">{targetPlan.name} Plan</h3>
                <p className="text-xs text-muted-foreground">{targetPlan.description}</p>
              </div>
              <div className="text-right">
                {isTargetEnterprise ? (
                  <div className="text-xl font-bold text-foreground">Custom</div>
                ) : (
                  <div>
                    <span className="text-2xl font-extrabold text-foreground font-mono-nums">
                      ${targetPlan.price}
                    </span>
                    <span className="text-xs text-muted-foreground">/mo</span>
                  </div>
                )}
                <span className="text-[11px] text-muted-foreground block">billed monthly or yearly</span>
              </div>
            </div>

            {/* Quota Highlights */}
            <div className="pt-3 border-t border-border/60 grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>
                  <strong>{(targetPlan.limits.monthly_keyword_limit ?? targetPlan.limits.keywordSearchesPerMonth).toLocaleString()}</strong> Keyword searches
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>
                  <strong>{(targetPlan.limits.monthly_crawl_limit ?? 10000).toLocaleString()}</strong> URLs crawled
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>
                  <strong>{(targetPlan.limits.monthly_rank_tracking_limit ?? targetPlan.limits.trackedKeywords).toLocaleString()}</strong> Tracked rank keywords
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>
                  <strong>{(targetPlan.limits.monthly_ai_limit ?? targetPlan.limits.aiQueriesPerMonth).toLocaleString()}</strong> AI search credits
                </span>
              </div>
            </div>
          </div>

          {/* Key Advantages */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Also included with {targetPlan.name}:
            </span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
              {targetPlan.features.slice(0, 4).map((f, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-brand shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-4 bg-muted/40 border-t border-border flex flex-col-reverse sm:flex-row items-center justify-between gap-3 sm:space-x-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto text-xs"
          >
            Stay on {currentPlan.name}
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isTargetEnterprise ? (
              <Button
                variant="brand"
                size="sm"
                className="w-full sm:w-auto text-xs font-medium gap-1.5"
                onClick={handleContactSales}
              >
                <Building2 className="h-4 w-4" />
                Contact Enterprise Sales
              </Button>
            ) : (
              <Button
                variant="brand"
                size="sm"
                className="w-full sm:w-auto text-xs font-medium gap-1.5"
                onClick={handleUpgradeClick}
              >
                <Zap className="h-4 w-4" />
                Upgrade to {targetPlan.name}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
