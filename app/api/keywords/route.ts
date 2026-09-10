import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { handleApiError } from "@/lib/errors"
import { checkAndRecord, METRIC } from "@/lib/billing/entitlements"
import { generateKeywordResearch } from "@/lib/keywords/keyword-engine"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const body = await req.json()
    const {
      keyword,
      country = "United States",
      language = "English",
      searchEngine = "Google",
      projectId,
    } = body

    if (!keyword || typeof keyword !== "string" || !keyword.trim()) {
      return NextResponse.json({ error: "Keyword parameter is required" }, { status: 400 })
    }

    // Check organization and entitlement if authenticated
    if (session?.user?.id) {
      const membership = await db.organizationMember.findFirst({
        where: { userId: session.user.id },
        select: { organizationId: true }
      })

      if (membership) {
        // Enforce quota and record 1 keyword search
        try {
          await checkAndRecord(
            membership.organizationId,
            "KEYWORD_RESEARCH",
            METRIC.KEYWORD_SEARCH,
            1,
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

    const data = generateKeywordResearch(keyword, country, language, searchEngine)

    return NextResponse.json({
      ok: true,
      data,
    })
  } catch (err) {
    return handleApiError(err, "KEYWORDS_SEARCH_POST")
  }
}
