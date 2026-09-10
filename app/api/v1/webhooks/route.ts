import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { BYPASS_AUTH, MOCK_SESSION } from "@/lib/mock-auth"
import { getWebhooks, createWebhook, deleteWebhook } from "@/lib/tenant/api-keys"

export async function GET(req: NextRequest) {
  const session = BYPASS_AUTH ? MOCK_SESSION : await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const webhooks = getWebhooks("demo-org")
  return NextResponse.json({ ok: true, data: webhooks })
}

export async function POST(req: NextRequest) {
  const session = BYPASS_AUTH ? MOCK_SESSION : await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { url, events = ["audit.completed", "rankings.changed"] } = body

  if (!url || !url.startsWith("http")) {
    return NextResponse.json({ error: "A valid HTTPS webhook URL is required." }, { status: 400 })
  }

  const created = createWebhook("demo-org", url, events)
  return NextResponse.json({
    ok: true,
    data: created,
    message: "Webhook endpoint successfully registered! Verify payloads with the provided signing secret.",
  }, 201)
}

export async function DELETE(req: NextRequest) {
  const session = BYPASS_AUTH ? MOCK_SESSION : await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Parameter 'id' required" }, { status: 400 })

  deleteWebhook("demo-org", id)
  return NextResponse.json({ ok: true, message: "Webhook deleted successfully." })
}
