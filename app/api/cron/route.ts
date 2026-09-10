import { NextRequest, NextResponse } from "next/server"
import { SchedulerEngine, ScheduledTaskType } from "@/lib/scheduler/cron-engine"
import { logger } from "@/lib/logger"

/**
 * GET /api/cron
 * Scheduled runner endpoint called by Vercel Cron, GitHub Actions, or external timer.
 * Protected by CRON_SECRET Bearer token when configured.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logger.warn("Unauthorized /api/cron request attempt", "CRON")
      return NextResponse.json({ error: "Unauthorized cron trigger" }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const taskType = searchParams.get("task") as ScheduledTaskType | null

    if (taskType) {
      const result = await SchedulerEngine.executeTask(taskType)
      return NextResponse.json({ success: true, executed: [result] })
    }

    // Otherwise run all scheduled routines
    const results = await SchedulerEngine.runAllDueTasks()
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      executedCount: results.length,
      tasks: results,
    })
  } catch (err: any) {
    logger.error("Failed executing /api/cron", "CRON", { error: err.message })
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

/**
 * POST /api/cron
 * On-demand manual runner for specific scheduled SEO jobs
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const taskType = (body.taskType || body.task) as ScheduledTaskType

    if (!taskType) {
      return NextResponse.json(
        { error: "taskType is required (e.g. WEEKLY_SITE_AUDIT, DAILY_RANK_TRACKING, etc.)" },
        { status: 400 }
      )
    }

    const result = await SchedulerEngine.executeTask(taskType, {
      projectId: body.projectId,
      targetDomain: body.targetDomain,
      userEmail: body.userEmail,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
