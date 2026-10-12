import { NextRequest, NextResponse } from "next/server"
import { requireAdminUser } from "@/lib/auth/session"
import { getAllSettings, updateSetting, logAdminAction } from "@/lib/db"

export async function GET() {
  try {
    await requireAdminUser()
    const settings = await getAllSettings()
    return NextResponse.json({ ok: true, settings })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Access denied"
    return NextResponse.json({ ok: false, error: message }, { status: 403 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdminUser()
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 })
    }

    const entries = Object.entries(body as Record<string, string>)
    for (const [k, v] of entries) {
      if (typeof v === "string") {
        await updateSetting(k, v, admin.email)
      }
    }

    await logAdminAction({
      actorId: admin.id,
      actorEmail: admin.email,
      action: "settings.update",
      targetType: "settings",
      targetId: "global",
      details: `Updated settings keys: ${entries.map(([k]) => k).join(", ")}`,
    })

    const updatedSettings = await getAllSettings()
    return NextResponse.json({ ok: true, settings: updatedSettings })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Access denied"
    return NextResponse.json({ ok: false, error: message }, { status: 403 })
  }
}
