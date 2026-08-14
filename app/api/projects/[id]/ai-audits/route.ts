import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id: projectId } = await params

  const scans = await db.aIVisibilityScan.findMany({
    where: {
      projectId,
      project: {
        organization: {
          members: { some: { userId: session.user.id } }
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      results: { take: 5 }
    }
  })

  return NextResponse.json({ ok: true, data: scans })
}