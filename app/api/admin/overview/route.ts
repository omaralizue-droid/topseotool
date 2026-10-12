import { NextResponse } from "next/server"
import { requireAdminUser } from "@/lib/auth/session"
import { listUsers, listAllScans, listProviders, listAuditLogs } from "@/lib/db"

export async function GET() {
  try {
    await requireAdminUser()

    const users = await listUsers()
    const scans = await listAllScans()
    const providers = await listProviders()
    const auditLogs = await listAuditLogs(10)

    const totalUsers = users.length
    const activeUsers = users.filter((u) => u.status === "active").length
    const suspendedUsers = users.filter((u) => u.status === "suspended").length
    const customers = users.filter((u) => u.role === "customer").length
    const admins = users.filter((u) => u.role === "admin").length

    const totalScans = scans.length
    const completedScans = scans.filter((s) => s.status === "completed").length
    const failedScans = scans.filter((s) => s.status === "failed").length
    const successRate = totalScans > 0 ? Math.round((completedScans / totalScans) * 100) : 100

    const planCounts = {
      free: users.filter((u) => u.plan === "free").length,
      pro: users.filter((u) => u.plan === "pro").length,
      agency: users.filter((u) => u.plan === "agency").length,
      enterprise: users.filter((u) => u.plan === "enterprise").length,
    }

    const operationalProviders = providers.filter((p) => p.status === "operational").length

    return NextResponse.json({
      ok: true,
      stats: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        customers,
        admins,
        totalScans,
        completedScans,
        failedScans,
        successRate,
        planCounts,
        operationalProviders,
        totalProviders: providers.length,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
        byPlan: planCounts,
      },
      scans: {
        total: totalScans,
        completed: completedScans,
        failed: failedScans,
      },
      providers: {
        total: providers.length,
        healthy: operationalProviders,
        withErrors: providers.filter((p) => p.status === "degraded" || p.status === "offline").length,
      },
      providersList: providers,
      recentAuditLogs: auditLogs,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Access denied"
    return NextResponse.json({ ok: false, error: message }, { status: 403 })
  }
}
