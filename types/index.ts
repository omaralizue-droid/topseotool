// ============================================================
// TOPSEOTOOL — Central Plan Configuration
// Single source of truth for all subscription plan limits.
// Do NOT hardcode plan limits anywhere else in the codebase.
// ============================================================

export type PlanKey = "FREE" | "PRO" | "AGENCY" | "BUSINESS"

export interface PlanLimits {
  projects: number          // max active (non-archived) projects
  auditsPerMonth: number    // SEO crawls per calendar month
  aiQueriesPerMonth: number // AI engine scans per calendar month
  competitors: number       // max competitors per project
  teamSeats: number         // max team members per org (0 = owner only)
  whiteLabel: boolean       // white-label PDF reports
  apiAccess: boolean        // REST API + webhook access
  aiAudits: boolean         // AI visibility scanning enabled
  reports: boolean          // report generation enabled
  prioritySupport: boolean  // priority support queue
}

export interface PlanConfig {
  key: PlanKey
  name: string
  description: string
  price: number          // USD/month (monthly billing)
  yearlyPrice: number    // USD/month when billed annually
  badge?: string         // e.g. "Most Popular"
  features: string[]     // bullet list for pricing UI
  limits: PlanLimits
  /** Stripe Price ID — read lazily so env is not accessed at build time */
  getPriceId: () => string
}

// ============================================================
// PLAN DEFINITIONS
// ============================================================

export const PLANS: Record<PlanKey, PlanConfig> = {
  FREE: {
    key: "FREE",
    name: "Free",
    description: "For individuals exploring AI search and SEO auditing.",
    price: 0,
    yearlyPrice: 0,
    features: [
      "1 website project",
      "1 SEO audit / month",
      "10 AI queries / month",
      "3 competitors tracked",
      "Standard dashboard analytics",
      "Community support",
    ],
    limits: {
      projects: 1,
      auditsPerMonth: 1,
      aiQueriesPerMonth: 10,
      competitors: 3,
      teamSeats: 0,
      whiteLabel: false,
      apiAccess: false,
      aiAudits: true,
      reports: false,
      prioritySupport: false,
    },
    getPriceId: () => "",
  },

  PRO: {
    key: "PRO",
    name: "Pro",
    description: "For growing brands & marketers optimizing search & AI visibility.",
    price: 49,
    yearlyPrice: 39,
    badge: "Most Popular",
    features: [
      "5 website projects",
      "10 SEO audits / month",
      "250 AI queries / month",
      "10 competitors tracked",
      "Competitor benchmarking suite",
      "AI brand perception profiling",
      "PDF report generation",
      "Team collaboration (5 seats)",
      "Email support",
    ],
    limits: {
      projects: 5,
      auditsPerMonth: 10,
      aiQueriesPerMonth: 250,
      competitors: 10,
      teamSeats: 5,
      whiteLabel: false,
      apiAccess: false,
      aiAudits: true,
      reports: true,
      prioritySupport: false,
    },
    getPriceId: () => process.env.STRIPE_PRICE_PRO ?? "",
  },

  AGENCY: {
    key: "AGENCY",
    name: "Agency",
    description: "For SEO agencies & marketing teams managing client portfolios.",
    price: 149,
    yearlyPrice: 119,
    features: [
      "25 website projects",
      "100 SEO audits / month",
      "2,500 AI queries / month",
      "Unlimited competitors",
      "White-label client PDF reports",
      "Priority AI scan execution",
      "Team collaboration (25 seats)",
      "Priority support",
    ],
    limits: {
      projects: 25,
      auditsPerMonth: 100,
      aiQueriesPerMonth: 2500,
      competitors: 999,
      teamSeats: 25,
      whiteLabel: true,
      apiAccess: false,
      aiAudits: true,
      reports: true,
      prioritySupport: true,
    },
    getPriceId: () => process.env.STRIPE_PRICE_AGENCY ?? "",
  },

  BUSINESS: {
    key: "BUSINESS",
    name: "Business",
    description: "For enterprises needing high-volume crawls & API integration.",
    price: 399,
    yearlyPrice: 319,
    features: [
      "100 website projects",
      "500 SEO audits / month",
      "10,000 AI queries / month",
      "Unlimited competitors",
      "White-label client reports",
      "Full REST API & webhook access",
      "Team collaboration (unlimited seats)",
      "Dedicated account management",
    ],
    limits: {
      projects: 100,
      auditsPerMonth: 500,
      aiQueriesPerMonth: 10000,
      competitors: 999,
      teamSeats: 999,
      whiteLabel: true,
      apiAccess: true,
      aiAudits: true,
      reports: true,
      prioritySupport: true,
    },
    getPriceId: () => process.env.STRIPE_PRICE_BUSINESS ?? "",
  },
}

// Display order for pricing page
export const PLAN_ORDER: PlanKey[] = ["FREE", "PRO", "AGENCY", "BUSINESS"]

// Paid plans only (have Stripe price IDs)
export const PAID_PLANS: PlanKey[] = ["PRO", "AGENCY", "BUSINESS"]

/** Get a plan config by key, falling back to FREE */
export function getPlanConfig(planKey: string): PlanConfig {
  if (planKey === "STARTER") return PLANS.FREE
  if (planKey === "ENTERPRISE") return PLANS.BUSINESS
  return PLANS[planKey as PlanKey] ?? PLANS.FREE
}

/** Get limits for a plan key (convenience wrapper) */
export function getPlanLimits(planKey: string): PlanLimits {
  return getPlanConfig(planKey).limits
}

/** Whether planA is an upgrade relative to planB */
export function isUpgrade(from: PlanKey, to: PlanKey): boolean {
  return PLAN_ORDER.indexOf(to) > PLAN_ORDER.indexOf(from)
}