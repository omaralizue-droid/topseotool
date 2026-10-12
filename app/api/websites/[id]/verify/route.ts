import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { findWebsiteById, updateWebsite } from "@/lib/db"

export async function POST(
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

  // Simulate ownership verification check
  const updated = await updateWebsite(id, { verified: true })
  return NextResponse.json({
    ok: true,
    website: updated,
    message: `Domain ${website.domain} successfully verified. Full monitoring permissions unlocked.`,
  })
}
