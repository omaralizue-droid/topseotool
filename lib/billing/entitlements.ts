// ============================================================
// TOPSEOTOOL — Entitlement & Usage System
// Single source of truth for all plan limit checks and
// usage recording. Import this in every action route.
// ============================================================
import { db } from "@/lib/db"
import { getPlanConfig, type PlanKey, type PlanConfig } from "@/types"
import { ValidationError } from "@/lib/errors"

// ---------------------------------------------------------------------------
// Usage metric keys — use these constants everywhere
// ---------------------------------------------------------------------------
export const METRIC = {
  SEO_AUDIT: "seo_audit_count",
  AI_SCAN: "ai_scan_count",
  REPORT: "report_count",
} as const

export type MetricKey = (typeof METRIC)[keyof typeof METRIC]

// ---------------------------------------------------------------------------
// Usage summary returned to API and UI
// ---------------------------------------------------------------------------
export interface UsageSummary {
  planKey: PlanKey
  plan: PlanConfig
  // Projects
  projectsUsed: number
  projectsLimit: number
  projectsRemaining: number
  // SEO Audits
  auditsUsed: number
  auditsLimit: number
  auditsRemaining: number
  // AI Queries
  aiQueriesUsed: number
  aiQueriesLimit: number
  aiQueriesRemaining: number
  // Feature flags
  canWhiteLabel: boolean
  hasApiAccess: boolean
  canGenerateReports: boolean
  hasPrioritySupport: boolean
  // Billing period
  periodStart: Date
  periodEnd: Date | null
  // Subscription state
  status: string
  cancelAtPeriodEnd: boolean
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
}

// ---------------------------------------------------------------------------
// Get current usage for an organization
// ---------------------------------------------------------------------------
export async function getOrganizationUsage(
  organizationId: string
): Promise<UsageSummary> {
  const subscription = await db.subscription.findUnique({
    where: { organizationId },
  })

  const planKey = ((subscription?.plan as unknown as PlanKey) ?? "FREE")
  const plan = getPlanConfig(planKey)

  // Count active (non-archived) projects
  const projectsUsed = await db.project.count({
    where: { organizationId, status: { not: "ARCHIVED" } },
  })

  // Count usage records for the current calendar month
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [auditSum, aiSum] = await Promise.all([
    db.usageRecord.aggregate({
      where: { organizationId, metric: METRIC.SEO_AUDIT, recordedAt: { gte: periodStart } },
      _sum: { quantity: true },
    }),
    db.usageRecord.aggregate({
      where: { organizationId, metric: METRIC.AI_SCAN, recordedAt: { gte: periodStart } },
      _sum: { quantity: true },
    }),
  ])

  const auditsUsed = auditSum._sum?.quantity ?? 0
  const aiQueriesUsed = aiSum._sum?.quantity ?? 0

  const { limits } = plan

  return {
    planKey,
    plan,
    projectsUsed,
    projectsLimit: limits.projects,
    projectsRemaining: Math.max(0, limits.projects - projectsUsed),
    auditsUsed,
    auditsLimit: limits.auditsPerMonth,
    auditsRemaining: Math.max(0, limits.auditsPerMonth - auditsUsed),
    aiQueriesUsed,
    aiQueriesLimit: limits.aiQueriesPerMonth,
    aiQueriesRemaining: Math.max(0, limits.aiQueriesPerMonth - aiQueriesUsed),
    canWhiteLabel: limits.whiteLabel,
    hasApiAccess: limits.apiAccess,
    canGenerateReports: limits.reports,
    hasPrioritySupport: limits.prioritySupport,
    periodStart,
    periodEnd: subscription?.currentPeriodEnd ?? null,
    status: subscription?.status ?? "ACTIVE",
    cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
    stripeCustomerId: subscription?.stripeCustomerId ?? null,
    stripeSubscriptionId: subscription?.stripeSubscriptionId ?? null,
  }
}

// ---------------------------------------------------------------------------
// Record consumed usage
// ---------------------------------------------------------------------------
export async function recordUsage(
  organizationId: string,
  metric: MetricKey,
  quantity = 1,
  userId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await db.usageRecord.create({
    data: {
      organizationId,
      userId: userId ?? null,
      metric,
      quantity,
      metadata: (metadata as any) ?? undefined,
    },
  })
}

// ---------------------------------------------------------------------------
// Entitlement checks — throw ValidationError if limit exceeded
// ---------------------------------------------------------------------------

export type EntitlementAction =
  | "CREATE_PROJECT"
  | "RUN_SEO_AUDIT"
  | "RUN_AI_SCAN"
  | "GENERATE_REPORT"

const UPGRADE_CTA = "Upgrade your plan at /billing"

export async function checkEntitlement(
  organizationId: string,
  action: EntitlementAction
): Promise<UsageSummary> {
  const usage = await getOrganizationUsage(organizationId)

  switch (action) {
    case "CREATE_PROJECT":
      if (usage.projectsUsed >= usage.projectsLimit) {
        throw new ValidationError(
          `Project limit reached (${usage.projectsUsed}/${usage.projectsLimit} on ${usage.plan.name} plan). ${UPGRADE_CTA}.`,
          { action, used: usage.projectsUsed, limit: usage.projectsLimit, planKey: usage.planKey }
        )
      }
      break

    case "RUN_SEO_AUDIT":
      if (usage.auditsUsed >= usage.auditsLimit) {
        throw new ValidationError(
          `Monthly SEO Audit limit reached (${usage.auditsUsed}/${usage.auditsLimit} on ${usage.plan.name} plan). ${UPGRADE_CTA}.`,
          { action, used: usage.auditsUsed, limit: usage.auditsLimit, planKey: usage.planKey }
        )
      }
      break

    case "RUN_AI_SCAN":
      if (usage.aiQueriesUsed >= usage.aiQueriesLimit) {
        throw new ValidationError(
          `Monthly AI Query limit reached (${usage.aiQueriesUsed}/${usage.aiQueriesLimit} on ${usage.plan.name} plan). ${UPGRADE_CTA}.`,
          { action, used: usage.aiQueriesUsed, limit: usage.aiQueriesLimit, planKey: usage.planKey }
        )
      }
      break

    case "GENERATE_REPORT":
      if (!usage.canGenerateReports) {
        throw new ValidationError(
          `Report generation is not available on the ${usage.plan.name} plan. ${UPGRADE_CTA}.`,
          { action, planKey: usage.planKey }
        )
      }
      break
  }

  return usage
}

// ---------------------------------------------------------------------------
// Convenience: check and record in one call
// ---------------------------------------------------------------------------
export async function checkAndRecord(
  organizationId: string,
  action: EntitlementAction,
  metric: MetricKey,
  quantity = 1,
  userId?: string
): Promise<UsageSummary> {
  const usage = await checkEntitlement(organizationId, action)
  await recordUsage(organizationId, metric, quantity, userId)
  return usage
}