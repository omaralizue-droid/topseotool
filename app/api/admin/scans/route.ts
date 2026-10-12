import { NextRequest, NextResponse } from "next/server"
import { requireAdminUser } from "@/lib/auth/session"
import { listAllScans, updateScan, logAdminAction } from "@/lib/db"

export async function GET() {
  try {
    await requireAdminUser()
    const scans = await listAllScans()
    return NextResponse.json({ ok: true, scans })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Access denied"
    return NextResponse.json({ ok: false, error: message }, { status: 403 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdminUser()
    const body = await req.json().catch(() => null)
    if (!body || !body.scanId) {
      return NextResponse.json({ ok: false, error: "scanId required" }, { status: 400 })
    }

    const { scanId, action } = body as { scanId: string; action: "retry" | "cancel" }
    const status = action === "retry" ? "running" : "failed"

    const updated = await updateScan(scanId, {
      status,
      error: action === "cancel" ? "Canceled by administrator" : undefined,
    })

    await logAdminAction({
      actorId: admin.id,
      actorEmail: admin.email,
      action: `scan.${action}`,
      targetType: "scan",
      targetId: scanId,
      details: `Admin ${admin.email} marked scan ${scanId} as ${status}`,
    })

    return NextResponse.json({ ok: true, scan: updated })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Access denied"
    return NextResponse.json({ ok: false, error: message }, { status: 403 })
  }
}
