import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id: reportId } = await params

  const report = await db.report.findFirst({
    where: {
      id: reportId,
      project: {
        organization: {
          members: { some: { userId: session.user.id } }
        }
      }
    },
    include: { project: true }
  })

  if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 })
  return NextResponse.json({ ok: true, data: report })
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id: reportId } = await params

  await db.report.deleteMany({
    where: {
      id: reportId,
      project: {
        organization: {
          members: { some: { userId: session.user.id } }
        }
      }
    }
  })

  return NextResponse.json({ ok: true, message: "Report deleted" })
}