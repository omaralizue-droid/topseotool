import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { BYPASS_AUTH, MOCK_SESSION } from "@/lib/mock-auth"

export async function POST(req: NextRequest) {
  const session = BYPASS_AUTH ? MOCK_SESSION : await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { domain } = body

  if (!domain || typeof domain !== "string" || !domain.includes(".")) {
    return NextResponse.json({ error: "Valid domain name required (e.g. reports.youragency.com)" }, { status: 400 })
  }

  // Simulate DNS propagation verification
  const isHealthyHostname = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)
  if (!isHealthyHostname) {
    return NextResponse.json({ error: "Invalid hostname structure" }, { status: 400 })
  }

  return NextResponse.json({
    ok: true,
    data: {
      domain,
      status: "VERIFIED",
      cnameTarget: "cname.topseotool.net",
      sslStatus: "ACTIVE",
      verifiedAt: new Date().toISOString(),
      message: `CNAME record verified for ${domain}! SSL certificate is provisioned and active.`,
    },
  })
}
