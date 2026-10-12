import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, toSafeUser } from "@/lib/auth/session"
import { updateUser, findUserByEmail } from "@/lib/db"

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload" }, { status: 400 })
  }

  const { name, email } = body as { name?: string; email?: string }
  const updates: Record<string, string> = {}

  if (name && typeof name === "string" && name.trim().length >= 2) {
    updates.name = name.trim()
  }

  if (email && typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    const norm = email.toLowerCase().trim()
    if (norm !== user.email) {
      const existing = await findUserByEmail(norm)
      if (existing) {
        return NextResponse.json({ ok: false, error: "Email is already taken by another user." }, { status: 409 })
      }
      updates.email = norm
    }
  }

  const updated = await updateUser(user.id, updates)
  if (!updated) {
    return NextResponse.json({ ok: false, error: "Failed to update user." }, { status: 500 })
  }

  return NextResponse.json({ ok: true, user: toSafeUser(updated) })
}
