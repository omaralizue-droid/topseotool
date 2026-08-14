import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

interface RouteParams { params: Promise<{ id: string; competitorId: string }> }

export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id: projectId, competitorId } = await params

  const competitor = await db.competitor.findFirst({
    where: {
      id: competitorId,
      projectId,
      project: {
        organization: {
          members: { some: { userId: session.user.id } }
        }
      }
    },
    include: {
      scans: { orderBy: { scannedAt: "desc" }, take: 10 }
    }
  })

  if (!competitor) return NextResponse.json({ error: "Competitor not found" }, { status: 404 })
  return NextResponse.json({ ok: true, data: competitor })
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id: projectId, competitorId } = await params

  await db.competitor.deleteMany({
    where: {
      id: competitorId,
      projectId,
      project: {
        organization: {
          members: { some: { userId: session.user.id } }
        }
      }
    }
  })

  return NextResponse.json({ ok: true, message: "Competitor deleted" })
}