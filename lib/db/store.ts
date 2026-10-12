import fs from "node:fs"
import path from "node:path"
import bcrypt from "bcryptjs"
import type {
  User,
  Website,
  ScanRecord,
  ReportRecord,
  CompetitorRecord,
  SubscriptionRecord,
  ProviderConfigRecord,
  SystemSettingRecord,
  AdminAuditLogRecord,
  PlanEntitlement,
} from "./types"

const DATA_DIR = path.join(process.cwd(), "data")
const DB_FILE = path.join(DATA_DIR, "topseotool.db.json")

export interface DatabaseSchema {
  users: User[]
  websites: Website[]
  scans: ScanRecord[]
  reports: ReportRecord[]
  competitors: CompetitorRecord[]
  subscriptions: SubscriptionRecord[]
  providers: ProviderConfigRecord[]
  settings: SystemSettingRecord[]
  auditLogs: AdminAuditLogRecord[]
}

export const PLAN_DEFINITIONS: Record<string, PlanEntitlement> = {
  free: {
    id: "free",
    name: "Community Free",
    priceMonthly: 0,
    maxWebsites: 1,
    maxCompetitorsPerSite: 1,
    monthlyScanCredits: 5,
    features: [
      "1 Tracked Domain",
      "5 Monthly Scans",
      "Public Search Grounding",
      "Basic Instant Fixes",
    ],
  },
  pro: {
    id: "pro",
    name: "GEO Specialist Pro",
    priceMonthly: 49,
    maxWebsites: 5,
    maxCompetitorsPerSite: 5,
    monthlyScanCredits: 100,
    features: [
      "5 Tracked Domains",
      "100 Monthly Scans",
      "6 Multi-Engine Coverage",
      "Competitor Benchmark Radar",
      "PDF & Shareable Reports",
      "Weekly Scheduled Monitoring",
    ],
  },
  agency: {
    id: "agency",
    name: "Agency Suite",
    priceMonthly: 199,
    maxWebsites: 25,
    maxCompetitorsPerSite: 10,
    monthlyScanCredits: 500,
    features: [
      "25 Client Domains",
      "500 Monthly Scans",
      "White-Label PDF Reports",
      "Daily Automated Surveillance",
      "Developer API Access",
      "Priority Crawler Queue",
    ],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise Custom",
    priceMonthly: 499,
    maxWebsites: 100,
    maxCompetitorsPerSite: 25,
    monthlyScanCredits: 2500,
    features: [
      "Unlimited Tracked Domains",
      "2,500 Monthly Scans",
      "Dedicated Scraping Proxy IP",
      "Custom SLA & Webhooks",
      "Team Multi-Seats & RBAC",
      "Direct Architect Support",
    ],
  },
}

function getDefaultProviders(): ProviderConfigRecord[] {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 10)
  const hasOpenAi = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 10)
  const hasPerplexity = Boolean(process.env.PERPLEXITY_API_KEY && process.env.PERPLEXITY_API_KEY.trim().length > 10)
  const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim().length > 10)

  const now = new Date().toISOString()
  return [
    {
      id: "gemini",
      name: "Google Gemini 2.0 (Google Search Grounding)",
      enabled: true,
      hasApiKey: hasGemini,
      lastCheckedAt: now,
      status: hasGemini ? "operational" : "degraded",
    },
    {
      id: "openai",
      name: "OpenAI SearchGPT / GPT-4o",
      enabled: true,
      hasApiKey: hasOpenAi,
      lastCheckedAt: now,
      status: hasOpenAi ? "operational" : "degraded",
    },
    {
      id: "perplexity",
      name: "Perplexity AI Sonar Pro",
      enabled: true,
      hasApiKey: hasPerplexity,
      lastCheckedAt: now,
      status: hasPerplexity ? "operational" : "degraded",
    },
    {
      id: "claude",
      name: "Anthropic Claude 3.5 Sonnet",
      enabled: true,
      hasApiKey: hasAnthropic,
      lastCheckedAt: now,
      status: hasAnthropic ? "operational" : "degraded",
    },
    {
      id: "copilot",
      name: "Microsoft Copilot (Bing Search)",
      enabled: true,
      hasApiKey: false,
      lastCheckedAt: now,
      status: "operational",
    },
    {
      id: "grok",
      name: "xAI Grok-2 Real-Time",
      enabled: true,
      hasApiKey: false,
      lastCheckedAt: now,
      status: "operational",
    },
  ]
}

function getDefaultSettings(): SystemSettingRecord[] {
  const now = new Date().toISOString()
  return [
    { key: "appName", value: "TOPSEOTOOL", updatedAt: now, updatedBy: "system" },
    { key: "freeScanLimitDaily", value: "3", updatedAt: now, updatedBy: "system" },
    { key: "maxScanTimeoutSeconds", value: "45", updatedAt: now, updatedBy: "system" },
    { key: "rateLimitPerMinute", value: "30", updatedAt: now, updatedBy: "system" },
    { key: "maintenanceMode", value: "false", updatedAt: now, updatedBy: "system" },
    { key: "defaultReportVisibility", value: "public_with_link", updatedAt: now, updatedBy: "system" },
  ]
}

function getDefaultAdmin(): User {
  const email = (process.env.ADMIN_INITIAL_EMAIL || "admin@topseotool.net").toLowerCase().trim()
  const password = process.env.ADMIN_INITIAL_PASSWORD || "AdminPassword123!"
  const now = new Date().toISOString()

  return {
    id: "usr_admin_001",
    name: "System Administrator",
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    role: "admin",
    status: "active",
    plan: "enterprise",
    scanCredits: 99999,
    totalScansRun: 0,
    createdAt: now,
    updatedAt: now,
  }
}

function getDefaultDemoCustomer(): User {
  const now = new Date().toISOString()
  return {
    id: "usr_demo_002",
    name: "Sarah Jenkins",
    email: "customer@topseotool.net",
    passwordHash: bcrypt.hashSync("Customer123!", 10),
    role: "customer",
    status: "active",
    plan: "pro",
    scanCredits: 85,
    totalScansRun: 15,
    createdAt: now,
    updatedAt: now,
  }
}

function initializeDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, "utf-8")
      const parsed = JSON.parse(raw) as Partial<DatabaseSchema>
      return {
        users: parsed.users || [getDefaultAdmin(), getDefaultDemoCustomer()],
        websites: parsed.websites || [],
        scans: parsed.scans || [],
        reports: parsed.reports || [],
        competitors: parsed.competitors || [],
        subscriptions: parsed.subscriptions || [],
        providers: parsed.providers && parsed.providers.length ? parsed.providers : getDefaultProviders(),
        settings: parsed.settings && parsed.settings.length ? parsed.settings : getDefaultSettings(),
        auditLogs: parsed.auditLogs || [],
      }
    } catch {
      // Fallback if corrupt
    }
  }

  const initial: DatabaseSchema = {
    users: [getDefaultAdmin(), getDefaultDemoCustomer()],
    websites: [
      {
        id: "site_demo_1",
        userId: "usr_demo_002",
        domain: "linear.app",
        brandName: "Linear",
        verified: true,
        monitoringEnabled: true,
        monitoringFrequency: "weekly",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    scans: [],
    reports: [],
    competitors: [
      {
        id: "comp_1",
        userId: "usr_demo_002",
        websiteId: "site_demo_1",
        domain: "jira.atlassian.com",
        brandName: "Jira",
        createdAt: new Date().toISOString(),
      },
      {
        id: "comp_2",
        userId: "usr_demo_002",
        websiteId: "site_demo_1",
        domain: "asana.com",
        brandName: "Asana",
        createdAt: new Date().toISOString(),
      },
    ],
    subscriptions: [
      {
        id: "sub_demo_1",
        userId: "usr_demo_002",
        plan: "pro",
        status: "active",
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    providers: getDefaultProviders(),
    settings: getDefaultSettings(),
    auditLogs: [
      {
        id: "log_init_001",
        actorId: "usr_admin_001",
        actorEmail: "admin@topseotool.net",
        action: "system.bootstrap",
        targetType: "settings",
        targetId: "global",
        details: "TopSEOTool enterprise platform database initialized with default secure configuration",
        status: "success",
        timestamp: new Date().toISOString(),
      },
    ],
  }

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8")
  } catch (err) {
    console.error("Failed to write initial db file:", err)
  }

  return initial
}

let memoryDb: DatabaseSchema = initializeDatabase()

export function getDb(): DatabaseSchema {
  if (!memoryDb) {
    memoryDb = initializeDatabase()
  }
  return memoryDb
}

export function saveDb(updated: DatabaseSchema): void {
  memoryDb = updated
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(updated, null, 2), "utf-8")
  } catch (err) {
    console.error("Failed to persist database state to disk:", err)
  }
}
