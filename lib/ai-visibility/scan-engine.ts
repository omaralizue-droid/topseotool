import { db } from "@/lib/db"
import { generateCommercialQueries } from "./query-generator"
import { evaluateQueryVisibility, calculateAIVisibilityMetrics, EvaluationResult } from "./scanner"
import { logger } from "@/lib/logger"

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

    // 3. Generate commercial search questions across 8 categories
    const queries = generateCommercialQueries(brandName, "Software & Technology", "United States", competitorDomains)

    const evaluationResults: EvaluationResult[] = []
    const engines: Array<"CHATGPT" | "GEMINI" | "PERPLEXITY"> = ["CHATGPT", "GEMINI", "PERPLEXITY"]

    // 4. Run queries across target AI engines
    for (const queryObj of queries) {
      for (const engine of engines) {
        const evalRes = await evaluateQueryVisibility(queryObj, brandName, competitorDomains, engine)
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
            brandMentioned: evalRes.brandMentioned,
            mentionPosition: evalRes.mentionPosition,
            visibilityScore: evalRes.confidence,
            sentiment: evalRes.sentiment,
            citedUrls: evalRes.citedUrls,
          },
        })

        // Log BrandMention if brand was mentioned
        if (evalRes.brandMentioned) {
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

        // Log AICitation if domain URL cited
        if (evalRes.citedUrls.length > 0) {
          for (const url of evalRes.citedUrls) {
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
    }

    // 5. Calculate transparent AI Visibility metrics
    const metrics = calculateAIVisibilityMetrics(evaluationResults)

    // 6. Update AIVisibilityScan record
    const scan = await db.aIVisibilityScan.update({
      where: { id: scanId },
      data: {
        status: "COMPLETED",
        overallScore: metrics.overallVisibilityScore,
        enginesScanned: engines,
        completedAt: new Date(),
      },
    })

    // 7. Store daily AIVisibilityMetric snapshot
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await db.aIVisibilityMetric.upsert({
      where: {
        projectId_date: { projectId, date: today },
      },
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

    // 8. Log metered usage
    await db.usageRecord.create({
      data: {
        organizationId: project.organizationId,
        metric: "ai_scan_count",
        quantity: 1,
      },
    })

    logger.info(`AI Scan ${scanId} completed with overall score ${metrics.overallVisibilityScore}%`, "AI_SCAN_ENGINE")
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