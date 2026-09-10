"use client"

import * as React from "react"
import { useState } from "react"
import { Lock, Zap, ArrowRight, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEntitlements } from "@/hooks/use-entitlements"
import { UpgradePromptModal } from "@/components/billing/upgrade-prompt-modal"
import type { FeatureKey } from "@/types"

interface FeatureGateProps {
  feature: FeatureKey
  title?: string
  description?: string
  children: React.ReactNode
  fallback?: React.ReactNode
  blurPreview?: boolean
}

const FEATURE_NAMES: Record<FeatureKey, { title: string; minPlan: string; desc: string }> = {
  keyword_research: {
    title: "Keyword Intelligence & Explorer",
    minPlan: "Starter",
    desc: "Search volume, intent, and keyword difficulty analysis across global markets.",
  },
  competitor_analysis: {
    title: "Competitor Intelligence & SERP Radar",
    minPlan: "Starter",
    desc: "Direct head-to-head domain gap analysis and keyword overlap tracking.",
  },
  rank_tracking: {
    title: "Daily Rank Tracking & SERP Radar",
    minPlan: "Starter",
    desc: "Daily position tracking on Google and leading AI search engines.",
  },
  backlink_analysis: {
    title: "Backlink Profile & Toxic Link Audit",
    minPlan: "Professional",
    desc: "Domain rating, referring domains, toxic anchors, and link acquisition velocity.",
  },
  content_optimizer: {
    title: "On-Page Content Optimizer & NLP Editor",
    minPlan: "Starter",
    desc: "Real-time content scoring, readability, NLP entity terms, and keyword density.",
  },
  ai_search_visibility: {
    title: "AI Search Visibility (ChatGPT & Claude)",
    minPlan: "Professional",
    desc: "Track brand citations, sentiment, and visibility across leading generative LLMs.",
  },
  ai_perception: {
    title: "AI Brand Perception Simulator",
    minPlan: "Professional",
    desc: "Simulate how major AI models perceive and summarize your company brand.",
  },
  api_access: {
    title: "Enterprise REST API & Webhooks",
    minPlan: "Enterprise",
    desc: "Full programmatic access to crawl data, audits, and rank tracking endpoints.",
  },
  white_label: {
    title: "White-Label Client PDF Reports",
    minPlan: "Agency",
    desc: "Deliver custom-branded reports under your agency logo with client share links.",
  },
  custom_reports: {
    title: "Custom Automated Reports",
    minPlan: "Agency",
    desc: "Automate delivery of scheduled executive SEO summaries to stakeholders.",
  },
  advanced_permissions: {
    title: "Advanced RBAC Roles & Permissions",
    minPlan: "Enterprise",
    desc: "Fine-grained workspace access controls across Owner, Admin, Manager, and Member.",
  },
  multiple_teams: {
    title: "Multiple Workspaces & Teams",
    minPlan: "Enterprise",
    desc: "Organize unlimited client organizations and teams under a unified account.",
  },
  dedicated_infrastructure: {
    title: "Dedicated Infrastructure & Proxies",
    minPlan: "Enterprise",
    desc: "Custom crawling IP pools, high-throughput workers, and custom SLA agreements.",
  },
  priority_support: {
    title: "24/7 Priority Support",
    minPlan: "Agency",
    desc: "Dedicated SLA with response times under 2 hours and dedicated account manager.",
  },
}

export function FeatureGate({
  feature,
  title,
  description,
  children,
  fallback,
  blurPreview = false,
}: FeatureGateProps) {
  const { canUseFeature, planKey, isLoading } = useEntitlements()
  const [modalOpen, setModalOpen] = useState(false)

  const isAllowed = canUseFeature(feature)
  const meta = FEATURE_NAMES[feature] ?? {
    title: title ?? "Premium Feature",
    minPlan: "Higher Tier",
    desc: description ?? "Upgrade your workspace subscription to unlock this feature.",
  }

  // During loading or if allowed, render children
  if (isLoading || isAllowed) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <>
      <div className="relative rounded-2xl border border-border/80 overflow-hidden bg-card/60 backdrop-blur-sm p-6 sm:p-10 text-center">
        {/* Optional blurred background preview */}
        {blurPreview && (
          <div className="absolute inset-0 opacity-20 filter blur-md pointer-events-none select-none overflow-hidden">
            {children}
          </div>
        )}

        <div className="relative max-w-md mx-auto space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand/10 text-brand mb-1 shadow-inner">
            <Lock className="h-6 w-6" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline" className="text-xs font-semibold px-2 py-0 border-brand/40 text-brand">
                Available on {meta.minPlan}+
              </Badge>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-foreground">
              {title ?? meta.title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {description ?? meta.desc}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="brand"
              size="sm"
              className="w-full sm:w-auto text-xs font-semibold gap-1.5 h-9"
              onClick={() => setModalOpen(true)}
            >
              <Zap className="h-4 w-4" />
              Upgrade to Unlock
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="pt-4 border-t border-border/40 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Currently on {planKey} tier</span>
          </div>
        </div>
      </div>

      <UpgradePromptModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        metricName={meta.title}
        currentPlanKey={planKey}
      />
    </>
  )
}
