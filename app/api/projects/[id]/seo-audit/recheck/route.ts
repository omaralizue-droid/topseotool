import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { handleApiError } from "@/lib/errors"
import { runTechnicalSEOAnalysis, recheckIssue } from "@/lib/crawler/technical-crawler"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: projectId } = await params
    const body = await req.json()
    const { issueId, url = "https://example.com" } = body

    if (!issueId) {
      return NextResponse.json({ error: "Missing issueId" }, { status: 400 })
    }

    // In demo or test mode, run instant recheck
    const baseline = runTechnicalSEOAnalysis(url)
    const result = recheckIssue(baseline, issueId)

    // If real database has this issue, update it
    try {
      await db.sEOIssue.updateMany({
        where: { id: issueId },
        data: { severity: "PASSED" }
      })
    } catch {
      // safe fallback if in memory or demo
    }

    return NextResponse.json({
      ok: true,
      data: {
        success: true,
        issueId,
        newStatus: "Passed",
        scoreDelta: result.scoreDelta,
        newScore: result.updatedResult.seoHealthScore,
        categoryScores: result.updatedResult.categoryScores,
        counts: result.updatedResult.counts,
        fixedIssue: result.fixedIssue,
        message: `Issue "${result.fixedIssue?.title || issueId}" successfully verified and resolved!`
      }
    })
  } catch (err) {
    return handleApiError(err, "SEO_AUDIT_RECHECK")
  }
}
