// ============================================================
// TOPSEOTOOL — Enterprise Compliance & Security Audit Logger
// Comprehensive audit trails for SOC2 / ISO27001 readiness
// ============================================================

import { logger } from "@/lib/logger"
import { sanitizeForClient } from "./response-sanitizer"

export type SecurityAuditEventType =
  | "auth.login.success"
  | "auth.login.failed"
  | "auth.logout"
  | "auth.register"
  | "auth.password_reset"
  | "api_key.created"
  | "api_key.rotated"
  | "api_key.revoked"
  | "member.invited"
  | "member.role_changed"
  | "member.removed"
  | "org.created"
  | "org.updated"
  | "org.transfer"
  | "project.created"
  | "project.deleted"
  | "billing.plan_upgraded"
  | "billing.plan_downgraded"
  | "billing.canceled"
  | "billing.payment_failed"
  | "security.rate_limit_exceeded"
  | "security.csrf_blocked"
  | "security.unauthorized_access"
  | "admin.impersonation"
  | "admin.feature_flag_toggle"

export interface SecurityAuditRecord {
  id: string
  timestamp: string
  eventType: SecurityAuditEventType
  actorId?: string | null
  actorEmail?: string | null
  actorRole?: string | null
  organizationId?: string | null
  targetResource?: string | null
  targetResourceId?: string | null
  clientIp?: string | null
  userAgent?: string | null
  status: "SUCCESS" | "DENIED" | "FAILURE"
  metadata?: Record<string, unknown>
}

// In-memory ring buffer (up to 500 audit events) for admin monitoring
const AUDIT_BUFFER_MAX = 500
const auditLogBuffer: SecurityAuditRecord[] = []

/**
 * Log a security-critical audit event
 */
export async function logSecurityAudit(params: {
  eventType: SecurityAuditEventType
  actorId?: string | null
  actorEmail?: string | null
  actorRole?: string | null
  organizationId?: string | null
  targetResource?: string | null
  targetResourceId?: string | null
  clientIp?: string | null
  userAgent?: string | null
  status?: "SUCCESS" | "DENIED" | "FAILURE"
  metadata?: Record<string, unknown>
}): Promise<SecurityAuditRecord> {
  // Scrub any passwords, keys, or sensitive secrets from metadata before logging
  const cleanMetadata = params.metadata ? sanitizeForClient(params.metadata) : undefined

  const record: SecurityAuditRecord = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    timestamp: new Date().toISOString(),
    eventType: params.eventType,
    actorId: params.actorId ?? null,
    actorEmail: params.actorEmail ?? null,
    actorRole: params.actorRole ?? null,
    organizationId: params.organizationId ?? null,
    targetResource: params.targetResource ?? null,
    targetResourceId: params.targetResourceId ?? null,
    clientIp: params.clientIp ?? null,
    userAgent: params.userAgent ? params.userAgent.slice(0, 256) : null,
    status: params.status ?? "SUCCESS",
    metadata: cleanMetadata,
  }

  // Prepend to ring buffer
  auditLogBuffer.unshift(record)
  if (auditLogBuffer.length > AUDIT_BUFFER_MAX) {
    auditLogBuffer.pop()
  }

  logger.info(
    `[SECURITY AUDIT] ${record.eventType} by ${record.actorEmail || record.actorId || "anonymous"} (${record.status})`,
    "AUDIT",
    {
      action: record.eventType,
      target: record.targetResource,
      status: record.status,
    }
  )

  return record
}

/**
 * Retrieve recent security audit logs (e.g. for Admin Console or Compliance Review)
 */
export function getRecentSecurityAudits(limit = 100, organizationId?: string): SecurityAuditRecord[] {
  let records = auditLogBuffer
  if (organizationId) {
    records = records.filter((r) => r.organizationId === organizationId)
  }
  return records.slice(0, limit)
}
