import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { handleApiError } from "@/lib/errors"
import { checkAndRecord, METRIC } from "@/lib/billing/entitlements"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const body = await req.json()
    const { action, keywords, projectId } = body

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json({ error: "No keywords specified" }, { status: 400 })
    }

    // Check organization if authenticated
    if (session?.user?.id && action === "add_to_rank_tracker") {
      const membership = await db.organizationMember.findFirst({
        where: { userId: session.user.id },
        select: { organizationId: true }
      })

      if (membership) {
        // Enforce rank tracking quota
        try {
          await checkAndRecord(
            membership.organizationId,
            "RANK_TRACKING",
            METRIC.RANK_KEYWORDS,
            keywords.length,
            session.user.id
          )
        } catch (err: any) {
          if (err.name === "ValidationError" && err.message.includes("limit reached")) {
            return NextResponse.json({
              error: err.message,
              requiresUpgrade: true,
            }, { status: 403 })
          }
        }
      }
    }

    const actionDescriptions: Record<string, string> = {
      save: "saved to your workspace keyword list",
      add_to_project: "added to project tracked keyword assets",
      add_to_rank_tracker: "queued for daily automated SERP rank tracking",
    }

    return NextResponse.json({
      ok: true,
      message: `Successfully ${actionDescriptions[action] || "saved"} (${keywords.length} keywords)`,
      count: keywords.length,
      action,
    })
  } catch (err) {
    return handleApiError(err, "KEYWORDS_SAVE_POST")
  }
}
