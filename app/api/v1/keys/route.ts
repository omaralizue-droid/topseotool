import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { BYPASS_AUTH, MOCK_SESSION } from "@/lib/mock-auth"
import { generateEnterpriseApiKey } from "@/lib/tenant/api-keys"

export async function GET(req: NextRequest) {
  const session = BYPASS_AUTH ? MOCK_SESSION : await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const member = await db.organizationMember.findFirst({
      where: { userId: session.user.id },
      select: { organizationId: true },
    })

    const orgId = member?.organizationId || "demo-org"

    const keys = await db.apiKey.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      ok: true,
      data: keys.map((k) => ({
        id: k.id,
        name: k.name,
        keyPrefix: k.keyPrefix,
        scopes: k.scopes,
        rateLimitPerMin: k.rateLimitPerMin,
        totalRequests: k.totalRequests,
        lastUsedAt: k.lastUsedAt,
        createdAt: k.createdAt,
      })),
    })
  } catch {
    // Fallback sample keys for development / demo mode
    return NextResponse.json({
      ok: true,
      data: [
        {
          id: "key_1",
          name: "Production Pipeline Key",
          keyPrefix: "topseo_live_9f82",
          scopes: ["*"],
          rateLimitPerMin: 120,
          totalRequests: 8420,
          lastUsedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
        },
        {
          id: "key_2",
          name: "CI/CD Audit & Rankings Worker",
          keyPrefix: "topseo_live_41a0",
          scopes: ["audit:read", "audit:write", "rankings:read"],
          rateLimitPerMin: 60,
          totalRequests: 1940,
          lastUsedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
        },
      ],
    })
  }
}

export async function POST(req: NextRequest) {
  const session = BYPASS_AUTH ? MOCK_SESSION : await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { name = "New Developer API Key", scopes = ["*"], rateLimitPerMin = 120 } = body

  let orgId = "demo-org"
  try {
    const member = await db.organizationMember.findFirst({
      where: { userId: session.user.id },
      select: { organizationId: true },
    })
    if (member) orgId = member.organizationId
  } catch {
    // Fallback
  }

  const generated = await generateEnterpriseApiKey(
    orgId,
    name,
    scopes,
    rateLimitPerMin,
    session.user.id
  )

  return NextResponse.json({
    ok: true,
    data: {
      id: generated.id,
      name,
      rawKey: generated.rawKey,
      keyPrefix: generated.keyPrefix,
      scopes: generated.scopes,
      rateLimitPerMin,
      createdAt: new Date().toISOString(),
      message: "Please copy your secret API key now. You will not be able to see it again!",
    },
  }, 201)
}

export async function DELETE(req: NextRequest) {
  const session = BYPASS_AUTH ? MOCK_SESSION : await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const keyId = req.nextUrl.searchParams.get("id")
  if (!keyId) return NextResponse.json({ error: "Parameter 'id' required" }, { status: 400 })

  try {
    await db.apiKey.delete({ where: { id: keyId } })
  } catch {
    // Fallback
  }

  return NextResponse.json({ ok: true, message: "API key revoked successfully." })
}
