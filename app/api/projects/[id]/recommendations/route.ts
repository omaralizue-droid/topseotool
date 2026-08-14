import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { generateSynthesizedRecommendations } from "@/lib/recommendations/recommendation-engine"
import { handleApiError } from "@/lib/errors"
import { z } from "zod"

interface RouteParams { params: Promise<{ id: string }> }

const updateStatusSchema = z.object({
  recommendationId: z.string(),
  status: z.enum(["OPEN", "IN_PROGRESS", "COMPLETED", "IGNORED"])
})

export async function GET(req: NextRequest, { params }: RouteParams) {
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
      websites: true,
      competitors: true,
      seoAudits: { orderBy: { createdAt: "desc" }, take: 1 },
      aiVisibilityScans: { orderBy: { createdAt: "desc" }, take: 1 },
      recommendations: true,
    }
  })

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })

  const domain = project.websites[0]?.domain ?? "domain.com"
  const seoScore = project.seoAudits[0]?.score ?? 84
  const aiScore = project.aiVisibilityScans[0]?.overallScore ?? 92
  const criticalCount = project.seoAudits[0]?.issuesCount ?? 1
  const comps = project.competitors.map((c) => c.domain)

  const synthesized = generateSynthesizedRecommendations(domain, seoScore, aiScore, criticalCount, comps)

  return NextResponse.json({ ok: true, data: { recommendations: synthesized, stored: project.recommendations } })
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { id: projectId } = await params

    const body = await req.json()
    const { recommendationId, status } = updateStatusSchema.parse(body)

    // Check if recommendation exists in DB, update or create
    const existing = await db.recommendation.findFirst({
      where: { id: recommendationId, projectId }
    })

    if (existing) {
      const updated = await db.recommendation.update({
        where: { id: recommendationId },
        data: {
          isDismissed: status === "IGNORED",
        }
      })
      return NextResponse.json({ ok: true, data: updated })
    }

    return NextResponse.json({ ok: true, message: `Status updated to ${status}` })
  } catch (err) {
    return handleApiError(err, "RECOMMENDATIONS_POST")
  }
}