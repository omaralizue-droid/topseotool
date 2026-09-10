// ============================================================
// TOPSEOTOOL — Multi-Tenant Role-Based Access Control (RBAC)
// Organization Roles:
// 1. OWNER: Full access (Ownership transfer, org deletion, billing ownership).
// 2. ADMIN: Manage users, projects, billing and settings.
// 3. MANAGER: Manage SEO projects, reports and team workflows.
// 4. MEMBER: Limited project access (View-only analytics & audits).
// 5. API_USER: Enterprise API user accessing REST API within org rate limits.
// ============================================================

export type OrgRole = "OWNER" | "ADMIN" | "MANAGER" | "MEMBER" | "API_USER"

export const ROLE_HIERARCHY: Record<OrgRole, number> = {
  OWNER: 5,
  ADMIN: 4,
  MANAGER: 3,
  MEMBER: 2,
  API_USER: 1,
}

export type OrgPermission =
  | "org:delete"
  | "org:transfer"
  | "org:update"
  | "users:manage"
  | "billing:manage"
  | "billing:view"
  | "settings:manage"
  | "projects:manage"
  | "projects:view"
  | "workflows:manage"
  | "reports:manage"
  | "reports:view"
  | "audits:run"
  | "api:access"
  | "api:keys_manage"

const ROLE_PERMISSIONS: Record<OrgRole, OrgPermission[]> = {
  // OWNER — Full access.
  OWNER: [
    "org:delete",
    "org:transfer",
    "org:update",
    "users:manage",
    "billing:manage",
    "billing:view",
    "settings:manage",
    "projects:manage",
    "projects:view",
    "workflows:manage",
    "reports:manage",
    "reports:view",
    "audits:run",
    "api:access",
    "api:keys_manage",
  ],

  // ADMIN — Manage users, projects, billing and settings.
  ADMIN: [
    "org:update",
    "users:manage",
    "billing:manage",
    "billing:view",
    "settings:manage",
    "projects:manage",
    "projects:view",
    "workflows:manage",
    "reports:manage",
    "reports:view",
    "audits:run",
    "api:access",
    "api:keys_manage",
  ],

  // MANAGER — Manage SEO projects, reports and team workflows.
  MANAGER: [
    "projects:manage",
    "projects:view",
    "workflows:manage",
    "reports:manage",
    "reports:view",
    "audits:run",
    "api:access",
  ],

  // MEMBER — Limited project access.
  MEMBER: [
    "projects:view",
    "reports:view",
    "audits:run",
  ],

  // ENTERPRISE API USER — Can access API according to organization's API limits.
  API_USER: [
    "api:access",
    "projects:view",
    "reports:view",
  ],
}

export const ROLE_DESCRIPTIONS: Record<OrgRole, { title: string; desc: string }> = {
  OWNER: {
    title: "Owner",
    desc: "Full access to organization, billing subscriptions, API credentials, and ownership transfer.",
  },
  ADMIN: {
    title: "Admin",
    desc: "Manage users, team roles, projects, billing invoices, and workspace settings.",
  },
  MANAGER: {
    title: "Manager",
    desc: "Manage SEO projects, audits, reports, and team workflows.",
  },
  MEMBER: {
    title: "Member",
    desc: "Limited project access. View analytics, run authorized scans, and preview reports.",
  },
  API_USER: {
    title: "Enterprise API User",
    desc: "Machine / developer account. Can access REST APIs according to organization's API limits.",
  },
}

/**
 * Check if a role possesses a specific permission
 */
export function hasPermission(role: OrgRole, permission: OrgPermission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || []
  return permissions.includes(permission)
}

/**
 * Check if role A meets or exceeds the privilege rank of role B
 */
export function hasMinimumRole(userRole: OrgRole, minimumRequiredRole: OrgRole): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[minimumRequiredRole] ?? 0)
}

export function isOwner(role: OrgRole): boolean {
  return role === "OWNER"
}

export function isAdminOrHigher(role: OrgRole): boolean {
  return hasMinimumRole(role, "ADMIN")
}

export function isManagerOrHigher(role: OrgRole): boolean {
  return hasMinimumRole(role, "MANAGER")
}
