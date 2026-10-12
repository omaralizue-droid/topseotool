export type UserRole = "customer" | "admin"
export type UserStatus = "active" | "suspended"
export type PlanTier = "free" | "pro" | "agency" | "enterprise"
export type ScanStatus = "pending" | "running" | "completed" | "failed"
export type ProviderStatus = "operational" | "degraded" | "disabled" | "offline"

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  role: UserRole
  status: UserStatus
  plan: PlanTier
  scanCredits: number
  totalScansRun: number
  createdAt: string
  updatedAt: string
}

export interface Website {
  id: string
  userId: string
  domain: string
  brandName: string
  verified: boolean
  verificationToken?: string
  monitoringEnabled: boolean
  monitoringFrequency: "daily" | "weekly" | "monthly"
  createdAt: string
  updatedAt: string
}

export interface ScanRecord {
  id: string
  userId?: string
  websiteId?: string
  domain: string
  brandName: string
  status: ScanStatus
  overallScore: number
  readinessScore: number
  visibilityScore: number | null
  tierLabel: string
  checksCount: number
  mentionsCount: number
  startedAt: string
  completedAt?: string
  error?: string
}

export interface ReportRecord {
  id: string
  userId?: string
  scanId: string
  domain: string
  brandName: string
  isPublic: boolean
  shareToken: string
  data: any // Full SiteSnapshot, checks, profile, probes, aiReport
  createdAt: string
}

export interface CompetitorRecord {
  id: string
  userId: string
  websiteId: string
  domain: string
  brandName: string
  createdAt: string
}

export interface SubscriptionRecord {
  id: string
  userId: string
  plan: PlanTier
  status: "active" | "canceled" | "past_due" | "trialing"
  currentPeriodEnd: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  createdAt: string
  updatedAt: string
}

export interface ProviderConfigRecord {
  id: "gemini" | "openai" | "perplexity" | "claude" | "copilot" | "grok"
  name: string
  enabled: boolean
  hasApiKey: boolean
  lastCheckedAt: string
  status: ProviderStatus
  lastError?: string
}

export interface SystemSettingRecord {
  key: string
  value: string
  updatedAt: string
  updatedBy: string
}

export interface AdminAuditLogRecord {
  id: string
  actorId: string
  actorEmail: string
  action: string
  targetType: "user" | "scan" | "website" | "provider" | "settings" | "subscription"
  targetId: string
  details: string
  status: "success" | "failure"
  timestamp: string
}

export interface PlanEntitlement {
  id: PlanTier
  name: string
  priceMonthly: number
  maxWebsites: number
  maxCompetitorsPerSite: number
  monthlyScanCredits: number
  features: string[]
}
