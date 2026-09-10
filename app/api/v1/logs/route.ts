import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { BYPASS_AUTH, MOCK_SESSION } from "@/lib/mock-auth"
import { getApiRequestLogs } from "@/lib/tenant/api-keys"

export async function GET(req: NextRequest) {
  const session = BYPASS_AUTH ? MOCK_SESSION : await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const logs = getApiRequestLogs("demo-org")
  return NextResponse.json({
    ok: true,
    data: logs,
    meta: {
      total: logs.length,
      successRate: 99.8,
      avgLatencyMs: 142,
    },
  })
}
