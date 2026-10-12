import { NextRequest, NextResponse } from "next/server"
import { requireAdminUser } from "@/lib/auth/session"
import { listUsers, updateUser, logAdminAction, findUserById } from "@/lib/db"

export async function GET() {
  try {
    await requireAdminUser()
    const users = await listUsers()
    // Strip password hashes
    const safe = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      plan: u.plan,
      scanCredits: u.scanCredits,
      totalScansRun: u.totalScansRun,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }))
    return NextResponse.json({ ok: true, users: safe })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Access denied"
    return NextResponse.json({ ok: false, error: message }, { status: 403 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdminUser()
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 })
    }

    const { userId, status, role, plan, adjustCredits } = body as {
      userId?: string
      status?: "active" | "suspended"
      role?: "customer" | "admin"
      plan?: "free" | "pro" | "agency" | "enterprise"
      adjustCredits?: number
    }

    if (!userId) {
      return NextResponse.json({ ok: false, error: "userId is required" }, { status: 400 })
    }

    const targetUser = await findUserById(userId)
    if (!targetUser) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 })
    }

    const updates: any = {}
    const actionsTaken: string[] = []

    if (status && (status === "active" || status === "suspended")) {
      updates.status = status
      actionsTaken.push(`status changed to ${status}`)
    }

    if (role && (role === "customer" || role === "admin")) {
      updates.role = role
      actionsTaken.push(`role changed to ${role}`)
    }

    if (plan && ["free", "pro", "agency", "enterprise"].includes(plan)) {
      updates.plan = plan
      actionsTaken.push(`plan updated to ${plan}`)
    }

    if (typeof adjustCredits === "number") {
      updates.scanCredits = Math.max(0, targetUser.scanCredits + adjustCredits)
      actionsTaken.push(`credits adjusted by ${adjustCredits} (new total: ${updates.scanCredits})`)
    }

    const updated = await updateUser(userId, updates)

    await logAdminAction({
      actorId: admin.id,
      actorEmail: admin.email,
      action: "user.modify",
      targetType: "user",
      targetId: userId,
      details: `Admin ${admin.email} updated ${targetUser.email}: ${actionsTaken.join("; ")}`,
      status: "success",
    })

    return NextResponse.json({ ok: true, user: updated })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Access denied"
    return NextResponse.json({ ok: false, error: message }, { status: 403 })
  }
}
