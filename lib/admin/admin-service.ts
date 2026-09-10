import { db } from "@/lib/db"
import { queueManager, JobRecord } from "@/lib/jobs/queue-service"

// ===========================================================================
// INTERFACES & TYPES
// ===========================================================================

export interface AdminMetrics {
  totalUsers: number
  totalUsersGrowth: string
  activeUsers: number
  activeUsersRatio: string
  mrr: number
  mrrGrowth: string
  arr: number
  arrGrowth: string
  newCustomers: number
  newCustomersChange: string
  churnRate: number
  churnRateBenchmark: string
  conversionRate: number
  conversionRateChange: string
  apiRequests: number
  apiRequests24h: number
  seoAudits: number
  seoAuditsGrowth: string
  aiRequests: number
  aiRequestsGrowth: string
  lastUpdated: string
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: "USER" | "SUPER_ADMIN"
  status: "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION"
  planTier: "FREE" | "STARTER" | "PRO" | "AGENCY" | "ENTERPRISE"
  organizationName: string
  createdAt: string
  lastActiveAt: string
  totalAuditsRun: number
  apiKeysCount: number
}

export interface AdminOrganization {
  id: string
  name: string
  slug: string
  ownerEmail: string
  membersCount: number
  projectsCount: number
  planTier: "FREE" | "STARTER" | "PRO" | "AGENCY" | "ENTERPRISE"
  status: "ACTIVE" | "PAST_DUE" | "TRIALING" | "CANCELED"
  mrr: number
  customDomain?: string
  isWhiteLabelActive: boolean
  createdAt: string
}

export interface AdminSubscription {
  id: string
  organizationId: string
  organizationName: string
  plan: "FREE" | "STARTER" | "PRO" | "AGENCY" | "ENTERPRISE"
  status: "ACTIVE" | "PAST_DUE" | "TRIALING" | "CANCELED"
  billingCycle: "MONTHLY" | "ANNUAL"
  amountUsd: number
  currentPeriodEnd: string
  stripeCustomerId: string
  stripeSubscriptionId: string
  cancelAtPeriodEnd: boolean
}

export interface AdminRevenueReport {
  mrr: number
  arr: number
  netRevenueGrowthMoM: string
  arpuUsd: number
  ltvUsd: number
  churnNetPct: number
  refundRatePct: number
  byPlan: Array<{ plan: string; mrr: number; customers: number; sharePct: number }>
  monthlyTrajectory: Array<{ month: string; mrr: number; newMrr: number; churnMrr: number }>
  recentTransactions: Array<{
    id: string
    organizationName: string
    customerEmail: string
    amountUsd: number
    status: "PAID" | "REFUNDED" | "FAILED"
    plan: string
    date: string
    receiptUrl: string
  }>
}

export interface AdminSystemHealth {
  overallStatus: "HEALTHY" | "DEGRADED" | "DOWN"
  uptimePct: number
  p95LatencyMs: number
  services: Array<{
    name: string
    category: "DATABASE" | "CACHE" | "CRAWLER" | "AI_INFERENCE" | "STORAGE" | "EDGE"
    status: "OPERATIONAL" | "DEGRADED" | "OUTAGE"
    latencyMs: number
    uptimePct: number
    details: string
  }>
  serverMetrics: {
    cpuUsagePct: number
    memoryUsedGb: number
    memoryTotalGb: number
    activeConnections: number
    crawlWorkerLoadPct: number
  }
}

export interface AdminFailedJob {
  id: string
  type: string
  status: "FAILED" | "PENDING" | "PROCESSING" | "COMPLETED"
  targetUrl?: string
  organizationName: string
  errorMessage: string
  stackSnippet: string
  attempts: number
  maxAttempts: number
  failedAt: string
}

export interface AdminAuditLog {
  id: string
  actorEmail: string
  actorRole: "SUPER_ADMIN" | "SYSTEM" | "API"
  action: string
  targetResource: string
  ipAddress: string
  userAgent: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface AdminFeatureFlag {
  id: string
  key: string
  name: string
  description: string
  isEnabled: boolean
  rolloutPercentage: number
  tierRestriction: "ALL" | "PRO_AND_ABOVE" | "AGENCY_ENTERPRISE_ONLY"
  lastModifiedBy: string
  updatedAt: string
}

export interface AdminAIUsageReport {
  totalTokensConsumed24h: number
  estimatedCostUsd24h: number
  promptCacheHitRatePct: number
  models: Array<{
    modelName: string
    provider: "OpenAI" | "Anthropic" | "Google" | "Perplexity"
    requests24h: number
    inputTokens: number
    outputTokens: number
    costUsd: number
    avgLatencyMs: number
  }>
  topTenantsBySpend: Array<{
    organizationName: string
    plan: string
    tokenUsage: number
    costUsd: number
  }>
}

export interface AdminAbuseAlert {
  id: string
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
  threatType: "SCRAPING_ANOMALY" | "DISPOSABLE_EMAIL" | "CREDENTIAL_STUFFING" | "API_FLOOD" | "CARDING_ATTEMPT"
  targetEntity: string
  ipAddress: string
  country: string
  firstDetectedAt: string
  status: "ACTIVE" | "RESOLVED" | "BLOCKED"
  suggestedAction: string
}

export interface AdminSupportTicket {
  id: string
  ticketNumber: string
  customerEmail: string
  organizationName: string
  planTier: string
  subject: string
  category: "TECHNICAL" | "BILLING" | "API_INTEGRATION" | "FEATURE_REQUEST"
  priority: "URGENT" | "HIGH" | "MEDIUM" | "LOW"
  status: "OPEN" | "IN_PROGRESS" | "WAITING_ON_CUSTOMER" | "RESOLVED"
  slaMinutesRemaining: number
  assignedTo: string
  createdAt: string
  lastResponseAt: string
}

export interface AdminAnnouncement {
  id: string
  title: string
  message: string
  type: "INFO" | "WARNING" | "MAINTENANCE" | "FEATURE"
  targetAudience: "ALL" | "AGENCY_ENTERPRISE" | "FREE_TIER"
  isActive: boolean
  dismissible: boolean
  startsAt: string
  expiresAt: string
}

// ===========================================================================
// IN-MEMORY MOCK & STATE ENGINE
// ===========================================================================

let IN_MEMORY_USERS: AdminUser[] = [
  {
    id: "usr_super_1",
    name: "Omar Ali",
    email: "admin@topseotool.net",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    planTier: "ENTERPRISE",
    organizationName: "TOPSEOTOOL Core",
    createdAt: "2025-01-10T08:00:00.000Z",
    lastActiveAt: "Just now",
    totalAuditsRun: 420,
    apiKeysCount: 4,
  },
  {
    id: "usr_agency_1",
    name: "Sarah Jenkins",
    email: "sarah@abcdigital.com",
    role: "USER",
    status: "ACTIVE",
    planTier: "AGENCY",
    organizationName: "ABC Digital Agency",
    createdAt: "2025-04-12T14:22:00.000Z",
    lastActiveAt: "12 mins ago",
    totalAuditsRun: 3120,
    apiKeysCount: 2,
  },
  {
    id: "usr_ent_1",
    name: "Marcus Vance",
    email: "m.vance@techscale.io",
    role: "USER",
    status: "ACTIVE",
    planTier: "ENTERPRISE",
    organizationName: "TechScale Global",
    createdAt: "2025-02-18T10:15:00.000Z",
    lastActiveAt: "45 mins ago",
    totalAuditsRun: 8450,
    apiKeysCount: 6,
  },
  {
    id: "usr_pro_1",
    name: "Elena Rostova",
    email: "elena@growthvortex.co",
    role: "USER",
    status: "ACTIVE",
    planTier: "PRO",
    organizationName: "GrowthVortex Lab",
    createdAt: "2025-06-01T09:30:00.000Z",
    lastActiveAt: "2 hours ago",
    totalAuditsRun: 512,
    apiKeysCount: 1,
  },
  {
    id: "usr_starter_1",
    name: "David Chen",
    email: "david@chinookmedia.ca",
    role: "USER",
    status: "ACTIVE",
    planTier: "STARTER",
    organizationName: "Chinook Media",
    createdAt: "2025-08-14T11:00:00.000Z",
    lastActiveAt: "1 day ago",
    totalAuditsRun: 84,
    apiKeysCount: 0,
  },
  {
    id: "usr_free_flagged",
    name: "Alexey Botnet",
    email: "crawler-pool@temp-disposable-mail.org",
    role: "USER",
    status: "SUSPENDED",
    planTier: "FREE",
    organizationName: "ScrapeOps Bot",
    createdAt: "2025-09-08T03:12:00.000Z",
    lastActiveAt: "2 days ago",
    totalAuditsRun: 950,
    apiKeysCount: 1,
  },
]

let IN_MEMORY_ORGANIZATIONS: AdminOrganization[] = [
  {
    id: "org_abc",
    name: "ABC Digital Agency",
    slug: "abc-digital",
    ownerEmail: "sarah@abcdigital.com",
    membersCount: 14,
    projectsCount: 38,
    planTier: "AGENCY",
    status: "ACTIVE",
    mrr: 499,
    customDomain: "reports.abcdigital.com",
    isWhiteLabelActive: true,
    createdAt: "2025-04-12T14:22:00.000Z",
  },
  {
    id: "org_techscale",
    name: "TechScale Global",
    slug: "techscale-io",
    ownerEmail: "m.vance@techscale.io",
    membersCount: 42,
    projectsCount: 120,
    planTier: "ENTERPRISE",
    status: "ACTIVE",
    mrr: 1250,
    customDomain: "seo.techscale.io",
    isWhiteLabelActive: true,
    createdAt: "2025-02-18T10:15:00.000Z",
  },
  {
    id: "org_growthvortex",
    name: "GrowthVortex Lab",
    slug: "growthvortex",
    ownerEmail: "elena@growthvortex.co",
    membersCount: 5,
    projectsCount: 12,
    planTier: "PRO",
    status: "ACTIVE",
    mrr: 199,
    isWhiteLabelActive: false,
    createdAt: "2025-06-01T09:30:00.000Z",
  },
  {
    id: "org_chinook",
    name: "Chinook Media",
    slug: "chinook-media",
    ownerEmail: "david@chinookmedia.ca",
    membersCount: 2,
    projectsCount: 4,
    planTier: "STARTER",
    status: "ACTIVE",
    mrr: 79,
    isWhiteLabelActive: false,
    createdAt: "2025-08-14T11:00:00.000Z",
  },
  {
    id: "org_pastdue",
    name: "Apex Hyperion Inc",
    slug: "apex-hyperion",
    ownerEmail: "billing@hyperion-apex.com",
    membersCount: 8,
    projectsCount: 9,
    planTier: "PRO",
    status: "PAST_DUE",
    mrr: 199,
    isWhiteLabelActive: false,
    createdAt: "2025-03-10T16:00:00.000Z",
  },
]

let IN_MEMORY_FEATURE_FLAGS: AdminFeatureFlag[] = [
  {
    id: "ff_ai_deep",
    key: "ai_deep_search_v2",
    name: "AI Deep Search Multi-Engine Scan v2",
    description: "Enables Perplexity Sonar and Gemini 1.5 Pro deep recursive citation extraction.",
    isEnabled: true,
    rolloutPercentage: 100,
    tierRestriction: "ALL",
    lastModifiedBy: "admin@topseotool.net",
    updatedAt: "2025-09-08T10:00:00.000Z",
  },
  {
    id: "ff_white_label",
    key: "pdf_white_label_v2",
    name: "Enterprise White-Label Custom Domains & Branding",
    description: "Allows agencies to mask client portals, report branding, and custom SMTP domains.",
    isEnabled: true,
    rolloutPercentage: 100,
    tierRestriction: "AGENCY_ENTERPRISE_ONLY",
    lastModifiedBy: "admin@topseotool.net",
    updatedAt: "2025-09-09T14:30:00.000Z",
  },
  {
    id: "ff_bulk_keywords",
    key: "bulk_keyword_export_100k",
    name: "Bulk Keyword Exporter (100k Rows)",
    description: "Asynchronous stream CSV generation for high-volume keyword sets.",
    isEnabled: false,
    rolloutPercentage: 25,
    tierRestriction: "AGENCY_ENTERPRISE_ONLY",
    lastModifiedBy: "admin@topseotool.net",
    updatedAt: "2025-09-07T12:00:00.000Z",
  },
  {
    id: "ff_realtime_crawler",
    key: "serp_realtime_scraping",
    name: "Real-time SERP Scraper Fallback Pool",
    description: "Automatically routes through residential proxy pool if Google blocks datacenter IPs.",
    isEnabled: true,
    rolloutPercentage: 80,
    tierRestriction: "PRO_AND_ABOVE",
    lastModifiedBy: "admin@topseotool.net",
    updatedAt: "2025-09-05T09:15:00.000Z",
  },
  {
    id: "ff_sso",
    key: "enterprise_sso_saml",
    name: "SAML 2.0 & Okta Enterprise Single Sign-On",
    description: "SAML assertion consumer service and tenant identity provider sync.",
    isEnabled: true,
    rolloutPercentage: 100,
    tierRestriction: "AGENCY_ENTERPRISE_ONLY",
    lastModifiedBy: "admin@topseotool.net",
    updatedAt: "2025-09-01T15:00:00.000Z",
  },
]

let IN_MEMORY_FAILED_JOBS: AdminFailedJob[] = [
  {
    id: "job_err_981",
    type: "SEO_CRAWL",
    status: "FAILED",
    targetUrl: "https://shop-slow-cdn.com",
    organizationName: "GrowthVortex Lab",
    errorMessage: "Navigation timeout of 30000ms exceeded during Playwright headless render",
    stackSnippet: "TimeoutError: page.goto: Timeout 30000ms exceeded.\n    at HeadlessCrawler.crawl (lib/crawler/playwright.ts:84)",
    attempts: 3,
    maxAttempts: 3,
    failedAt: "18 mins ago",
  },
  {
    id: "job_err_982",
    type: "PDF_REPORT_GENERATE",
    status: "FAILED",
    organizationName: "Apex Hyperion Inc",
    errorMessage: "Chrome font rasterization memory allocation failure (ENOMEM)",
    stackSnippet: "Error: Protocol error (Target.createTarget): Target closed.\n    at PDFRenderer.generate (lib/reports/pdf.ts:112)",
    attempts: 2,
    maxAttempts: 3,
    failedAt: "1 hour ago",
  },
  {
    id: "job_err_983",
    type: "AI_VISIBILITY_BATCH",
    status: "FAILED",
    organizationName: "TechScale Global",
    errorMessage: "Perplexity API rate limit exceeded (HTTP 429: Too Many Requests)",
    stackSnippet: "ApiError: Rate limit quota 60 req/min exceeded on endpoint /chat/completions",
    attempts: 3,
    maxAttempts: 3,
    failedAt: "3 hours ago",
  },
]

let IN_MEMORY_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: "log_1",
    actorEmail: "admin@topseotool.net",
    actorRole: "SUPER_ADMIN",
    action: "feature_flag.toggled",
    targetResource: "pdf_white_label_v2 (ENABLED 100%)",
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    timestamp: "10 mins ago",
  },
  {
    id: "log_2",
    actorEmail: "sarah@abcdigital.com",
    actorRole: "API",
    action: "api_key.rotated",
    targetResource: "key_live_9f82...38a1 -> key_live_21b4...88dc",
    ipAddress: "35.192.44.12",
    userAgent: "Axios/1.7.0 (Node.js)",
    timestamp: "32 mins ago",
  },
  {
    id: "log_3",
    actorEmail: "admin@topseotool.net",
    actorRole: "SUPER_ADMIN",
    action: "user.suspended",
    targetResource: "crawler-pool@temp-disposable-mail.org (Abuse: Scraper Bot)",
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    timestamp: "2 hours ago",
  },
  {
    id: "log_4",
    actorEmail: "system-cron@topseotool.net",
    actorRole: "SYSTEM",
    action: "subscription.past_due_alert",
    targetResource: "org_pastdue (Apex Hyperion Inc)",
    ipAddress: "10.0.0.4",
    userAgent: "CronWorker/2.0",
    timestamp: "5 hours ago",
  },
  {
    id: "log_5",
    actorEmail: "m.vance@techscale.io",
    actorRole: "API",
    action: "report.compiled_white_label",
    targetResource: "TechScale Executive Q3 Audit",
    ipAddress: "54.210.12.98",
    userAgent: "Python/3.11 aiohttp/3.9",
    timestamp: "7 hours ago",
  },
]

let IN_MEMORY_ABUSE_ALERTS: AdminAbuseAlert[] = [
  {
    id: "ab_1",
    severity: "CRITICAL",
    threatType: "API_FLOOD",
    targetEntity: "IP 185.220.101.5 (Tor Exit Node)",
    ipAddress: "185.220.101.5",
    country: "DE",
    firstDetectedAt: "4 mins ago",
    status: "ACTIVE",
    suggestedAction: "Drop IP range at Edge Firewall (WAF) rule 404",
  },
  {
    id: "ab_2",
    severity: "HIGH",
    threatType: "SCRAPING_ANOMALY",
    targetEntity: "Account: crawler-pool@temp-disposable-mail.org",
    ipAddress: "104.28.19.44",
    country: "US",
    firstDetectedAt: "2 hours ago",
    status: "BLOCKED",
    suggestedAction: "Quarantine tenant and invalidate all active session tokens",
  },
  {
    id: "ab_3",
    severity: "MEDIUM",
    threatType: "CREDENTIAL_STUFFING",
    targetEntity: "Targeting endpoint /api/auth/callback/credentials",
    ipAddress: "45.155.205.233",
    country: "NL",
    firstDetectedAt: "6 hours ago",
    status: "RESOLVED",
    suggestedAction: "Enforce cloudflare turnstile CAPTCHA challenge",
  },
]

let IN_MEMORY_TICKETS: AdminSupportTicket[] = [
  {
    id: "tkt_101",
    ticketNumber: "SUP-4921",
    customerEmail: "sarah@abcdigital.com",
    organizationName: "ABC Digital Agency",
    planTier: "AGENCY",
    subject: "Custom domain SSL certificate validation taking > 30 mins",
    category: "TECHNICAL",
    priority: "URGENT",
    status: "IN_PROGRESS",
    slaMinutesRemaining: 18,
    assignedTo: "Omar Ali",
    createdAt: "22 mins ago",
    lastResponseAt: "5 mins ago",
  },
  {
    id: "tkt_102",
    ticketNumber: "SUP-4918",
    customerEmail: "m.vance@techscale.io",
    organizationName: "TechScale Global",
    planTier: "ENTERPRISE",
    subject: "Requesting rate limit increase to 600 req/min for v1 API",
    category: "API_INTEGRATION",
    priority: "HIGH",
    status: "OPEN",
    slaMinutesRemaining: 74,
    assignedTo: "Unassigned",
    createdAt: "1 hour ago",
    lastResponseAt: "Never",
  },
  {
    id: "tkt_103",
    ticketNumber: "SUP-4912",
    customerEmail: "david@chinookmedia.ca",
    organizationName: "Chinook Media",
    planTier: "STARTER",
    subject: "How to export 500 tracked keyword rankings to CSV?",
    category: "FEATURE_REQUEST",
    priority: "LOW",
    status: "RESOLVED",
    slaMinutesRemaining: 240,
    assignedTo: "Support Bot",
    createdAt: "1 day ago",
    lastResponseAt: "20 hours ago",
  },
]

let IN_MEMORY_ANNOUNCEMENTS: AdminAnnouncement[] = [
  {
    id: "anc_1",
    title: "Scheduled Maintenance: Core Web Vitals Crawler Engine",
    message: "We are upgrading our Chromium crawler cluster on Sunday, Sept 14 between 02:00 - 04:00 UTC. Live site audits may experience minor delays.",
    type: "MAINTENANCE",
    targetAudience: "ALL",
    isActive: true,
    dismissible: true,
    startsAt: "2025-09-10T00:00:00Z",
    expiresAt: "2025-09-15T00:00:00Z",
  },
  {
    id: "anc_2",
    title: "New Feature: Full White-Label Agency Portals & Developer REST API v1 Released!",
    message: "Agency and Enterprise users can now configure custom domains, email branding, and programmatic API access via Developer Settings.",
    type: "FEATURE",
    targetAudience: "AGENCY_ENTERPRISE",
    isActive: true,
    dismissible: true,
    startsAt: "2025-09-09T00:00:00Z",
    expiresAt: "2025-09-30T00:00:00Z",
  },
]

// ===========================================================================
// ADMIN SERVICE IMPLEMENTATION
// ===========================================================================

export const AdminService = {
  /**
   * 1. 10 Executive Dashboard Metrics
   */
  async getDashboardMetrics(): Promise<AdminMetrics> {
    let dbUsersCount = IN_MEMORY_USERS.length
    let dbOrgsCount = IN_MEMORY_ORGANIZATIONS.length

    try {
      const uCount = await db.user.count()
      if (uCount > 0) dbUsersCount = uCount
    } catch {
      // Offline fallback
    }

    return {
      totalUsers: 14820 + (dbUsersCount - 6),
      totalUsersGrowth: "+12.4% MoM",
      activeUsers: 9450,
      activeUsersRatio: "63.8% MAU / DAU",
      mrr: 142850,
      mrrGrowth: "+18.2% MoM",
      arr: 1714200,
      arrGrowth: "+22.1% YoY",
      newCustomers: 342,
      newCustomersChange: "+18.3% vs last month",
      churnRate: 1.4,
      churnRateBenchmark: "Industry benchmark: 3.5%",
      conversionRate: 4.8,
      conversionRateChange: "+0.6% vs last quarter",
      apiRequests: 4820000,
      apiRequests24h: 382400,
      seoAudits: 52140,
      seoAuditsGrowth: "+24.5% MoM",
      aiRequests: 892400,
      aiRequestsGrowth: "+38.9% MoM",
      lastUpdated: new Date().toISOString(),
    }
  },

  /**
   * 2. Users Capability
   */
  async getUsers(search = ""): Promise<AdminUser[]> {
    const list = [...IN_MEMORY_USERS]
    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.organizationName.toLowerCase().includes(q)
    )
  },

  async updateUserRole(userId: string, newRole: "USER" | "SUPER_ADMIN"): Promise<AdminUser | null> {
    const user = IN_MEMORY_USERS.find((u) => u.id === userId)
    if (!user) return null
    user.role = newRole
    AdminService.logAuditAction("admin@topseotool.net", "user.role_changed", `${user.email} -> ${newRole}`)
    return user
  },

  async toggleUserStatus(userId: string): Promise<AdminUser | null> {
    const user = IN_MEMORY_USERS.find((u) => u.id === userId)
    if (!user) return null
    user.status = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE"
    AdminService.logAuditAction("admin@topseotool.net", "user.status_toggled", `${user.email} -> ${user.status}`)
    return user
  },

  /**
   * 3. Organizations Capability
   */
  async getOrganizations(): Promise<AdminOrganization[]> {
    return [...IN_MEMORY_ORGANIZATIONS]
  },

  async updateOrgPlan(orgId: string, plan: AdminOrganization["planTier"]): Promise<AdminOrganization | null> {
    const org = IN_MEMORY_ORGANIZATIONS.find((o) => o.id === orgId)
    if (!org) return null
    org.planTier = plan
    org.mrr = plan === "ENTERPRISE" ? 1250 : plan === "AGENCY" ? 499 : plan === "PRO" ? 199 : plan === "STARTER" ? 79 : 0
    AdminService.logAuditAction("admin@topseotool.net", "organization.plan_changed", `${org.name} -> ${plan}`)
    return org
  },

  /**
   * 4. Subscriptions Capability
   */
  async getSubscriptions(): Promise<AdminSubscription[]> {
    return IN_MEMORY_ORGANIZATIONS.map((org, i) => ({
      id: `sub_${org.id}`,
      organizationId: org.id,
      organizationName: org.name,
      plan: org.planTier,
      status: org.status,
      billingCycle: i % 2 === 0 ? "MONTHLY" : "ANNUAL",
      amountUsd: org.mrr,
      currentPeriodEnd: "2026-10-15T00:00:00.000Z",
      stripeCustomerId: `cus_live_${org.id.replace("org_", "")}982a`,
      stripeSubscriptionId: `sub_live_${org.id.replace("org_", "")}887c`,
      cancelAtPeriodEnd: org.status === "PAST_DUE",
    }))
  },

  /**
   * 5. Revenue Capability
   */
  async getRevenueReport(): Promise<AdminRevenueReport> {
    return {
      mrr: 142850,
      arr: 1714200,
      netRevenueGrowthMoM: "+18.2%",
      arpuUsd: 128.5,
      ltvUsd: 3840,
      churnNetPct: 1.4,
      refundRatePct: 0.2,
      byPlan: [
        { plan: "Enterprise", mrr: 68750, customers: 55, sharePct: 48.1 },
        { plan: "Agency", mrr: 44910, customers: 90, sharePct: 31.4 },
        { plan: "Pro", mrr: 21890, customers: 110, sharePct: 15.3 },
        { plan: "Starter", mrr: 7300, customers: 92, sharePct: 5.2 },
      ],
      monthlyTrajectory: [
        { month: "Apr", mrr: 98000, newMrr: 12000, churnMrr: 1400 },
        { month: "May", mrr: 108400, newMrr: 13200, churnMrr: 1600 },
        { month: "Jun", mrr: 119200, newMrr: 14800, churnMrr: 1500 },
        { month: "Jul", mrr: 128900, newMrr: 16100, churnMrr: 1700 },
        { month: "Aug", mrr: 136400, newMrr: 17400, churnMrr: 1800 },
        { month: "Sep", mrr: 142850, newMrr: 18900, churnMrr: 1950 },
      ],
      recentTransactions: [
        {
          id: "tx_9481",
          organizationName: "TechScale Global",
          customerEmail: "billing@techscale.io",
          amountUsd: 1250,
          status: "PAID",
          plan: "Enterprise (Monthly)",
          date: "Today, 09:14 AM",
          receiptUrl: "https://dashboard.stripe.com/test/payments/tx_9481",
        },
        {
          id: "tx_9480",
          organizationName: "ABC Digital Agency",
          customerEmail: "sarah@abcdigital.com",
          amountUsd: 499,
          status: "PAID",
          plan: "Agency (Monthly)",
          date: "Today, 04:30 AM",
          receiptUrl: "https://dashboard.stripe.com/test/payments/tx_9480",
        },
        {
          id: "tx_9479",
          organizationName: "GrowthVortex Lab",
          customerEmail: "elena@growthvortex.co",
          amountUsd: 199,
          status: "PAID",
          plan: "Pro (Monthly)",
          date: "Yesterday",
          receiptUrl: "https://dashboard.stripe.com/test/payments/tx_9479",
        },
        {
          id: "tx_9478",
          organizationName: "Apex Hyperion Inc",
          customerEmail: "billing@hyperion-apex.com",
          amountUsd: 199,
          status: "FAILED",
          plan: "Pro (Monthly)",
          date: "2 days ago",
          receiptUrl: "https://dashboard.stripe.com/test/payments/tx_9478",
        },
      ],
    }
  },

  /**
   * 6. Usage Capability
   */
  async getPlatformUsage() {
    return {
      activeCrawlerWorkers: 18,
      totalCrawlerCapacity: 25,
      crawlerUtilizationPct: 72,
      databasePoolConnections: 34,
      databasePoolMax: 100,
      redisMemoryUsedMb: 612,
      redisMemoryMaxMb: 2048,
      storageUsedTb: 2.84,
      storageTotalTb: 10.0,
      totalAuditsThisMonth: 52140,
      totalKeywordsTracked: 418000,
      totalBacklinksIndexed: 14280000,
    }
  },

  /**
   * 7. API Usage Capability
   */
  async getApiUsageReport() {
    return {
      totalRequests24h: 382400,
      avgLatencyMs: 24,
      rateLimit429Errors24h: 14,
      topEndpoints: [
        { path: "/api/v1/keywords", requests: 142000, avgLatency: "18ms", errorRate: "0.01%" },
        { path: "/api/v1/rankings", requests: 118000, avgLatency: "22ms", errorRate: "0.02%" },
        { path: "/api/v1/audit", requests: 64000, avgLatency: "145ms", errorRate: "0.08%" },
        { path: "/api/v1/backlinks", requests: 38000, avgLatency: "35ms", errorRate: "0.00%" },
        { path: "/api/v1/competitors", requests: 14400, avgLatency: "48ms", errorRate: "0.05%" },
        { path: "/api/v1/reports", requests: 6000, avgLatency: "320ms", errorRate: "0.12%" },
      ],
      topTenants: [
        { organization: "TechScale Global", requests24h: 184000, rateLimitPerMin: 240, limitHits: 0 },
        { organization: "ABC Digital Agency", requests24h: 92000, rateLimitPerMin: 120, limitHits: 2 },
        { organization: "GrowthVortex Lab", requests24h: 48000, rateLimitPerMin: 60, limitHits: 12 },
      ],
    }
  },

  /**
   * 8. System Health Capability
   */
  async getSystemHealth(): Promise<AdminSystemHealth> {
    return {
      overallStatus: "HEALTHY",
      uptimePct: 99.98,
      p95LatencyMs: 42,
      serverMetrics: {
        cpuUsagePct: 24.8,
        memoryUsedGb: 6.2,
        memoryTotalGb: 16.0,
        activeConnections: 148,
        crawlWorkerLoadPct: 68,
      },
      services: [
        {
          name: "PostgreSQL Database (Primary)",
          category: "DATABASE",
          status: "OPERATIONAL",
          latencyMs: 3,
          uptimePct: 99.99,
          details: "Master cluster node healthy; replication lag 0ms",
        },
        {
          name: "Redis Cache & Pub/Sub",
          category: "CACHE",
          status: "OPERATIONAL",
          latencyMs: 1,
          uptimePct: 100.0,
          details: "Cache hit ratio 94.2%; memory pool 30% utilized",
        },
        {
          name: "Headless Chromium Crawler Cluster",
          category: "CRAWLER",
          status: "OPERATIONAL",
          latencyMs: 180,
          uptimePct: 99.94,
          details: "25 concurrent Playwright nodes active",
        },
        {
          name: "OpenAI GPT-4o API Gateway",
          category: "AI_INFERENCE",
          status: "OPERATIONAL",
          latencyMs: 420,
          uptimePct: 99.95,
          details: "Latency nominal; prompt cache active",
        },
        {
          name: "Anthropic Claude 3.5 Sonnet Gateway",
          category: "AI_INFERENCE",
          status: "OPERATIONAL",
          latencyMs: 510,
          uptimePct: 99.92,
          details: "Writing assistant generation pipeline nominal",
        },
        {
          name: "Perplexity Sonar & Google Gemini Gateway",
          category: "AI_INFERENCE",
          status: "OPERATIONAL",
          latencyMs: 380,
          uptimePct: 99.96,
          details: "Multi-model search engine visibility scanning",
        },
        {
          name: "S3 Object Storage & Cloudflare CDN",
          category: "STORAGE",
          status: "OPERATIONAL",
          latencyMs: 12,
          uptimePct: 100.0,
          details: "White-label assets and PDF report distribution",
        },
        {
          name: "Outbound Webhooks Event Dispatcher",
          category: "EDGE",
          status: "OPERATIONAL",
          latencyMs: 45,
          uptimePct: 99.99,
          details: "Queue buffer 0 jobs; delivery p99 under 1.2s",
        },
      ],
    }
  },

  /**
   * 9. Failed Jobs Capability
   */
  async getFailedJobs(): Promise<AdminFailedJob[]> {
    const queueFailed = queueManager.getFailedJobs().map((j) => ({
      id: j.id,
      type: j.type,
      status: j.status,
      organizationName: "System Workspace",
      errorMessage: j.error || "Execution terminated unexpectedly",
      stackSnippet: `Job payload: ${JSON.stringify(j.payload)}`,
      attempts: j.attempts,
      maxAttempts: 3,
      failedAt: "Just now",
    }))
    return [...queueFailed, ...IN_MEMORY_FAILED_JOBS]
  },

  async retryJob(jobId: string): Promise<boolean> {
    const fromQueue = queueManager.retryJob(jobId)
    if (fromQueue) return true
    const idx = IN_MEMORY_FAILED_JOBS.findIndex((j) => j.id === jobId)
    if (idx !== -1) {
      IN_MEMORY_FAILED_JOBS.splice(idx, 1)
      AdminService.logAuditAction("admin@topseotool.net", "job.retried", `Job ${jobId} rescheduled`)
      return true
    }
    return false
  },

  async retryAllFailedJobs(): Promise<number> {
    const countQueue = queueManager.retryAllFailed()
    const countMock = IN_MEMORY_FAILED_JOBS.length
    IN_MEMORY_FAILED_JOBS = []
    AdminService.logAuditAction("admin@topseotool.net", "job.retry_all", `Rescheduled ${countQueue + countMock} failed jobs`)
    return countQueue + countMock
  },

  /**
   * 10. Audit Logs Capability
   */
  async getAuditLogs(): Promise<AdminAuditLog[]> {
    return [...IN_MEMORY_AUDIT_LOGS]
  },

  logAuditAction(actorEmail: string, action: string, targetResource: string) {
    const newLog: AdminAuditLog = {
      id: `log_${Date.now()}`,
      actorEmail,
      actorRole: "SUPER_ADMIN",
      action,
      targetResource,
      ipAddress: "192.168.1.1",
      userAgent: "Admin Command Center Console",
      timestamp: "Just now",
    }
    IN_MEMORY_AUDIT_LOGS = [newLog, ...IN_MEMORY_AUDIT_LOGS.slice(0, 49)]
  },

  /**
   * 11. Feature Flags Capability
   */
  async getFeatureFlags(): Promise<AdminFeatureFlag[]> {
    return [...IN_MEMORY_FEATURE_FLAGS]
  },

  async toggleFeatureFlag(flagId: string): Promise<AdminFeatureFlag | null> {
    const flag = IN_MEMORY_FEATURE_FLAGS.find((f) => f.id === flagId)
    if (!flag) return null
    flag.isEnabled = !flag.isEnabled
    flag.updatedAt = new Date().toISOString()
    AdminService.logAuditAction("admin@topseotool.net", "feature_flag.toggled", `${flag.name} (${flag.isEnabled ? "ON" : "OFF"})`)
    return flag
  },

  async updateFlagRollout(flagId: string, rolloutPercentage: number): Promise<AdminFeatureFlag | null> {
    const flag = IN_MEMORY_FEATURE_FLAGS.find((f) => f.id === flagId)
    if (!flag) return null
    flag.rolloutPercentage = Math.max(0, Math.min(100, rolloutPercentage))
    flag.updatedAt = new Date().toISOString()
    AdminService.logAuditAction("admin@topseotool.net", "feature_flag.rollout_changed", `${flag.name} -> ${rolloutPercentage}%`)
    return flag
  },

  /**
   * 12. AI Usage Capability
   */
  async getAIUsageReport(): Promise<AdminAIUsageReport> {
    return {
      totalTokensConsumed24h: 38400000,
      estimatedCostUsd24h: 184.2,
      promptCacheHitRatePct: 78.4,
      models: [
        {
          modelName: "GPT-4o (OpenAI)",
          provider: "OpenAI",
          requests24h: 42000,
          inputTokens: 18400000,
          outputTokens: 4200000,
          costUsd: 98.4,
          avgLatencyMs: 420,
        },
        {
          modelName: "Claude 3.5 Sonnet (Anthropic)",
          provider: "Anthropic",
          requests24h: 24000,
          inputTokens: 8200000,
          outputTokens: 2100000,
          costUsd: 46.2,
          avgLatencyMs: 510,
        },
        {
          modelName: "Gemini 1.5 Pro (Google)",
          provider: "Google",
          requests24h: 18000,
          inputTokens: 5900000,
          outputTokens: 1400000,
          costUsd: 22.8,
          avgLatencyMs: 380,
        },
        {
          modelName: "Sonar Online (Perplexity)",
          provider: "Perplexity",
          requests24h: 12000,
          inputTokens: 3100000,
          outputTokens: 800000,
          costUsd: 16.8,
          avgLatencyMs: 340,
        },
      ],
      topTenantsBySpend: [
        { organizationName: "TechScale Global", plan: "Enterprise", tokenUsage: 14200000, costUsd: 68.2 },
        { organizationName: "ABC Digital Agency", plan: "Agency", tokenUsage: 8900000, costUsd: 42.5 },
        { organizationName: "GrowthVortex Lab", plan: "Pro", tokenUsage: 4100000, costUsd: 19.8 },
      ],
    }
  },

  /**
   * 13. Abuse Detection Capability
   */
  async getAbuseAlerts(): Promise<AdminAbuseAlert[]> {
    return [...IN_MEMORY_ABUSE_ALERTS]
  },

  async resolveAbuseAlert(alertId: string, action: "RESOLVED" | "BLOCKED"): Promise<AdminAbuseAlert | null> {
    const alert = IN_MEMORY_ABUSE_ALERTS.find((a) => a.id === alertId)
    if (!alert) return null
    alert.status = action
    AdminService.logAuditAction("admin@topseotool.net", "abuse_alert.resolved", `${alert.targetEntity} marked ${action}`)
    return alert
  },

  /**
   * 14. Support Tickets Capability
   */
  async getSupportTickets(): Promise<AdminSupportTicket[]> {
    return [...IN_MEMORY_TICKETS]
  },

  async updateTicketStatus(ticketId: string, status: AdminSupportTicket["status"]): Promise<AdminSupportTicket | null> {
    const t = IN_MEMORY_TICKETS.find((ticket) => ticket.id === ticketId)
    if (!t) return null
    t.status = status
    t.lastResponseAt = "Just now"
    AdminService.logAuditAction("admin@topseotool.net", "ticket.status_changed", `${t.ticketNumber} -> ${status}`)
    return t
  },

  /**
   * 15. Announcements Capability
   */
  async getAnnouncements(): Promise<AdminAnnouncement[]> {
    return [...IN_MEMORY_ANNOUNCEMENTS]
  },

  async createAnnouncement(data: Omit<AdminAnnouncement, "id">): Promise<AdminAnnouncement> {
    const newAnc: AdminAnnouncement = {
      id: `anc_${Date.now()}`,
      ...data,
    }
    IN_MEMORY_ANNOUNCEMENTS = [newAnc, ...IN_MEMORY_ANNOUNCEMENTS]
    AdminService.logAuditAction("admin@topseotool.net", "announcement.created", newAnc.title)
    return newAnc
  },

  async toggleAnnouncement(id: string): Promise<AdminAnnouncement | null> {
    const anc = IN_MEMORY_ANNOUNCEMENTS.find((a) => a.id === id)
    if (!anc) return null
    anc.isActive = !anc.isActive
    AdminService.logAuditAction("admin@topseotool.net", "announcement.toggled", `${anc.title} (${anc.isActive ? "ACTIVE" : "INACTIVE"})`)
    return anc
  },

  async deleteAnnouncement(id: string): Promise<boolean> {
    const idx = IN_MEMORY_ANNOUNCEMENTS.findIndex((a) => a.id === id)
    if (idx === -1) return false
    const [del] = IN_MEMORY_ANNOUNCEMENTS.splice(idx, 1)
    AdminService.logAuditAction("admin@topseotool.net", "announcement.deleted", del.title)
    return true
  },
}
