import { NextResponse } from "next/server"
import { requireAdminUser } from "@/lib/auth/session"
import { listAuditLogs } from "@/lib/db"

export async function GET() {
  try {
    await requireAdminUser()
    const logs = await listAuditLogs(150)
    return NextResponse.json({ ok: true, logs })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Access denied"
    return NextResponse.json({ ok: false, error: message }, { status: 403 })
  }
}
