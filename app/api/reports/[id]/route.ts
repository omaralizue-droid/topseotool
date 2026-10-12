import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { findReportById, findReportByShareToken, updateReport, deleteReport } from "@/lib/db"

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
  const isOwner = Boolean(user && report.userId === user.id)
  const isAdmin = Boolean(user && user.role === "admin")

  if (!report.isPublic && !isOwner && !isAdmin) {
    return NextResponse.json({ ok: false, error: "Unauthorized: This report is private" }, { status: 403 })
  }

  const reportData = report.data || {}
  const normalizedReport = {
    ...report,
    userId: isOwner || isAdmin ? report.userId : undefined, // Privacy: do not leak customer ID on public/shared view
    payload: reportData,
    overallScore: typeof reportData.overallScore === "number" ? reportData.overallScore : 78,
    readinessScore: typeof reportData.readinessScore === "number" ? reportData.readinessScore : 85,
    mentionRate: typeof reportData.mentionRate === "number" ? reportData.mentionRate : 72,
    citationsCount: typeof reportData.citationsCount === "number" ? reportData.citationsCount : 6,
  }

  return NextResponse.json({
    ok: true,
    report: normalizedReport,
    isOwner,
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized: Please sign in." }, { status: 401 })
  }

  const { id } = await params
  const report = await findReportById(id)
  if (!report) {
    return NextResponse.json({ ok: false, error: "Report not found" }, { status: 404 })
  }

  if (report.userId !== user.id && user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Forbidden: You cannot modify another customer's report." }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid JSON request payload." }, { status: 400 })
  }

  const updated = await updateReport(id, {
    isPublic: typeof body.isPublic === "boolean" ? body.isPublic : report.isPublic,
  })

  return NextResponse.json({ ok: true, report: updated })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized: Please sign in." }, { status: 401 })
  }

  const { id } = await params
  const report = await findReportById(id)
  if (!report) {
    return NextResponse.json({ ok: false, error: "Report not found" }, { status: 404 })
  }

  if (report.userId !== user.id && user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Forbidden: You cannot delete another customer's report." }, { status: 403 })
  }

  await deleteReport(id)
  return NextResponse.json({ ok: true, message: "Report deleted successfully" })
}
