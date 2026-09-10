import { NextRequest, NextResponse } from "next/server"
import { AlertEngine } from "@/lib/alerts/alert-engine"
import { AlertTriggerType } from "@/lib/alerts/alert-store"

/**
 * POST /api/alerts/simulate
 * Triggers simulated events for testing the 5 alert conditions
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const type = (body.type || "RANKING_DROP") as AlertTriggerType
    const projectId = body.projectId || "proj_default"
    const projectName = body.projectName || "topseotool.net"
    const recipientEmail = body.recipientEmail || "admin@topseotool.net"

    const ctx = { projectId, projectName, recipientEmail }
    let alert = null

    switch (type) {
      case "RANKING_DROP": {
        alert = await AlertEngine.evaluateRankingDrop(ctx, {
          keyword: body.keyword || "ai keyword intelligence",
          oldPosition: body.oldPosition ?? 3,
          newPosition: body.newPosition ?? 9,
          url: body.url || "https://topseotool.net/keyword-research",
        })
        break
      }

      case "HEALTH_DECREASE": {
        alert = await AlertEngine.evaluateHealthDecrease(ctx, {
          previousScore: body.previousScore ?? 94,
          currentScore: body.currentScore ?? 85,
          newCriticalIssues: body.newCriticalIssues ?? 4,
          auditId: "audit_simulated",
        })
        break
      }

      case "PAGE_UNAVAILABLE": {
        alert = await AlertEngine.evaluatePageAvailability(ctx, {
          url: body.url || "https://topseotool.net/pricing",
          statusCode: body.statusCode ?? 500,
          errorDetails: body.errorDetails || "Internal Server Error (Simulated Outage)",
        })
        break
      }

      case "BACKLINK_LOST": {
        alert = await AlertEngine.evaluateBacklinkLost(ctx, {
          lostDomain: body.lostDomain || "searchengineland.com",
          domainAuthority: body.domainAuthority ?? 89,
          targetUrl: body.targetUrl || "https://topseotool.net/blog/seo-trends",
          linkType: body.linkType || "dofollow",
        })
        break
      }

      case "KEYWORD_IMPROVED": {
        alert = await AlertEngine.evaluateKeywordImprovement(ctx, {
          keyword: body.keyword || "enterprise seo platform",
          oldPosition: body.oldPosition ?? 12,
          newPosition: body.newPosition ?? 2,
          url: body.url || "https://topseotool.net",
        })
        break
      }

      default:
        return NextResponse.json({ error: `Unsupported alert simulation type: ${type}` }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Simulated ${type} alert successfully generated`,
      alert,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
