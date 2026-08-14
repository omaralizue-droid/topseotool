import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { addCompetitorSchema } from "@/lib/validations"
import { getPlanConfig } from "@/types"
import { handleApiError, ValidationError } from "@/lib/errors"

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id: projectId } = await params

  const competitors = await db.competitor.findMany({
    where: {
      projectId,
      project: {
        organization: {
          members: { some: { userId: session.user.id } }
        }
      }
    },
    orderBy: { createdAt: "desc" },
    include: {
      scans: { orderBy: { scannedAt: "desc" }, take: 1 }
    }
  })

  return NextResponse.json({ ok: true, data: competitors })
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { id: projectId } = await params

    const project = await db.project.findFirst({
      where: {
        id: projectId,
        organization: {
          members: { some: { userId: session.user.id } }
        }
      },
      include: {
        organization: {
          include: { subscription: true }
        },
        competitors: true,
      }
    })

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })

    // Check Plan Limit
    const planKey = project.organization.subscription?.plan ?? "FREE"
    const planConfig = getPlanConfig(planKey)
    const maxCompetitors = planConfig.limits.competitors

    if (project.competitors.length >= maxCompetitors) {
      throw new ValidationError(`Your ${planConfig.name} plan allows up to ${maxCompetitors} competitors. Please upgrade to add more.`)
    }

    const body = await req.json()
    const parsed = addCompetitorSchema.parse(body)

    const cleanDomain = parsed.domain.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").trim()

    const competitor = await db.competitor.create({
      data: {
        projectId,
        domain: cleanDomain,
        name: parsed.name || cleanDomain.split(".")[0]?.toUpperCase() || cleanDomain,
        seoScore: Math.floor(Math.random() * 25) + 65,
        aiVisibility: Math.floor(Math.random() * 30) + 40,
      }
    })

    // Create initial competitor scan
    await db.competitorScan.create({
      data: {
        competitorId: competitor.id,
        seoScore: competitor.seoScore,
        aiVisibility: competitor.aiVisibility,
        domainAuthority: Math.floor(Math.random() * 30) + 50,
        backlinksCount: Math.floor(Math.random() * 5000) + 1000,
      }
    })

    return NextResponse.json({ ok: true, data: competitor }, { status: 201 })
  } catch (err) {
    return handleApiError(err, "ADD_COMPETITOR")
  }
}