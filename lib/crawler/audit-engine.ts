import { db } from "@/lib/db"
import { safeFetchWebsite } from "./fetcher"
import { analyzeWebsite } from "./analyzer"
import { logger } from "@/lib/logger"

export async function runSEOAuditEngine(auditId: string, targetUrl: string) {
  logger.info(`Starting real SEO website crawl for audit ID ${auditId}`, "AUDIT_ENGINE", { targetUrl })

  try {
    // 1. Update status to RUNNING
    await db.sEOAudit.update({
      where: { id: auditId },
      data: { status: "RUNNING", startedAt: new Date() }
    })

    // 2. Safely fetch website (with SSRF protection, max size cap, and timeout)
    const fetchResult = await safeFetchWebsite(targetUrl)

    // 3. Analyze HTML and calculate SEO score
    const analysis = analyzeWebsite(fetchResult)

    // 4. Save detected issues to database
    if (analysis.issues.length > 0) {
      await db.sEOIssue.createMany({
        data: analysis.issues.map((issue) => ({
          auditId,
          category: issue.category,
          severity: issue.severity,
          title: issue.title,
          description: issue.explanation,
          recommendation: issue.recommendation,
          affectedUrls: [issue.affectedUrl],
        }))
      })
    }

    // 5. Update SEOAudit record with completed results
    const audit = await db.sEOAudit.update({
      where: { id: auditId },
      data: {
        status: "COMPLETED",
        score: analysis.overallScore,
        issuesCount: analysis.summary.criticalCount,
        warningsCount: analysis.summary.warningCount,
        passedCount: analysis.summary.passedCount,
        summary: JSON.parse(JSON.stringify({
          ...analysis.summary,
          categoryScores: analysis.categoryScores,
        })) as any,
        completedAt: new Date(),
      }
    })

    // 6. Record in AuditHistory for historical visibility tracking
    await db.auditHistory.create({
      data: {
        projectId: audit.projectId,
        auditType: "SEO_AUDIT",
        score: analysis.overallScore,
        totalIssues: analysis.summary.criticalCount,
        totalWarnings: analysis.summary.warningCount,
      }
    })

    // 7. Track usage record
    const project = await db.project.findUnique({
      where: { id: audit.projectId },
      select: { organizationId: true }
    })

    if (project) {
      await db.usageRecord.create({
        data: {
          organizationId: project.organizationId,
          metric: "seo_audit_count",
          quantity: 1,
        }
      })
    }

    logger.info(`Completed SEO audit ${auditId} with score ${analysis.overallScore}`, "AUDIT_ENGINE")
    return audit
  } catch (err: any) {
    logger.error(`SEO Audit failed for ${auditId}: ${err.message}`, "AUDIT_ENGINE", err)
    await db.sEOAudit.update({
      where: { id: auditId },
      data: {
        status: "FAILED",
        completedAt: new Date(),
      }
    })
    throw err
  }
}