"use client"

import { useQuery } from "@tanstack/react-query"
import {
  canPlanAccessFeature,
  getPlanConfig,
  type FeatureKey,
  type PlanKey,
  type PlanConfig,
  type PlanLimits,
} from "@/types"
import type { UsageSummary } from "@/lib/billing/entitlements"

export function useEntitlements(organizationId?: string) {
  const { data: rawData, isLoading } = useQuery({
    queryKey: ["organization-usage", organizationId],
    queryFn: async () => {
      const res = await fetch("/api/billing/usage")
      if (!res.ok) {
        return null
      }
      return res.json()
    },
    staleTime: 60 * 1000,
  })

  // Unwrap { ok: true, data: UsageSummary } or raw object
  const usage: UsageSummary | null = rawData?.data ?? rawData ?? null
  const planKey: PlanKey = (usage?.planKey as PlanKey) ?? "STARTER"
  const plan: PlanConfig = getPlanConfig(planKey)

  const checkFeature = (feature: FeatureKey): boolean => {
    return canPlanAccessFeature(planKey, feature)
  }

  return {
    isLoading,
    planKey,
    plan,
    limits: plan.limits,
    usage,
    canUseFeature: checkFeature,
    isEnterprise: planKey === "ENTERPRISE",
    isAgencyOrHigher: planKey === "AGENCY" || planKey === "ENTERPRISE",
    isProfessionalOrHigher:
      planKey === "PROFESSIONAL" || planKey === "AGENCY" || planKey === "ENTERPRISE",
    upgradeUrl: "/billing",
  }
}
