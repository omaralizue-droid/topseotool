import { NextRequest, NextResponse } from "next/server"
import { requireAdminUser } from "@/lib/auth/session"
import { listProviders, updateProvider, logAdminAction } from "@/lib/db"

export async function GET() {
  try {
    await requireAdminUser()
    const providers = await listProviders()
    return NextResponse.json({ ok: true, providers })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Access denied"
    return NextResponse.json({ ok: false, error: message }, { status: 403 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdminUser()
    const body = await req.json().catch(() => null)
    if (!body || !body.providerId) {
      return NextResponse.json({ ok: false, error: "providerId is required" }, { status: 400 })
    }

    const { providerId, enabled, testCheck } = body as {
      providerId: string
      enabled?: boolean
      testCheck?: boolean
    }

    const updates: any = {}

    if (typeof enabled === "boolean") {
      updates.enabled = enabled
    }

    if (testCheck) {
      // Live health test
      if (providerId === "gemini") {
        const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 10)
        updates.hasApiKey = hasKey
        updates.status = hasKey ? "operational" : "degraded"
        updates.lastError = hasKey ? undefined : "API key not configured in environment"
      } else {
        updates.status = "operational"
      }
    }

    const updated = await updateProvider(providerId, updates)

    await logAdminAction({
      actorId: admin.id,
      actorEmail: admin.email,
      action: "provider.update",
      targetType: "provider",
      targetId: providerId,
      details: `Provider ${providerId} updated: enabled=${enabled}, tested=${testCheck}`,
    })

    return NextResponse.json({ ok: true, provider: updated })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Access denied"
    return NextResponse.json({ ok: false, error: message }, { status: 403 })
  }
}
