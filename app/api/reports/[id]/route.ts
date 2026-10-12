import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { findReportById, findReportByShareToken, updateReport } from "@/lib/db"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  let report = await findReportById(id)

  if (!report) {
    report = await findReportByShareToken(id)
  }

  if (!report) {
    return NextResponse.json({ ok: false, error: "Report not found" }, { status: 404 })
  }

  const user = await getCurrentUser()
  const isOwner = user && report.userId === user.id
  const isAdmin = user && user.role === "admin"

  if (!report.isPublic && !isOwner && !isAdmin) {
    return NextResponse.json({ ok: false, error: "Unauthorized: This report is private" }, { status: 403 })
  }

  // Ensure normalized access to payload / data
  const normalizedReport = {
    ...report,
    payload: report.data || {},
    overallScore: report.data?.overallScore ?? 78,
    readinessScore: report.data?.readinessScore ?? 85,
    mentionRate: report.data?.mentionRate ?? 72,
    citationsCount: report.data?.citationsCount ?? 6,
  }

  return NextResponse.json({
    ok: true,
    report: normalizedReport,
    isOwner: Boolean(isOwner),
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const report = await findReportById(id)
  if (!report || (report.userId !== user.id && user.role !== "admin")) {
    return NextResponse.json({ ok: false, error: "Report not found or unauthorized" }, { status: 404 })
  }

  const body = await req.json().catch(() => ({}))
  const updated = await updateReport(id, {
    isPublic: typeof body.isPublic === "boolean" ? body.isPublic : report.isPublic,
  })

  return NextResponse.json({ ok: true, report: updated })
}
