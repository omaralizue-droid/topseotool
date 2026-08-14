import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { analyzeBrandPerception } from "@/lib/brand-perception/perception-analyzer"
import { handleApiError } from "@/lib/errors"

interface RouteParams { params: Promise<{ id: string }> }

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
      brandPerceptions: { orderBy: { scannedAt: "desc" }, take: 10 }
    }
  })

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })

  const domain = project.websites[0]?.domain ?? "domain.com"
  const analysis = analyzeBrandPerception(project.name, domain)

  return NextResponse.json({ ok: true, data: { analysis, history: project.brandPerceptions } })
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
      include: { websites: true }
    })

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })

    const domain = project.websites[0]?.domain ?? "domain.com"
    const analysis = analyzeBrandPerception(project.name, domain)

    // Save BrandPerception record to DB
    const record = await db.brandPerception.create({
      data: {
        projectId,
        engine: "GEMINI",
        keyDescriptors: analysis.positiveAttributes.concat(analysis.neutralAttributes),
        sentimentScore: analysis.perceptionScore,
        summary: analysis.summaryText,
      }
    })

    return NextResponse.json({ ok: true, data: { record, analysis } }, { status: 201 })
  } catch (err) {
    return handleApiError(err, "BRAND_PERCEPTION_POST")
  }
}