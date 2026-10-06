import { NextRequest, NextResponse } from "next/server"
import { aiEnabled } from "@/lib/analyzer/gemini"
import { buildReport, rulesReport, type ReportInput } from "@/lib/analyzer/intelligence"
import type { AiReport } from "@/lib/analyzer/types"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid JSON request payload." }, { status: 400 })
    }

    const input = body as ReportInput
    if (!input.brand || !input.site || !input.checks || !input.profile || !input.scores) {
      return NextResponse.json({ ok: false, error: "Missing required report input data." }, { status: 400 })
    }

    let report: AiReport
    if (aiEnabled()) {
      try {
        report = await buildReport(input)
      } catch (err) {
        console.warn("AI report synthesis failed, falling back to rules-based report:", err)
        report = rulesReport(input)
      }
    } else {
      report = rulesReport(input)
    }

    return NextResponse.json({ ok: true, report })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate report."
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
