"use client"

import * as React from "react"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  Globe,
  ShieldCheck,
  TrendingUp,
  Target,
  Link2,
  Sparkles,
  FileText,
  KeyRound,
  AlertTriangle,
  Zap,
  ArrowUpRight,
  BarChart3,
  Loader2,
  CheckCircle2,
} from "lucide-react"
import { UpgradePromptModal } from "@/components/billing/upgrade-prompt-modal"
import type { UsageSummary, MetricUsageItem } from "@/lib/billing/entitlements"
import { PlanKey } from "@/types"

interface UsageMetricsCardProps {
  initialData?: UsageSummary
  compact?: boolean
  className?: string
}

export function UsageMetricsCard({
  initialData,
  compact = false,
  className = "",
}: UsageMetricsCardProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<MetricUsageItem | null>(null)

  const { data: usage, isLoading } = useQuery<UsageSummary>({
    queryKey: ["workspace-usage-metrics"],
    queryFn: async () => {
      const res = await fetch("/api/billing/usage")
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to load usage")
      return json.data
    },
    initialData,
    staleTime: 60_000,
  })

  const planKey = (usage?.planKey ?? "STARTER") as PlanKey
  const metrics = usage?.metricsList ?? []

  const handleOpenUpgrade = (metric?: MetricUsageItem) => {
    setSelectedMetric(metric ?? null)
    setModalOpen(true)
  }

  // Icons map for the 9 metrics
  const metricIcons: Record<string, React.ElementType> = {
    keyword_searches: Search,
    urls_crawled: Globe,
    pages_audited: ShieldCheck,
    rank_keywords: TrendingUp,
    competitor_domains: Target,
    backlink_lookups: Link2,
    ai_requests: Sparkles,
    reports_generated: FileText,
    api_requests: KeyRound,
  }

  // Filter items if compact: show highest utilization first or top 4
  const displayMetrics = compact
    ? [...metrics].sort((a, b) => b.pct - a.pct).slice(0, 4)
    : metrics

  const hasExceeded = metrics.some((m) => m.isExceeded)
  const hasWarning = metrics.some((m) => m.isWarning)

  return (
    <>
      <Card className={`overflow-hidden border-border bg-card/60 backdrop-blur-sm shadow-sm ${className}`}>
        {/* Header */}
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                  <BarChart3 className="h-4 w-4 text-brand" />
                  Workspace Usage &amp; Quotas
                </CardTitle>
                <Badge variant="outline" className="text-xs font-semibold px-2 py-0">
                  {usage?.plan?.name ?? planKey} Plan
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Monthly allowances reset on the 1st of each billing cycle
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-medium"
                onClick={() => handleOpenUpgrade()}
              >
                <Zap className="h-3.5 w-3.5 text-brand mr-1" />
                Upgrade Quotas
              </Button>
            </div>
          </div>

          {/* Alert Banner if any limit reached or approaching */}
          {(hasExceeded || hasWarning) && (
            <div
              className={`mt-3 p-3 rounded-lg flex items-center justify-between gap-3 text-xs ${
                hasExceeded
                  ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  {hasExceeded
                    ? "One or more quotas have reached 100% capacity. Unlock higher limits to resume full scans."
                    : "Some usage metrics are at or above 80% capacity for this cycle."}
                </span>
              </div>
              <Button
                variant="brand"
                size="sm"
                className="h-7 px-2.5 text-xs font-semibold shrink-0"
                onClick={() => handleOpenUpgrade(metrics.find((m) => m.isExceeded || m.isWarning))}
              >
                Upgrade Now
              </Button>
            </div>
          )}
        </CardHeader>

        {/* Content: 9 Metric Meters Grid */}
        <CardContent className="p-4 sm:p-6">
          {isLoading && !usage ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading usage metrics...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayMetrics.map((item) => {
                const Icon = metricIcons[item.key] || BarChart3
                const isOver = item.isExceeded
                const isNear = item.isWarning && !isOver

                // Determine bar color
                const progressColor = isOver
                  ? "bg-red-500"
                  : isNear
                  ? "bg-amber-500"
                  : "bg-brand"

                return (
                  <div
                    key={item.key}
                    className={`p-3.5 rounded-xl border transition-all duration-150 relative flex flex-col justify-between ${
                      isOver
                        ? "border-red-500/40 bg-red-500/[0.02]"
                        : isNear
                        ? "border-amber-500/40 bg-amber-500/[0.02]"
                        : "border-border/60 bg-muted/20 hover:border-border"
                    }`}
                  >
                    <div>
                      {/* Meter Top Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-md ${
                              isOver
                                ? "bg-red-500/10 text-red-500"
                                : isNear
                                ? "bg-amber-500/10 text-amber-500"
                                : "bg-brand/10 text-brand"
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-xs font-semibold text-foreground">
                            {item.label}
                          </span>
                        </div>

                        <Badge
                          variant="outline"
                          className={`text-[10px] font-mono font-medium px-1.5 py-0 ${
                            isOver
                              ? "border-red-500/40 text-red-500 bg-red-500/10"
                              : isNear
                              ? "border-amber-500/40 text-amber-500 bg-amber-500/10"
                              : "border-border text-muted-foreground"
                          }`}
                        >
                          {item.pct}%
                        </Badge>
                      </div>

                      {/* Usage Count Display (e.g. 7,842 / 10,000) */}
                      <div className="flex items-baseline justify-between mb-2 text-xs">
                        <span className="text-muted-foreground text-[11px]">Consumed</span>
                        <div className="font-mono-nums text-xs">
                          <strong className="text-foreground text-sm font-bold">
                            {item.used.toLocaleString()}
                          </strong>
                          <span className="text-muted-foreground">
                            {" / "}
                            {item.limit >= 999999 ? "Unlimited" : item.limit.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${progressColor}`}
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Meter Footer CTA when nearing or over limit */}
                    <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">
                        {item.limit >= 999999
                          ? "Unlimited"
                          : `${item.remaining.toLocaleString()} left`}
                      </span>

                      {(isNear || isOver) && (
                        <button
                          type="button"
                          onClick={() => handleOpenUpgrade(item)}
                          className={`font-semibold hover:underline flex items-center gap-0.5 ${
                            isOver ? "text-red-500" : "text-amber-500"
                          }`}
                        >
                          Scale limit
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <CardFooter className="px-6 py-3 border-t border-border/40 bg-muted/10 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Strict tenant isolation &amp; quota enforcement active</span>
          </div>

          <Button variant="ghost" size="sm" asChild className="h-7 text-xs gap-1">
            <Link href="/billing">
              Manage billing &amp; invoices
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Upgrade Prompt Modal */}
      <UpgradePromptModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        metricName={selectedMetric?.label}
        currentUsage={selectedMetric?.used}
        currentLimit={selectedMetric?.limit}
        currentPlanKey={planKey}
      />
    </>
  )
}
