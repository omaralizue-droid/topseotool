import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { BYPASS_AUTH, MOCK_SESSION } from "@/lib/mock-auth"
import { rotateEnterpriseApiKey } from "@/lib/tenant/api-keys"

export async function POST(req: NextRequest) {
  const session = BYPASS_AUTH ? MOCK_SESSION : await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { keyId, organizationId = "demo-org" } = body

  if (!keyId) {
    return NextResponse.json({ error: "Parameter 'keyId' is required for rotation" }, { status: 400 })
  }

  const rotated = await rotateEnterpriseApiKey(keyId, organizationId)

  return NextResponse.json({
    ok: true,
    data: {
      keyId,
      rawKey: rotated.rawKey,
      keyPrefix: rotated.keyPrefix,
      message: "API key successfully rotated! The previous secret hash has been invalidated immediately.",
      rotatedAt: new Date().toISOString(),
    },
  })
}
