import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getCurrentUser } from "@/lib/auth/session"
import { updateUser } from "@/lib/db"

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload" }, { status: 400 })
  }

  const { currentPassword, newPassword } = body as {
    currentPassword?: string
    newPassword?: string
  }

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ ok: false, error: "Both current and new passwords are required." }, { status: 400 })
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ ok: false, error: "New password must be at least 8 characters long." }, { status: 400 })
  }

  const valid = bcrypt.compareSync(currentPassword, user.passwordHash)
  if (!valid) {
    return NextResponse.json({ ok: false, error: "Current password is incorrect." }, { status: 400 })
  }

  const newHash = bcrypt.hashSync(newPassword, 10)
  await updateUser(user.id, { passwordHash: newHash })

  return NextResponse.json({ ok: true, message: "Password updated successfully." })
}
