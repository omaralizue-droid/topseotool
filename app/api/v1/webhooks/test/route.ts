import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { BYPASS_AUTH, MOCK_SESSION } from "@/lib/mock-auth"

export async function POST(req: NextRequest) {
  const session = BYPASS_AUTH ? MOCK_SESSION : await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { webhookId, event = "audit.completed" } = body

  // Simulate webhook delivery
  const payload = {
    id: `evt_${Date.now()}`,
    event,
    createdAt: new Date().toISOString(),
    data: {
      domain: "topseotool.net",
      score: 88,
      status: "COMPLETED",
      summary: "Audit completed with 0 critical errors, 3 warnings.",
    },
  }

  return NextResponse.json({
    ok: true,
    data: {
      webhookId,
      event,
      statusCode: 200,
      latencyMs: 148,
      deliveryStatus: "DELIVERED",
      deliveredAt: new Date().toISOString(),
      payload,
    },
    message: "Test webhook payload delivered with status 200 OK!",
  })
}
