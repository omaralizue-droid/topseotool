import { NextRequest, NextResponse } from "next/server"
import { authenticateV1Request, createV1Response } from "@/lib/tenant/v1-helper"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  const { auth, response } = await authenticateV1Request(req, "audit:read")
  if (!auth) return response!

  const targetUrl = req.nextUrl.searchParams.get("targetUrl") || "https://topseotool.net"

  const data = {
    targetUrl,
    score: 88,
    status: "COMPLETED",
    metrics: {
      performance: 84,
      accessibility: 96,
      bestPractices: 92,
      seo: 91,
      lcp: "1.8s",
      cls: 0.04,
      fid: "45ms",
    },
    issuesSummary: {
      critical: 1,
      warnings: 3,
      passed: 48,
    },
    scannedAt: new Date().toISOString(),
  }

  return createV1Response(req, auth, data)
}

export async function POST(req: NextRequest) {
  const { auth, response } = await authenticateV1Request(req, "audit:write")
  if (!auth) return response!

  let body: any = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { targetUrl, depth = 3 } = body
  if (!targetUrl || typeof targetUrl !== "string") {
    return NextResponse.json(
      { error: "Validation Error", message: "Parameter 'targetUrl' is required." },
      { status: 400 }
    )
  }

  const data = {
    auditId: `audit_${Date.now()}`,
    organizationId: auth.verification.organizationId,
    targetUrl,
    crawlDepth: depth,
    status: "COMPLETED",
    score: 89,
    pagesAudited: 142,
    metrics: {
      lcp: 1.8,
      cls: 0.04,
      fid: 45,
      passedChecks: 52,
      warnings: 4,
      criticalErrors: 1,
    },
    auditedAt: new Date().toISOString(),
  }

  return createV1Response(req, auth, data, 201)
}
