// ============================================================
// TOPSEOTOOL — Multi-Tenant Role-Based Access Control (RBAC)
// Organization Hierarchy:
// OWNER > ADMIN > MANAGER > MEMBER
// ============================================================

export type OrgRole = "OWNER" | "ADMIN" | "MANAGER" | "MEMBER"

export const ROLE_HIERARCHY: Record<OrgRole, number> = {
  OWNER: 4,
  ADMIN: 3,
  MANAGER: 2,
  MEMBER: 1,
}

export type OrgPermission =
  | "org:delete"
  | "org:update"
  | "org:billing_manage"
  | "org:billing_view"
  | "members:invite"
  | "members:change_role"
  | "members:remove"
  | "projects:create"
  | "projects:delete"
  | "projects:edit"
  | "projects:view"
  | "audits:run"
  | "reports:export"

const ROLE_PERMISSIONS: Record<OrgRole, OrgPermission[]> = {
  OWNER: [
    "org:delete",
    "org:update",
    "org:billing_manage",
    "org:billing_view",
    "members:invite",
    "members:change_role",
    "members:remove",
    "projects:create",
    "projects:delete",
    "projects:edit",
    "projects:view",
    "audits:run",
    "reports:export",
  ],
  ADMIN: [
    "org:update",
    "org:billing_view",
    "members:invite",
    "members:change_role",
    "members:remove",
    "projects:create",
    "projects:delete",
    "projects:edit",
    "projects:view",
    "audits:run",
    "reports:export",
  ],
  MANAGER: [
    "members:invite",
    "projects:create",
    "projects:edit",
    "projects:view",
    "audits:run",
    "reports:export",
  ],
  MEMBER: [
    "projects:view",
    "audits:run",
    "reports:export",
  ],
}

/**
 * Check if a role has the required permission
 */
export function hasPermission(role: OrgRole, permission: OrgPermission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || []
  return permissions.includes(permission)
}

/**
 * Check if role A has at least the privilege level of role B
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
