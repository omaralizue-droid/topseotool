import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { findWebsiteById, updateWebsite, deleteWebsite } from "@/lib/db"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const website = await findWebsiteById(id)
  if (!website || website.userId !== user.id) {
    return NextResponse.json({ ok: false, error: "Website not found or unauthorized" }, { status: 404 })
  }

  const body = await req.json().catch(() => ({}))
  const updated = await updateWebsite(id, {
    brandName: body.brandName?.trim() || website.brandName,
    monitoringEnabled: typeof body.monitoringEnabled === "boolean" ? body.monitoringEnabled : website.monitoringEnabled,
    monitoringFrequency: body.monitoringFrequency || website.monitoringFrequency,
  })

  return NextResponse.json({ ok: true, website: updated })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const website = await findWebsiteById(id)
  if (!website || website.userId !== user.id) {
    return NextResponse.json({ ok: false, error: "Website not found or unauthorized" }, { status: 404 })
  }

  await deleteWebsite(id)
  return NextResponse.json({ ok: true, message: "Website removed successfully" })
}
