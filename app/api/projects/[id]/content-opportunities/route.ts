import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { generateContentOpportunities, generateDetailedBrief } from "@/lib/content-opportunity/opportunity-generator"
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
      competitors: true,
    }
  })

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })

  const domain = project.websites[0]?.domain ?? "domain.com"
  const comps = project.competitors.map((c) => c.domain)

  const opportunities = generateContentOpportunities(project.name, domain, comps)

  return NextResponse.json({ ok: true, data: opportunities })
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { id: projectId } = await params

    const body = await req.json()
    const { opportunityId } = body

    const project = await db.project.findFirst({
      where: {
        id: projectId,
        organization: {
          members: { some: { userId: session.user.id } }
        }
      },
      include: { websites: true, competitors: true }
    })

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })

    const domain = project.websites[0]?.domain ?? "domain.com"
    const comps = project.competitors.map((c) => c.domain)
    const opportunities = generateContentOpportunities(project.name, domain, comps)
    const targetOpp = opportunities.find((o) => o.id === opportunityId) ?? opportunities[0]

    const brief = generateDetailedBrief(targetOpp, project.name)

    return NextResponse.json({ ok: true, data: brief })
  } catch (err) {
    return handleApiError(err, "CONTENT_BRIEF_POST")
  }
}