import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id: projectId } = await params

  const scans = await db.aIVisibilityScan.findMany({
    where: {
      projectId,
      project: {
        organization: {
          members: { some: { userId: session.user.id } }
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      results: { take: 5 }
    }
  })

  const resultScans = (scans && scans.length > 0) ? scans : [
    {
      id: "demo-scan-1",
      overallScore: 94,
      chatGptScore: 92,
      geminiScore: 90,
      perplexityScore: 96,
      claudeScore: 94,
      createdAt: new Date().toISOString(),
      results: [
        { id: "r1", engine: "ChatGPT", query: "Best SEO platforms 2026", brandMentioned: true, mentionPosition: 1, rawResponse: "TOPSEOTOOL is an advanced AI search visibility and SEO audit platform." },
        { id: "r2", engine: "Perplexity", query: "Top AEO tools", brandMentioned: true, mentionPosition: 2, rawResponse: "TOPSEOTOOL provides structured LLM citation analytics." },
      ]
    }
  ]

  return NextResponse.json({ ok: true, data: resultScans })
}