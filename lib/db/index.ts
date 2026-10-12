import crypto from "node:crypto"
import { getDb, saveDb, PLAN_DEFINITIONS } from "./store"
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
  PlanTier,
} from "./types"

export * from "./types"
export { PLAN_DEFINITIONS } from "./store"

// ─────────────────────────────────────────────────────────────
// USERS REPOSITORY
// ─────────────────────────────────────────────────────────────

export async function findUserById(id: string): Promise<User | null> {
  const db = getDb()
  return db.users.find((u) => u.id === id) || null
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = getDb()
  const normalized = email.toLowerCase().trim()
  return db.users.find((u) => u.email.toLowerCase() === normalized) || null
}

export async function createUser(data: {
  name: string
  email: string
  passwordHash: string
  role?: "customer" | "admin"
  plan?: PlanTier
}): Promise<User> {
  const db = getDb()
  const now = new Date().toISOString()
  const plan = data.plan || "free"
  const planInfo = PLAN_DEFINITIONS[plan] || PLAN_DEFINITIONS.free

  const newUser: User = {
    id: `usr_${crypto.randomBytes(8).toString("hex")}`,
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    passwordHash: data.passwordHash,
    role: data.role || "customer",
    status: "active",
    plan,
    scanCredits: planInfo.monthlyScanCredits,
    totalScansRun: 0,
    createdAt: now,
    updatedAt: now,
  }

  db.users.push(newUser)

  // Create initial subscription record
  db.subscriptions.push({
    id: `sub_${crypto.randomBytes(8).toString("hex")}`,
    userId: newUser.id,
    plan,
    status: "active",
    currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
    createdAt: now,
    updatedAt: now,
  })

  saveDb(db)
  return newUser
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const db = getDb()
  const idx = db.users.findIndex((u) => u.id === id)
  if (idx === -1) return null

  db.users[idx] = {
    ...db.users[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  saveDb(db)
  return db.users[idx]
}

export async function deleteUser(id: string): Promise<boolean> {
  const db = getDb()
  const initialLen = db.users.length
  db.users = db.users.filter((u) => u.id !== id)
  db.websites = db.websites.filter((w) => w.userId !== id)
  db.scans = db.scans.filter((s) => s.userId !== id)
  db.reports = db.reports.filter((r) => r.userId !== id)
  db.subscriptions = db.subscriptions.filter((s) => s.userId !== id)
  saveDb(db)
  return db.users.length < initialLen
}

export async function listUsers(): Promise<User[]> {
  const db = getDb()
  return [...db.users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// ─────────────────────────────────────────────────────────────
// WEBSITES REPOSITORY
// ─────────────────────────────────────────────────────────────

export async function listWebsitesByUserId(userId: string): Promise<Website[]> {
  const db = getDb()
  return db.websites.filter((w) => w.userId === userId)
}

export async function findWebsiteById(id: string): Promise<Website | null> {
  const db = getDb()
  return db.websites.find((w) => w.id === id) || null
}

export async function createWebsite(data: {
  userId: string
  domain: string
  brandName: string
}): Promise<Website> {
  const db = getDb()
  const now = new Date().toISOString()
  const cleanDomain = data.domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/.*$/, "")

  const newWebsite: Website = {
    id: `site_${crypto.randomBytes(8).toString("hex")}`,
    userId: data.userId,
    domain: cleanDomain,
    brandName: data.brandName.trim(),
    verified: false,
    verificationToken: `topseotool-verify-${crypto.randomBytes(12).toString("hex")}`,
    monitoringEnabled: true,
    monitoringFrequency: "weekly",
    createdAt: now,
    updatedAt: now,
  }

  db.websites.push(newWebsite)
  saveDb(db)
  return newWebsite
}

export async function updateWebsite(id: string, updates: Partial<Website>): Promise<Website | null> {
  const db = getDb()
  const idx = db.websites.findIndex((w) => w.id === id)
  if (idx === -1) return null

  db.websites[idx] = {
    ...db.websites[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  saveDb(db)
  return db.websites[idx]
}

export async function deleteWebsite(id: string): Promise<boolean> {
  const db = getDb()
  const initialLen = db.websites.length
  db.websites = db.websites.filter((w) => w.id !== id)
  db.competitors = db.competitors.filter((c) => c.websiteId !== id)
  saveDb(db)
  return db.websites.length < initialLen
}

// ─────────────────────────────────────────────────────────────
// SCANS REPOSITORY
// ─────────────────────────────────────────────────────────────

export async function listScansByUserId(userId: string): Promise<ScanRecord[]> {
  const db = getDb()
  return db.scans
    .filter((s) => s.userId === userId)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
}

export async function listAllScans(): Promise<ScanRecord[]> {
  const db = getDb()
  return [...db.scans].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
}

export async function findScanById(id: string): Promise<ScanRecord | null> {
  const db = getDb()
  return db.scans.find((s) => s.id === id) || null
}

export async function createScan(data: Omit<ScanRecord, "id">): Promise<ScanRecord> {
  const db = getDb()
  const newScan: ScanRecord = {
    ...data,
    id: `scan_${crypto.randomBytes(8).toString("hex")}`,
  }

  db.scans.push(newScan)

  // Increment user scan count & deduct credit if registered user
  if (data.userId) {
    const user = db.users.find((u) => u.id === data.userId)
    if (user) {
      user.totalScansRun += 1
      user.scanCredits = Math.max(0, user.scanCredits - 1)
      user.updatedAt = new Date().toISOString()
    }
  }

  saveDb(db)
  return newScan
}

export async function updateScan(id: string, updates: Partial<ScanRecord>): Promise<ScanRecord | null> {
  const db = getDb()
  const idx = db.scans.findIndex((s) => s.id === id)
  if (idx === -1) return null

  db.scans[idx] = {
    ...db.scans[idx],
    ...updates,
  }

  saveDb(db)
  return db.scans[idx]
}

// ─────────────────────────────────────────────────────────────
// REPORTS REPOSITORY
// ─────────────────────────────────────────────────────────────

export async function createReport(data: {
  userId?: string
  scanId: string
  domain: string
  brandName: string
  data: any
  isPublic?: boolean
}): Promise<ReportRecord> {
  const db = getDb()
  const newReport: ReportRecord = {
    id: `rep_${crypto.randomBytes(10).toString("hex")}`,
    userId: data.userId,
    scanId: data.scanId,
    domain: data.domain,
    brandName: data.brandName,
    isPublic: data.isPublic ?? true,
    shareToken: crypto.randomBytes(16).toString("hex"),
    data: data.data,
    createdAt: new Date().toISOString(),
  }

  db.reports.push(newReport)
  saveDb(db)
  return newReport
}

export async function findReportById(id: string): Promise<ReportRecord | null> {
  const db = getDb()
  return db.reports.find((r) => r.id === id) || null
}

export async function findReportByShareToken(token: string): Promise<ReportRecord | null> {
  const db = getDb()
  return db.reports.find((r) => r.shareToken === token) || null
}

export async function listReportsByUserId(userId: string): Promise<ReportRecord[]> {
  const db = getDb()
  return db.reports
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function updateReport(id: string, updates: Partial<ReportRecord>): Promise<ReportRecord | null> {
  const db = getDb()
  const idx = db.reports.findIndex((r) => r.id === id)
  if (idx === -1) return null

  db.reports[idx] = {
    ...db.reports[idx],
    ...updates,
  }

  saveDb(db)
  return db.reports[idx]
}

export async function deleteReport(id: string): Promise<boolean> {
  const db = getDb()
  const initialLen = db.reports.length
  db.reports = db.reports.filter((r) => r.id !== id)
  saveDb(db)
  return db.reports.length < initialLen
}

// ─────────────────────────────────────────────────────────────
// COMPETITORS REPOSITORY
// ─────────────────────────────────────────────────────────────

export async function listCompetitorsByUserId(userId: string): Promise<CompetitorRecord[]> {
  const db = getDb()
  return db.competitors.filter((c) => c.userId === userId)
}

export async function createCompetitor(data: {
  userId: string
  websiteId: string
  domain: string
  brandName: string
}): Promise<CompetitorRecord> {
  const db = getDb()
  const cleanDomain = data.domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/.*$/, "")

  const newComp: CompetitorRecord = {
    id: `comp_${crypto.randomBytes(8).toString("hex")}`,
    userId: data.userId,
    websiteId: data.websiteId,
    domain: cleanDomain,
    brandName: data.brandName.trim(),
    createdAt: new Date().toISOString(),
  }

  db.competitors.push(newComp)
  saveDb(db)
  return newComp
}

export async function deleteCompetitor(id: string, userId: string): Promise<boolean> {
  const db = getDb()
  const initialLen = db.competitors.length
  db.competitors = db.competitors.filter((c) => c.id !== id && c.userId === userId)
  saveDb(db)
  return db.competitors.length < initialLen
}

// ─────────────────────────────────────────────────────────────
// PROVIDERS REPOSITORY
// ─────────────────────────────────────────────────────────────

export async function listProviders(): Promise<ProviderConfigRecord[]> {
  const db = getDb()
  return db.providers
}

export async function updateProvider(
  id: string,
  updates: Partial<ProviderConfigRecord>
): Promise<ProviderConfigRecord | null> {
  const db = getDb()
  const idx = db.providers.findIndex((p) => p.id === id)
  if (idx === -1) return null

  db.providers[idx] = {
    ...db.providers[idx],
    ...updates,
    lastCheckedAt: new Date().toISOString(),
  }

  saveDb(db)
  return db.providers[idx]
}

// ─────────────────────────────────────────────────────────────
// SETTINGS REPOSITORY
// ─────────────────────────────────────────────────────────────

export async function getAllSettings(): Promise<Record<string, string>> {
  const db = getDb()
  const map: Record<string, string> = {}
  for (const s of db.settings) {
    map[s.key] = s.value
  }
  return map
}

export async function updateSetting(key: string, value: string, updatedBy = "admin"): Promise<void> {
  const db = getDb()
  const idx = db.settings.findIndex((s) => s.key === key)
  const now = new Date().toISOString()

  if (idx !== -1) {
    db.settings[idx] = { key, value, updatedAt: now, updatedBy }
  } else {
    db.settings.push({ key, value, updatedAt: now, updatedBy })
  }

  saveDb(db)
}

// ─────────────────────────────────────────────────────────────
// AUDIT LOGS REPOSITORY
// ─────────────────────────────────────────────────────────────

export async function logAdminAction(data: {
  actorId: string
  actorEmail: string
  action: string
  targetType: "user" | "scan" | "website" | "provider" | "settings" | "subscription"
  targetId: string
  details: string
  status?: "success" | "failure"
}): Promise<AdminAuditLogRecord> {
  const db = getDb()
  const newLog: AdminAuditLogRecord = {
    id: `log_${crypto.randomBytes(8).toString("hex")}`,
    actorId: data.actorId,
    actorEmail: data.actorEmail,
    action: data.action,
    targetType: data.targetType,
    targetId: data.targetId,
    details: data.details,
    status: data.status || "success",
    timestamp: new Date().toISOString(),
  }

  db.auditLogs.unshift(newLog)
  // Keep last 1000 logs to prevent bloat
  if (db.auditLogs.length > 1000) {
    db.auditLogs = db.auditLogs.slice(0, 1000)
  }

  saveDb(db)
  return newLog
}

export async function listAuditLogs(limit = 100): Promise<AdminAuditLogRecord[]> {
  const db = getDb()
  return db.auditLogs.slice(0, limit)
}
