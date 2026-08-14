import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createProjectSchema } from "@/lib/validations"
import { handleApiError } from "@/lib/errors"
import { checkEntitlement } from "@/lib/billing/entitlements"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })

  // Find user's primary organization membership
  const membership = await db.organizationMember.findFirst({
    where: { userId: session.user.id },
    select: { organizationId: true },
  })

  if (!membership) {
    return NextResponse.json({ ok: true, data: [] })
  }

  const projects = await db.project.findMany({
    where: { organizationId: membership.organizationId, status: { not: "ARCHIVED" } },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: { seoAudits: true, aiVisibilityScans: true, brandMentions: true, aiCitations: true }
      }
    }
  })
  return NextResponse.json({ ok: true, data: projects })
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    const body = await req.json()
    const parsed = createProjectSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })

    let membership = await db.organizationMember.findFirst({
      where: { userId: session.user.id },
      select: { organizationId: true },
    })

    // If no org exists yet, auto-create one
    if (!membership) {
      const org = await db.organization.create({
        data: {
          name: `${session.user.name ?? "User"}'s Org`,
          slug: `org-${session.user.id.slice(0, 8)}`,
        }
      })
      await db.organizationMember.create({
        data: { organizationId: org.id, userId: session.user.id, role: "OWNER" }
      })
      await db.subscription.create({
        data: { organizationId: org.id, plan: "FREE" as any, status: "ACTIVE" }
      })
      membership = { organizationId: org.id }
    }

    // ✅ Entitlement check — throws ValidationError if project limit reached
    await checkEntitlement(membership.organizationId, "CREATE_PROJECT")

    const project = await db.project.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        color: parsed.data.color,
        organizationId: membership.organizationId,
      }
    })

    // Create primary website for project
    await db.website.create({
      data: {
        projectId: project.id,
        domain: parsed.data.domain,
        url: `https://${parsed.data.domain}`,
        isPrimary: true,
      }
    })

    return NextResponse.json({ ok: true, data: project }, { status: 201 })
  } catch (err) {
    return handleApiError(err, "PROJECTS_POST")
  }
}