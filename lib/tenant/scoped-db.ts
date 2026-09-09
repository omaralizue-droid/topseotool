// ============================================================
// TOPSEOTOOL — Tenant-Scoped Data Access Layer
// Enforces that every single database query automatically includes
// the tenant's organizationId, preventing cross-tenant leakage.
// ============================================================

import { db } from "@/lib/db"

export class ScopedTenantDb {
  readonly organizationId: string

  constructor(organizationId: string) {
    if (!organizationId) {
      throw new Error("ScopedTenantDb requires a non-empty organizationId")
    }
    this.organizationId = organizationId
  }

  /**
   * Fetch all projects belonging exclusively to this organization
   */
  async getProjects(options: { take?: number; skip?: number } = {}) {
    return db.project.findMany({
      where: {
        organizationId: this.organizationId,
        status: { not: "ARCHIVED" },
      },
      take: options.take,
      skip: options.skip,
      orderBy: { updatedAt: "desc" },
      include: {
        websites: true,
        _count: {
          select: {
            seoAudits: true,
            aiVisibilityScans: true,
            brandMentions: true,
            competitors: true,
          },
        },
      },
    })
  }

  /**
   * Fetch a single project ensuring it belongs to this organization
   */
  async getProject(projectId: string) {
    return db.project.findFirst({
      where: {
        id: projectId,
        organizationId: this.organizationId,
      },
      include: {
        websites: true,
        competitors: true,
      },
    })
  }

  /**
   * Create a new project strictly attached to this organization
   */
  async createProject(data: { name: string; domain: string; description?: string; color?: string }) {
    return db.project.create({
      data: {
        organizationId: this.organizationId,
        name: data.name,
        description: data.description,
        color: data.color || "#6366f1",
        websites: {
          create: {
            domain: data.domain,
            url: data.domain.startsWith("http") ? data.domain : `https://${data.domain}`,
            isPrimary: true,
          },
        },
      },
      include: {
        websites: true,
      },
    })
  }

  /**
   * Fetch SEO audits scoped to projects within this organization
   */
  async getAudits(projectId?: string) {
    return db.sEOAudit.findMany({
      where: {
        project: {
          organizationId: this.organizationId,
          ...(projectId ? { id: projectId } : {}),
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    })
  }

  /**
   * Fetch organization team members with their roles
   */
  async getMembers() {
    return db.organizationMember.findMany({
      where: {
        organizationId: this.organizationId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { createdAt: "asc" },
    })
  }
}

/**
 * Factory helper to create a tenant-scoped database query client
 */
export function createTenantDb(organizationId: string): ScopedTenantDb {
  return new ScopedTenantDb(organizationId)
}
