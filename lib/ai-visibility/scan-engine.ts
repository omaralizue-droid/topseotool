import { db } from "@/lib/db"
import { generateQueriesFromWebsite } from "./query-generator"
import { evaluateQueryVisibility, calculateAIVisibilityMetrics, EvaluationResult, AIEngine } from "./scanner"
import { logger } from "@/lib/logger"

// ─────────────────────────────────────────────────────────────────────────────
// Lightweight website crawler — extracts page context for query generation
// ─────────────────────────────────────────────────────────────────────────────
async function crawlWebsiteContext(
  url: string
): Promise<{ title?: string; description?: string; keywords?: string } | null> {
  try {
    const fetchUrl = url.startsWith("http") ? url : `https://${url}`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(fetchUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; TopSEOToolBot/1.0; +https://topseotool.net/bot)",
        Accept: "text/html",
      },
    })
    clearTimeout(timeout)

    if (!res.ok) return null
    const html = await res.text()

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]{1,200})<\/title>/i)
    const title = titleMatch?.[1]?.trim().replace(/\s+/g, " ")

    // Extract meta description
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{1,300})["']/i)
      ?? html.match(/<meta[^>]+content=["']([^"']{1,300})["'][^>]+name=["']description["']/i)
    const description = descMatch?.[1]?.trim()

    // Extract meta keywords
    const kwMatch = html.match(/<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']{1,300})["']/i)
    const keywords = kwMatch?.[1]?.trim()

    // Extract OG title/description as fallback
    const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']{1,200})["']/i)
    const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']{1,300})["']/i)

    return {
      title: title ?? ogTitleMatch?.[1]?.trim(),
      description: description ?? ogDescMatch?.[1]?.trim(),
      keywords,
    }
  } catch (err) {
    logger.warn(`Website crawl failed for ${url}`, "SCAN_ENGINE", err)
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main authenticated scan engine (used by /api/projects/[id]/ai-audit)
// ─────────────────────────────────────────────────────────────────────────────
export async function runAIVisibilityScanEngine(scanId: string, projectId: string) {
  logger.info(`Launching AI Search Visibility scan for ID ${scanId}`, "AI_SCAN_ENGINE", { projectId })

  try {
    // 1. Update status to RUNNING
    await db.aIVisibilityScan.update({
      where: { id: scanId },
      data: { status: "RUNNING", startedAt: new Date() },
    })

    // 2. Load Project details, Primary Website, and Competitors
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        websites: true,
        competitors: true,
        organization: true,
      },
    })

    if (!project) throw new Error(`Project ${projectId} not found`)

    const brandName = project.name
    const primaryWebsite = project.websites[0]?.url ?? `https://${project.name.toLowerCase().replace(/\s+/g, "")}.com`
    const competitorDomains = project.competitors.map((c) => c.domain)

    // 3. Crawl the primary website for context
    logger.info(`Crawling website ${primaryWebsite} for context`, "AI_SCAN_ENGINE")
    const pageContext = await crawlWebsiteContext(primaryWebsite)

    // 4. Generate context-aware queries
    const queries = await generateQueriesFromWebsite(primaryWebsite, brandName, competitorDomains, pageContext ?? undefined)

    const evaluationResults: EvaluationResult[] = []
    const engines: AIEngine[] = ["CHATGPT", "GEMINI", "PERPLEXITY", "CLAUDE", "COPILOT", "GROK"]

    // 5. Run all engine × query combinations in parallel batches
    logger.info(`Running ${queries.length} queries × ${engines.length} engines`, "AI_SCAN_ENGINE")

    const allTasks: Promise<{ evalRes: EvaluationResult; queryObj: typeof queries[0]; engine: AIEngine }>[] = []

    for (const queryObj of queries) {
      for (const engine of engines) {
        allTasks.push(
          evaluateQueryVisibility(queryObj, brandName, primaryWebsite, competitorDomains, engine).then((evalRes) => ({
            evalRes,
            queryObj,
            engine,
          }))
        )
      }
    }

    const settled = await Promise.allSettled(allTasks)

    for (const result of settled) {
      if (result.status === "rejected") {
        logger.warn("One evaluation task failed", "AI_SCAN_ENGINE", result.reason)
        continue
      }

      const { evalRes, queryObj, engine } = result.value
      evaluationResults.push(evalRes)

      // Create or update AIPrompt & AIPromptResult
      const prompt = await db.aIPrompt.create({
        data: {
          projectId,
          promptText: queryObj.query,
          category: queryObj.category,
          targetEngine: engine,
        },
      })

      await db.aIPromptResult.create({
        data: {
          scanId,
          promptId: prompt.id,
          engine,
          rawResponse: evalRes.response,
          brandMentioned: evalRes.brandMentioned || evalRes.domainMentioned,
          mentionPosition: evalRes.mentionPosition,
          visibilityScore: evalRes.confidence,
          sentiment: evalRes.sentiment,
          citedUrls: evalRes.citedUrls,
        },
      })

      // Log BrandMention if brand was mentioned
      if (evalRes.brandMentioned || evalRes.domainMentioned) {
        await db.brandMention.create({
          data: {
            projectId,
            engine,
            query: queryObj.query,
            mentionText: evalRes.response.slice(0, 500),
            sentiment: evalRes.sentiment,
          },
        })
      }

      // Log AICitation if URLs were cited
      if (evalRes.citedUrls.length > 0) {
        for (const url of evalRes.citedUrls.slice(0, 5)) {
          await db.aICitation.create({
            data: {
              projectId,
              sourceUrl: url,
              sourceTitle: `${brandName} Reference`,
              citedInEngine: engine,
              citedForQuery: queryObj.query,
              citationStrength: 90,
            },
          })
        }
      }
    }

    // 6. Calculate transparent AI Visibility metrics
    const metrics = calculateAIVisibilityMetrics(evaluationResults)

    // 7. Update AIVisibilityScan record
    const scan = await db.aIVisibilityScan.update({
      where: { id: scanId },
      data: {
        status: "COMPLETED",
        overallScore: metrics.overallVisibilityScore,
        enginesScanned: engines,
        completedAt: new Date(),
      },
    })

    // 8. Store daily AIVisibilityMetric snapshot
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await db.aIVisibilityMetric.upsert({
      where: { projectId_date: { projectId, date: today } },
      update: {
        visibilityScore: metrics.overallVisibilityScore,
        mentionsCount: metrics.mentionsCount,
        citationsCount: evaluationResults.filter((r) => r.citedUrls.length > 0).length,
      },
      create: {
        projectId,
        date: today,
        visibilityScore: metrics.overallVisibilityScore,
        mentionsCount: metrics.mentionsCount,
        citationsCount: evaluationResults.filter((r) => r.citedUrls.length > 0).length,
      },
    })

    // 9. Log metered usage
    await db.usageRecord.create({
      data: {
        organizationId: project.organizationId,
        metric: "ai_scan_count",
        quantity: 1,
      },
    })

    logger.info(
      `AI Scan ${scanId} completed with overall score ${metrics.overallVisibilityScore}%`,
      "AI_SCAN_ENGINE"
    )
    return scan
  } catch (err: any) {
    logger.error(`AI Scan failed for ${scanId}: ${err.message}`, "AI_SCAN_ENGINE", err)
    await db.aIVisibilityScan.update({
      where: { id: scanId },
      data: { status: "FAILED", completedAt: new Date() },
    })
    throw err
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public scan engine — lightweight, no auth, no DB (for public tool page)
// ─────────────────────────────────────────────────────────────────────────────
export async function runPublicAIVisibilityScan(websiteUrl: string) {
  logger.info(`Running public AI visibility scan for ${websiteUrl}`, "PUBLIC_SCAN")

  // Crawl website for context
  const pageContext = await crawlWebsiteContext(websiteUrl)

  // Derive brand name from URL
  let brandName = ""
  try {
    const u = new URL(websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`)
    brandName = u.hostname
      .replace("www.", "")
      .split(".")[0]
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  } catch {
    brandName = websiteUrl
  }

  // Override with page title if available and short
  if (pageContext?.title && pageContext.title.length < 60) {
    const titleBrand = pageContext.title.split(/[|\-–—]/)[0].trim()
    if (titleBrand.length > 2 && titleBrand.length < 40) {
      brandName = titleBrand
    }
  }

  // Generate context-aware queries (fewer for public scan)
  const allQueries = await generateQueriesFromWebsite(websiteUrl, brandName, [], pageContext ?? undefined)
  const queries = allQueries.slice(0, 6) // Limit to 6 queries for public scan

  // Use 6 engines for public scan
  const engines: AIEngine[] = ["CHATGPT", "GEMINI", "PERPLEXITY", "CLAUDE", "COPILOT", "GROK"]

  // Run all in parallel
  const allTasks = queries.flatMap((queryObj) =>
    engines.map((engine) =>
      evaluateQueryVisibility(queryObj, brandName, websiteUrl, [], engine).catch((err) => {
        logger.warn(`Public scan task failed for ${engine}`, "PUBLIC_SCAN", err)
        return null
      })
    )
  )

  const rawResults = await Promise.all(allTasks)
  const evaluationResults = rawResults.filter((r): r is EvaluationResult => r !== null)
  const metrics = calculateAIVisibilityMetrics(evaluationResults)

  return {
    websiteUrl,
    brandName,
    pageContext,
    metrics,
    results: evaluationResults,
    engines,
    queries: queries.map((q) => q.query),
    scannedAt: new Date().toISOString(),
  }
}