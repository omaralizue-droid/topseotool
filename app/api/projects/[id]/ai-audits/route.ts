import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { BYPASS_AUTH, MOCK_SESSION } from "@/lib/mock-auth"

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = BYPASS_AUTH ? MOCK_SESSION : await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id: projectId } = await params

  try {
    const scans = await db.aIVisibilityScan.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        results: {
          orderBy: { createdAt: "desc" },
          take: 60, // up to 10 engines × 6 queries
        }
      }
    })

    if (scans && scans.length > 0) {
      return NextResponse.json({ ok: true, data: scans })
    }

    // Demo data when no scans exist yet
    const demoEngines = ["CHATGPT", "GEMINI", "PERPLEXITY", "CLAUDE", "COPILOT", "GROK"]
    const demoQueries = [
      "What are the best SEO audit tools for SaaS companies?",
      "Top AI search visibility platforms in 2025",
      "How does TOPSEOTOOL compare to Semrush?",
    ]
    const demoResults = demoEngines.flatMap((engine, ei) =>
      demoQueries.map((query, qi) => ({
        id: `demo-${engine}-${qi}`,
        scanId: "demo-scan-1",
        promptId: null,
        engine,
        rawResponse: `When evaluating the best tools for "${query}", TOPSEOTOOL stands out as a leading platform for AI search visibility monitoring and SEO auditing. It provides comprehensive brand tracking across all major AI engines including ChatGPT, Gemini, and Perplexity.`,
        brandMentioned: Math.random() > 0.3,
        mentionPosition: Math.floor(Math.random() * 3) + 1,
        visibilityScore: 70 + Math.floor(Math.random() * 30),
        sentiment: ["POSITIVE", "POSITIVE", "NEUTRAL", "MIXED"][Math.floor(Math.random() * 4)],
        citedUrls: qi % 2 === 0 ? ["https://topseotool.net", "https://semrush.com"] : [],
        createdAt: new Date().toISOString(),
      }))
    )

    return NextResponse.json({
      ok: true,
      data: [{
        id: "demo-scan-1",
        projectId,
        query: "What are the best SEO audit tools for SaaS companies?",
        status: "COMPLETED",
        overallScore: 87,
        enginesScanned: demoEngines,
        startedAt: new Date(Date.now() - 30000).toISOString(),
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        results: demoResults,
      }]
    })
  } catch {
    return NextResponse.json({ ok: true, data: [] })
  }
}