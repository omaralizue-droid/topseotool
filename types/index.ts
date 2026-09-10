// ============================================================
// TOPSEOTOOL — Central Plan & Subscription Configuration
// Single source of truth for all subscription plan tiers, limits,
// and feature access.
// Do NOT hardcode plan restrictions inside individual components.
// ============================================================

export type PlanKey =
  | "FREE"
  | "STARTER"
  | "PROFESSIONAL"
  | "AGENCY"
  | "ENTERPRISE"
  | "PRO"        // legacy alias for PROFESSIONAL
  | "BUSINESS"   // legacy alias for ENTERPRISE

export type FeatureKey =
  | "keyword_research"
  | "competitor_analysis"
  | "rank_tracking"
  | "backlink_analysis"
  | "content_optimizer"
  | "ai_search_visibility"
  | "ai_perception"
  | "api_access"
  | "white_label"
  | "custom_reports"
  | "advanced_permissions"
  | "multiple_teams"
  | "dedicated_infrastructure"
  | "priority_support"

export interface PlanLimits {
  projects: number               // max active projects (9999 = unlimited)
  auditsPerMonth: number         // technical SEO crawls per month
  keywordSearchesPerMonth: number// keyword research queries per month
  trackedKeywords: number        // daily rank tracking keywords
  aiQueriesPerMonth: number      // AI search / AEO engine scans per month
  competitorsPerProject: number  // max competitors tracked per project
  teamSeats: number              // max team member seats
  reportsPerMonth: number        // generated executive PDF reports
  features: FeatureKey[]         // enabled feature flags
  customLimitsAllowed: boolean   // enterprise custom overages

  // Flexible Usage System Limits
  monthly_keyword_limit: number
  monthly_crawl_limit: number
  monthly_pages_audited_limit: number
  monthly_rank_tracking_limit: number
  competitor_domains_limit: number
  monthly_backlink_lookup_limit: number
  monthly_ai_limit: number
  monthly_report_limit: number
  monthly_api_limit: number
}

export interface PlanConfig {
  key: PlanKey
  name: string
  tagline: string
  description: string
  price: number                  // USD/month (monthly billing)
  yearlyPrice: number            // USD/month (when billed annually)
  isCustomPrice?: boolean        // true for Enterprise
  badge?: string                 // e.g. "Most Popular" or "Best Value"
  features: string[]             // display bullet points (backwards-compatible alias)
  featuresList: string[]         // display bullet points
  limits: PlanLimits
  getPriceId: () => string
}

// ============================================================
// PLAN DEFINITIONS
// ============================================================

export const PLANS: Record<"FREE" | "STARTER" | "PROFESSIONAL" | "AGENCY" | "ENTERPRISE", PlanConfig> = {
  FREE: {
    key: "FREE",
    name: "Free",
    tagline: "Explore SEO & AI Visibility",
    description: "For individuals and hobbyists testing the platform.",
    price: 0,
    yearlyPrice: 0,
    features: [
      "1 website project",
      "3 technical SEO audits / month",
      "15 keyword searches / month",
      "10 tracked rank keywords",
      "1 basic executive report / month",
      "Community support",
    ],
    featuresList: [
      "1 website project",
      "3 technical SEO audits / month",
      "15 keyword searches / month",
      "10 tracked rank keywords",
      "1 basic executive report / month",
      "Community support",
    ],
    limits: {
      projects: 1,
      auditsPerMonth: 3,
      keywordSearchesPerMonth: 15,
      trackedKeywords: 10,
      aiQueriesPerMonth: 10,
      competitorsPerProject: 1,
      teamSeats: 1,
      reportsPerMonth: 1,
      features: [
        "keyword_research",
        "rank_tracking",
      ],
      customLimitsAllowed: false,
      monthly_keyword_limit: 15,
      monthly_crawl_limit: 500,
      monthly_pages_audited_limit: 100,
      monthly_rank_tracking_limit: 10,
      competitor_domains_limit: 1,
      monthly_backlink_lookup_limit: 10,
      monthly_ai_limit: 10,
      monthly_report_limit: 1,
      monthly_api_limit: 0,
    },
    getPriceId: () => "",
  },

  STARTER: {
    key: "STARTER",
    name: "Starter",
    tagline: "For freelancers & small sites",
    description: "Essential SEO toolkit for growing independent sites and freelance consultants.",
    price: 29,
    yearlyPrice: 24,
    features: [
      "3 website projects",
      "25 technical SEO audits / month",
      "250 keyword searches / month",
      "100 tracked rank keywords",
      "3 competitors per project",
      "5 executive reports / month",
      "Email support",
    ],
    featuresList: [
      "3 website projects",
      "25 technical SEO audits / month",
      "250 keyword searches / month",
      "100 tracked rank keywords",
      "3 competitors per project",
      "5 executive reports / month",
      "Email support",
    ],
    limits: {
      projects: 3,
      auditsPerMonth: 25,
      keywordSearchesPerMonth: 250,
      trackedKeywords: 100,
      aiQueriesPerMonth: 100,
      competitorsPerProject: 3,
      teamSeats: 2,
      reportsPerMonth: 5,
      features: [
        "keyword_research",
        "rank_tracking",
        "competitor_analysis",
        "content_optimizer",
      ],
      customLimitsAllowed: false,
      monthly_keyword_limit: 250,
      monthly_crawl_limit: 10000,
      monthly_pages_audited_limit: 1000,
      monthly_rank_tracking_limit: 100,
      competitor_domains_limit: 3,
      monthly_backlink_lookup_limit: 100,
      monthly_ai_limit: 100,
      monthly_report_limit: 5,
      monthly_api_limit: 500,
    },
    getPriceId: () => process.env.STRIPE_PRICE_STARTER ?? "",
  },

  PROFESSIONAL: {
    key: "PROFESSIONAL",
    name: "Professional",
    tagline: "For SEO professionals",
    description: "Complete organic intelligence, backlink auditing, and AI search visibility.",
    price: 79,
    yearlyPrice: 65,
    badge: "Most Popular",
    features: [
      "10 website projects",
      "100 technical SEO audits / month",
      "1,500 keyword searches / month",
      "500 tracked rank keywords",
      "Backlink profile & toxic link audit",
      "AI search visibility (ChatGPT, Claude)",
      "Real-time content optimizer",
      "25 executive PDF reports / month",
      "5 team member seats",
      "Priority email support",
    ],
    featuresList: [
      "10 website projects",
      "100 technical SEO audits / month",
      "1,500 keyword searches / month",
      "500 tracked rank keywords",
      "Backlink profile & toxic link audit",
      "AI search visibility (ChatGPT, Claude)",
      "Real-time content optimizer",
      "25 executive PDF reports / month",
      "5 team member seats",
      "Priority email support",
    ],
    limits: {
      projects: 10,
      auditsPerMonth: 100,
      keywordSearchesPerMonth: 1500,
      trackedKeywords: 500,
      aiQueriesPerMonth: 500,
      competitorsPerProject: 10,
      teamSeats: 5,
      reportsPerMonth: 25,
      features: [
        "keyword_research",
        "rank_tracking",
        "competitor_analysis",
        "backlink_analysis",
        "content_optimizer",
        "ai_search_visibility",
        "ai_perception",
      ],
      customLimitsAllowed: false,
      monthly_keyword_limit: 1500,
      monthly_crawl_limit: 50000,
      monthly_pages_audited_limit: 5000,
      monthly_rank_tracking_limit: 500,
      competitor_domains_limit: 10,
      monthly_backlink_lookup_limit: 1000,
      monthly_ai_limit: 500,
      monthly_report_limit: 25,
      monthly_api_limit: 5000,
    },
    getPriceId: () => process.env.STRIPE_PRICE_PRO ?? "",
  },

  AGENCY: {
    key: "AGENCY",
    name: "Agency",
    tagline: "For agencies and teams",
    description: "High-volume crawling, team collaboration, and client white-label reports.",
    price: 199,
    yearlyPrice: 165,
    badge: "Best for Agencies",
    features: [
      "35 website projects",
      "500 technical SEO audits / month",
      "10,000 keyword searches / month",
      "2,500 tracked rank keywords",
      "White-label client PDF reports",
      "Custom branding & client share links",
      "Automated weekly client reports",
      "25 team member seats with RBAC",
      "Dedicated priority queue",
    ],
    featuresList: [
      "35 website projects",
      "500 technical SEO audits / month",
      "10,000 keyword searches / month",
      "2,500 tracked rank keywords",
      "White-label client PDF reports",
      "Custom branding & client share links",
      "Automated weekly client reports",
      "25 team member seats with RBAC",
      "Dedicated priority queue",
    ],
    limits: {
      projects: 35,
      auditsPerMonth: 500,
      keywordSearchesPerMonth: 10000,
      trackedKeywords: 2500,
      aiQueriesPerMonth: 2500,
      competitorsPerProject: 25,
      teamSeats: 25,
      reportsPerMonth: 100,
      features: [
        "keyword_research",
        "rank_tracking",
        "competitor_analysis",
        "backlink_analysis",
        "content_optimizer",
        "ai_search_visibility",
        "ai_perception",
        "white_label",
        "custom_reports",
        "priority_support",
      ],
      customLimitsAllowed: false,
      monthly_keyword_limit: 10000,
      monthly_crawl_limit: 250000,
      monthly_pages_audited_limit: 25000,
      monthly_rank_tracking_limit: 2500,
      competitor_domains_limit: 25,
      monthly_backlink_lookup_limit: 5000,
      monthly_ai_limit: 2500,
      monthly_report_limit: 100,
      monthly_api_limit: 25000,
    },
    getPriceId: () => process.env.STRIPE_PRICE_AGENCY ?? "",
  },

  ENTERPRISE: {
    key: "ENTERPRISE",
    name: "Enterprise",
    tagline: "Custom pricing & dedicated scale",
    description: "Unlimited/large usage quotas, multiple teams, full REST API, and custom infrastructure.",
    price: 599,
    yearlyPrice: 499,
    isCustomPrice: true,
    features: [
      "Unlimited / large project quotas (100+)",
      "5,000+ technical SEO audits / month",
      "Unlimited keyword research",
      "15,000+ tracked rank keywords",
      "Multiple teams & advanced RBAC permissions",
      "Full REST API & webhook access",
      "White-label portal on custom domain",
      "Custom reports & automated pipelines",
      "Dedicated infrastructure & private proxies",
      "Custom SLA & 24/7 dedicated account manager",
    ],
    featuresList: [
      "Unlimited / large project quotas (100+)",
      "5,000+ technical SEO audits / month",
      "Unlimited keyword research",
      "15,000+ tracked rank keywords",
      "Multiple teams & advanced RBAC permissions",
      "Full REST API & webhook access",
      "White-label portal on custom domain",
      "Custom reports & automated pipelines",
      "Dedicated infrastructure & private proxies",
      "Custom SLA & 24/7 dedicated account manager",
    ],
    limits: {
      projects: 9999,
      auditsPerMonth: 5000,
      keywordSearchesPerMonth: 999999,
      trackedKeywords: 15000,
      aiQueriesPerMonth: 15000,
      competitorsPerProject: 100,
      teamSeats: 999,
      reportsPerMonth: 9999,
      features: [
        "keyword_research",
        "rank_tracking",
        "competitor_analysis",
        "backlink_analysis",
        "content_optimizer",
        "ai_search_visibility",
        "ai_perception",
        "api_access",
        "white_label",
        "custom_reports",
        "advanced_permissions",
        "multiple_teams",
        "dedicated_infrastructure",
        "priority_support",
      ],
      customLimitsAllowed: true,
      monthly_keyword_limit: 999999,
      monthly_crawl_limit: 2500000,
      monthly_pages_audited_limit: 250000,
      monthly_rank_tracking_limit: 15000,
      competitor_domains_limit: 100,
      monthly_backlink_lookup_limit: 50000,
      monthly_ai_limit: 15000,
      monthly_report_limit: 9999,
      monthly_api_limit: 250000,
    },
    getPriceId: () => process.env.STRIPE_PRICE_ENTERPRISE ?? "",
  },
}

// Display order for pricing tables & billing views
export const PLAN_ORDER: PlanKey[] = ["FREE", "STARTER", "PROFESSIONAL", "AGENCY", "ENTERPRISE"]

// Normalizer for plan keys (handles PRO -> PROFESSIONAL, BUSINESS -> ENTERPRISE)
export function normalizePlanKey(planKey: string | null | undefined): "FREE" | "STARTER" | "PROFESSIONAL" | "AGENCY" | "ENTERPRISE" {
  if (!planKey) return "FREE"
  const upper = planKey.toUpperCase()
  if (upper === "PRO") return "PROFESSIONAL"
  if (upper === "BUSINESS") return "ENTERPRISE"
  if (upper in PLANS) return upper as any
  return "FREE"
}

/** Get a plan config by key */
export function getPlanConfig(planKey: string | null | undefined): PlanConfig {
  const normalized = normalizePlanKey(planKey)
  return PLANS[normalized]
}

/** Get limits for a plan key */
export function getPlanLimits(planKey: string | null | undefined): PlanLimits {
  return getPlanConfig(planKey).limits
}

/** Check if a plan grants access to a specific feature */
export function canPlanAccessFeature(planKey: string | null | undefined, feature: FeatureKey): boolean {
  const plan = getPlanConfig(planKey)
  return plan.limits.features.includes(feature)
}