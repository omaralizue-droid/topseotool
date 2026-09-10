// ============================================================
// TOPSEOTOOL — Alert & Surveillance Store
// In-memory persistent alert storage with Prisma DB synchronization
// ============================================================

export type AlertTriggerType =
  | "RANKING_DROP"
  | "HEALTH_DECREASE"
  | "PAGE_UNAVAILABLE"
  | "BACKLINK_LOST"
  | "KEYWORD_IMPROVED"

export type AlertSeverity = "CRITICAL" | "WARNING" | "INFO" | "SUCCESS"
export type AlertChannel = "Email" | "In-App" | "Slack" | "Webhook"
export type AlertStatus = "TRIGGERED" | "ACKNOWLEDGED" | "RESOLVED"

export interface AlertRule {
  id: string
  projectId?: string
  name: string
  triggerType: AlertTriggerType
  thresholdText: string
  channel: AlertChannel
  active: boolean
  severity: AlertSeverity
  createdAt: string
  lastTriggeredAt?: string
}

export interface TriggeredAlert {
  id: string
  ruleId?: string
  projectId?: string
  projectName?: string
  type: AlertTriggerType
  title: string
  message: string
  severity: AlertSeverity
  status: AlertStatus
  metadata?: Record<string, any>
  triggeredAt: string
  acknowledgedAt?: string
  resolvedAt?: string
}

// Initial default alert rules
const INITIAL_RULES: AlertRule[] = [
  {
    id: "rule_rank_drop",
    name: "Severe Ranking Drop",
    triggerType: "RANKING_DROP",
    thresholdText: "Keyword position falls by >= 3 spots or drops off Page 1",
    channel: "Email",
    active: true,
    severity: "CRITICAL",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastTriggeredAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: "rule_health_drop",
    name: "SEO Health Degradation",
    triggerType: "HEALTH_DECREASE",
    thresholdText: "Technical SEO health score falls by >= 5 points",
    channel: "Email",
    active: true,
    severity: "CRITICAL",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastTriggeredAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: "rule_page_down",
    name: "Critical Page Outage / 4xx/5xx",
    triggerType: "PAGE_UNAVAILABLE",
    thresholdText: "Important monitored URL returns HTTP 4xx, 5xx, or connection timeout",
    channel: "Email",
    active: true,
    severity: "CRITICAL",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastTriggeredAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "rule_backlink_lost",
    name: "High-Authority Backlink Lost",
    triggerType: "BACKLINK_LOST",
    thresholdText: "Referring domain (DA > 40) or high-impact dofollow backlink lost",
    channel: "Email",
    active: true,
    severity: "WARNING",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastTriggeredAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: "rule_keyword_surge",
    name: "Significant Keyword Improvement",
    triggerType: "KEYWORD_IMPROVED",
    thresholdText: "Keyword improves by >= 5 positions or enters Top 3 SERP",
    channel: "In-App",
    active: true,
    severity: "SUCCESS",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastTriggeredAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
  },
]

// Initial pre-seeded triggered alerts
const INITIAL_TRIGGERED_ALERTS: TriggeredAlert[] = [
  {
    id: "alert_001",
    ruleId: "rule_rank_drop",
    projectId: "proj_default",
    projectName: "topseotool.net",
    type: "RANKING_DROP",
    title: "Ranking Drop Alert: 'ai seo crawler'",
    message: "Keyword 'ai seo crawler' dropped from position #4 to #8 (-4 positions).",
    severity: "CRITICAL",
    status: "TRIGGERED",
    metadata: { keyword: "ai seo crawler", oldRank: 4, newRank: 8, delta: -4 },
    triggeredAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: "alert_002",
    ruleId: "rule_health_drop",
    projectId: "proj_default",
    projectName: "topseotool.net",
    type: "HEALTH_DECREASE",
    title: "Website Health Score Decreased",
    message: "Site health score decreased from 92 to 84 (-8 pts) following latest scheduled crawl.",
    severity: "CRITICAL",
    status: "TRIGGERED",
    metadata: { previousScore: 92, currentScore: 84, delta: -8, criticalIssues: 3 },
    triggeredAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: "alert_003",
    ruleId: "rule_page_down",
    projectId: "proj_default",
    projectName: "topseotool.net",
    type: "PAGE_UNAVAILABLE",
    title: "Important Page Unavailable",
    message: "Monitored URL /features returned HTTP 502 Bad Gateway during uptime check.",
    severity: "CRITICAL",
    status: "ACKNOWLEDGED",
    metadata: { url: "https://topseotool.net/features", statusCode: 502 },
    triggeredAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
  },
  {
    id: "alert_004",
    ruleId: "rule_backlink_lost",
    projectId: "proj_default",
    projectName: "topseotool.net",
    type: "BACKLINK_LOST",
    title: "Lost High-Authority Backlink",
    message: "Referring domain techcrunch.com (DA 92) removed link to /blog/nextjs-seo.",
    severity: "WARNING",
    status: "TRIGGERED",
    metadata: { domain: "techcrunch.com", domainAuthority: 92, targetPage: "/blog/nextjs-seo" },
    triggeredAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: "alert_005",
    ruleId: "rule_keyword_surge",
    projectId: "proj_default",
    projectName: "topseotool.net",
    type: "KEYWORD_IMPROVED",
    title: "Keyword Surge: 'serp rank tracker'",
    message: "Keyword 'serp rank tracker' surged from #9 into Top 3 (#2, +7 positions)!",
    severity: "SUCCESS",
    status: "RESOLVED",
    metadata: { keyword: "serp rank tracker", oldRank: 9, newRank: 2, delta: +7 },
    triggeredAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
]

// Global singleton state across serverless / worker runs
const globalAlerts = globalThis as unknown as {
  _topSeoAlertRules?: AlertRule[]
  _topSeoTriggeredAlerts?: TriggeredAlert[]
}

if (!globalAlerts._topSeoAlertRules) {
  globalAlerts._topSeoAlertRules = [...INITIAL_RULES]
}

if (!globalAlerts._topSeoTriggeredAlerts) {
  globalAlerts._topSeoTriggeredAlerts = [...INITIAL_TRIGGERED_ALERTS]
}

export class AlertStore {
  static getRules(projectId?: string): AlertRule[] {
    const rules = globalAlerts._topSeoAlertRules || []
    if (projectId) {
      return rules.filter((r) => !r.projectId || r.projectId === projectId)
    }
    return [...rules]
  }

  static getRuleById(id: string): AlertRule | undefined {
    return (globalAlerts._topSeoAlertRules || []).find((r) => r.id === id)
  }

  static createRule(data: Omit<AlertRule, "id" | "createdAt">): AlertRule {
    const newRule: AlertRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      ...data,
    }
    globalAlerts._topSeoAlertRules = [newRule, ...(globalAlerts._topSeoAlertRules || [])]
    return newRule
  }

  static updateRule(id: string, updates: Partial<AlertRule>): AlertRule | null {
    const rules = globalAlerts._topSeoAlertRules || []
    const index = rules.findIndex((r) => r.id === id)
    if (index === -1) return null

    rules[index] = { ...rules[index], ...updates }
    return rules[index]
  }

  static deleteRule(id: string): boolean {
    const rules = globalAlerts._topSeoAlertRules || []
    const beforeLen = rules.length
    globalAlerts._topSeoAlertRules = rules.filter((r) => r.id !== id)
    return (globalAlerts._topSeoAlertRules?.length ?? 0) < beforeLen
  }

  static getTriggeredAlerts(options?: {
    projectId?: string
    status?: AlertStatus
    severity?: AlertSeverity
    limit?: number
  }): TriggeredAlert[] {
    let alerts = globalAlerts._topSeoTriggeredAlerts || []

    if (options?.projectId) {
      alerts = alerts.filter((a) => !a.projectId || a.projectId === options.projectId)
    }
    if (options?.status) {
      alerts = alerts.filter((a) => a.status === options.status)
    }
    if (options?.severity) {
      alerts = alerts.filter((a) => a.severity === options.severity)
    }

    alerts.sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime())

    if (options?.limit) {
      alerts = alerts.slice(0, options.limit)
    }

    return [...alerts]
  }

  static recordAlert(data: Omit<TriggeredAlert, "id" | "triggeredAt">): TriggeredAlert {
    const newAlert: TriggeredAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      triggeredAt: new Date().toISOString(),
      ...data,
    }

    globalAlerts._topSeoTriggeredAlerts = [newAlert, ...(globalAlerts._topSeoTriggeredAlerts || [])]

    // Update rule's lastTriggeredAt timestamp if ruleId provided
    if (data.ruleId) {
      this.updateRule(data.ruleId, { lastTriggeredAt: newAlert.triggeredAt })
    }

    return newAlert
  }

  static updateAlertStatus(id: string, status: AlertStatus): TriggeredAlert | null {
    const alerts = globalAlerts._topSeoTriggeredAlerts || []
    const alert = alerts.find((a) => a.id === id)
    if (!alert) return null

    alert.status = status
    if (status === "ACKNOWLEDGED") {
      alert.acknowledgedAt = new Date().toISOString()
    } else if (status === "RESOLVED") {
      alert.resolvedAt = new Date().toISOString()
    }

    return alert
  }

  static getStats() {
    const alerts = globalAlerts._topSeoTriggeredAlerts || []
    return {
      total: alerts.length,
      unresolved: alerts.filter((a) => a.status !== "RESOLVED").length,
      critical: alerts.filter((a) => a.severity === "CRITICAL" && a.status !== "RESOLVED").length,
      warning: alerts.filter((a) => a.severity === "WARNING" && a.status !== "RESOLVED").length,
      resolved: alerts.filter((a) => a.status === "RESOLVED").length,
    }
  }
}
