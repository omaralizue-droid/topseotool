import { NextRequest, NextResponse } from "next/server"
import { AlertStore } from "@/lib/alerts/alert-store"
import { SchedulerEngine } from "@/lib/scheduler/cron-engine"

/**
 * GET /api/alerts
 * Returns active rules, triggered alerts, statistics, and scheduled tasks
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const projectId = searchParams.get("projectId") || undefined
    const status = searchParams.get("status") as any
    const severity = searchParams.get("severity") as any

    const rules = AlertStore.getRules(projectId)
    const alerts = AlertStore.getTriggeredAlerts({ projectId, status, severity })
    const stats = AlertStore.getStats()
    const schedules = SchedulerEngine.getAllSchedules()

    return NextResponse.json({
      success: true,
      stats,
      rules,
      alerts,
      schedules,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

/**
 * POST /api/alerts
 * Create a new custom alert rule
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, triggerType, thresholdText, channel, severity, projectId } = body

    if (!name || !triggerType) {
      return NextResponse.json(
        { error: "name and triggerType are required fields" },
        { status: 400 }
      )
    }

    const newRule = AlertStore.createRule({
      name,
      triggerType,
      thresholdText: thresholdText || "Threshold condition",
      channel: channel || "Email",
      active: true,
      severity: severity || "WARNING",
      projectId,
    })

    return NextResponse.json({ success: true, rule: newRule }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
