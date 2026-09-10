// ============================================================
// TOPSEOTOOL — Multi-Channel Alert & Notification Engine
// Evaluates SEO trigger conditions and dispatches alerts asynchronously
// ============================================================

import { AlertStore, AlertTriggerType, AlertSeverity, TriggeredAlert } from "./alert-store"
import { jobQueue } from "@/lib/jobs/queue-core"
import { logger } from "@/lib/logger"

export interface AlertEvaluationContext {
  projectId: string
  projectName?: string
  recipientEmail?: string
}

export class AlertEngine {
  /**
   * 1. RANKING DROPS
   * Triggers when a keyword drops by >= 3 positions, falls out of top 3, or drops off page 1
   */
  static async evaluateRankingDrop(
    ctx: AlertEvaluationContext,
    payload: {
      keyword: string
      oldPosition: number
      newPosition: number
      url?: string
    }
  ): Promise<TriggeredAlert | null> {
    const delta = payload.oldPosition - payload.newPosition // negative means dropped

    const isDrop = delta <= -3 || (payload.oldPosition <= 10 && payload.newPosition > 10)
    if (!isDrop) return null

    const dropAmount = Math.abs(delta)
    const title = `Ranking Drop: '${payload.keyword}' fell ${dropAmount} positions`
    const message = `Keyword '${payload.keyword}' dropped from #${payload.oldPosition} to #${payload.newPosition} (-${dropAmount} positions)${
      payload.url ? ` for URL: ${payload.url}` : ""
    }. Immediate content & link review recommended.`

    const alert = AlertStore.recordAlert({
      ruleId: "rule_rank_drop",
      projectId: ctx.projectId,
      projectName: ctx.projectName || "Default Project",
      type: "RANKING_DROP",
      title,
      message,
      severity: "CRITICAL",
      status: "TRIGGERED",
      metadata: {
        keyword: payload.keyword,
        oldPosition: payload.oldPosition,
        newPosition: payload.newPosition,
        delta,
        url: payload.url,
      },
    })

    // Enqueue background email alert
    await this.dispatchEmailNotification(ctx.recipientEmail, title, message, "RANK_DROP_ALERT", alert.id)

    logger.warn(`[AlertEngine] Triggered RANKING_DROP for keyword '${payload.keyword}' (${payload.oldPosition} -> ${payload.newPosition})`, "ALERTS")
    return alert
  }

  /**
   * 2. WEBSITE HEALTH DECREASES
   * Triggers when overall SEO audit health score drops by >= 5 points or critical issues surge
   */
  static async evaluateHealthDecrease(
    ctx: AlertEvaluationContext,
    payload: {
      previousScore: number
      currentScore: number
      newCriticalIssues?: number
      auditId?: string
    }
  ): Promise<TriggeredAlert | null> {
    const delta = payload.currentScore - payload.previousScore

    const isDecrease = delta <= -5 || (payload.newCriticalIssues && payload.newCriticalIssues >= 3)
    if (!isDecrease) return null

    const ptsLost = Math.abs(delta)
    const title = `Website Health Decreased (-${ptsLost} pts)`
    const message = `Site health dropped from ${payload.previousScore} to ${payload.currentScore} (-${ptsLost} pts). ${
      payload.newCriticalIssues ? `Discovered ${payload.newCriticalIssues} new critical technical issues.` : ""
    }`

    const alert = AlertStore.recordAlert({
      ruleId: "rule_health_drop",
      projectId: ctx.projectId,
      projectName: ctx.projectName || "Default Project",
      type: "HEALTH_DECREASE",
      title,
      message,
      severity: "CRITICAL",
      status: "TRIGGERED",
      metadata: {
        previousScore: payload.previousScore,
        currentScore: payload.currentScore,
        delta,
        newCriticalIssues: payload.newCriticalIssues || 0,
        auditId: payload.auditId,
      },
    })

    await this.dispatchEmailNotification(ctx.recipientEmail, title, message, "HEALTH_DECREASE_ALERT", alert.id)

    logger.warn(`[AlertEngine] Triggered HEALTH_DECREASE for project ${ctx.projectId} (${payload.previousScore} -> ${payload.currentScore})`, "ALERTS")
    return alert
  }

  /**
   * 3. IMPORTANT PAGES BECOME UNAVAILABLE
   * Triggers when monitored URLs return 4xx, 5xx, or connection timeout
   */
  static async evaluatePageAvailability(
    ctx: AlertEvaluationContext,
    payload: {
      url: string
      statusCode: number
      responseTimeMs?: number
      errorDetails?: string
    }
  ): Promise<TriggeredAlert | null> {
    const isError = payload.statusCode >= 400 || payload.statusCode === 0
    if (!isError) return null

    const title = `Important Page Unavailable (${payload.statusCode || "Timeout"})`
    const message = `Monitored page ${payload.url} returned HTTP ${payload.statusCode || "Connection Timeout"}${
      payload.errorDetails ? ` (${payload.errorDetails})` : ""
    }. Search engine indexing may be impaired.`

    const alert = AlertStore.recordAlert({
      ruleId: "rule_page_down",
      projectId: ctx.projectId,
      projectName: ctx.projectName || "Default Project",
      type: "PAGE_UNAVAILABLE",
      title,
      message,
      severity: "CRITICAL",
      status: "TRIGGERED",
      metadata: {
        url: payload.url,
        statusCode: payload.statusCode,
        responseTimeMs: payload.responseTimeMs,
        errorDetails: payload.errorDetails,
      },
    })

    await this.dispatchEmailNotification(ctx.recipientEmail, title, message, "PAGE_OUTAGE_ALERT", alert.id)

    logger.error(`[AlertEngine] Triggered PAGE_UNAVAILABLE for ${payload.url} (HTTP ${payload.statusCode})`, "ALERTS")
    return alert
  }

  /**
   * 4. BACKLINKS ARE LOST
   * Triggers when referring domains or high-authority backlinks are removed or dropped
   */
  static async evaluateBacklinkLost(
    ctx: AlertEvaluationContext,
    payload: {
      lostDomain: string
      domainAuthority: number
      targetUrl: string
      linkType?: "dofollow" | "nofollow"
    }
  ): Promise<TriggeredAlert | null> {
    const title = `Lost Backlink from ${payload.lostDomain} (DA ${payload.domainAuthority})`
    const message = `Referring domain ${payload.lostDomain} (DA ${payload.domainAuthority}) removed backlink pointing to ${payload.targetUrl}.`

    const alert = AlertStore.recordAlert({
      ruleId: "rule_backlink_lost",
      projectId: ctx.projectId,
      projectName: ctx.projectName || "Default Project",
      type: "BACKLINK_LOST",
      title,
      message,
      severity: payload.domainAuthority >= 50 ? "CRITICAL" : "WARNING",
      status: "TRIGGERED",
      metadata: {
        lostDomain: payload.lostDomain,
        domainAuthority: payload.domainAuthority,
        targetUrl: payload.targetUrl,
        linkType: payload.linkType || "dofollow",
      },
    })

    await this.dispatchEmailNotification(ctx.recipientEmail, title, message, "BACKLINK_LOST_ALERT", alert.id)

    logger.info(`[AlertEngine] Triggered BACKLINK_LOST for domain ${payload.lostDomain} (DA ${payload.domainAuthority})`, "ALERTS")
    return alert
  }

  /**
   * 5. KEYWORDS IMPROVE SIGNIFICANTLY
   * Triggers when a keyword jumps by >= 5 spots, enters Top 10, or enters Top 3
   */
  static async evaluateKeywordImprovement(
    ctx: AlertEvaluationContext,
    payload: {
      keyword: string
      oldPosition: number
      newPosition: number
      url?: string
    }
  ): Promise<TriggeredAlert | null> {
    const gain = payload.oldPosition - payload.newPosition // positive means improved

    const isSignificant =
      gain >= 5 ||
      (payload.oldPosition > 10 && payload.newPosition <= 10) ||
      (payload.oldPosition > 3 && payload.newPosition <= 3)

    if (!isSignificant) return null

    const title = `Keyword Surged: '${payload.keyword}' gained +${gain} spots!`
    const message = `Keyword '${payload.keyword}' improved from #${payload.oldPosition} to #${payload.newPosition} (+${gain} positions)${
      payload.newPosition <= 3 ? " and is now in the TOP 3 SERP!" : "!"
    }`

    const alert = AlertStore.recordAlert({
      ruleId: "rule_keyword_surge",
      projectId: ctx.projectId,
      projectName: ctx.projectName || "Default Project",
      type: "KEYWORD_IMPROVED",
      title,
      message,
      severity: "SUCCESS",
      status: "TRIGGERED",
      metadata: {
        keyword: payload.keyword,
        oldPosition: payload.oldPosition,
        newPosition: payload.newPosition,
        gain,
        url: payload.url,
      },
    })

    await this.dispatchEmailNotification(ctx.recipientEmail, title, message, "KEYWORD_IMPROVED_ALERT", alert.id)

    logger.info(`[AlertEngine] Triggered KEYWORD_IMPROVED for keyword '${payload.keyword}' (${payload.oldPosition} -> #${payload.newPosition})`, "ALERTS")
    return alert
  }

  /**
   * Asynchronously enqueues an email notification into the background queue
   */
  private static async dispatchEmailNotification(
    recipientEmail: string | undefined,
    subject: string,
    message: string,
    template: string,
    alertId: string
  ) {
    const recipient = recipientEmail || "admin@topseotool.net"
    try {
      await jobQueue.enqueue(
        "EMAIL_NOTIFICATION",
        {
          recipient,
          subject: `[TopSEOTool Alert] ${subject}`,
          template,
          data: {
            alertId,
            message,
            timestamp: new Date().toISOString(),
          },
        },
        { priority: "HIGH" }
      )
    } catch (err: any) {
      logger.error(`Failed to enqueue email notification for alert ${alertId}`, "ALERTS", { error: err.message })
    }
  }
}
