import { NextResponse } from "next/server"
import { getCurrentUser, clearSessionCookie } from "@/lib/auth/session"
import { deleteUser } from "@/lib/db"

export async function DELETE() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  if (user.role === "admin") {
    return NextResponse.json({ ok: false, error: "Primary administrator accounts cannot be deleted directly." }, { status: 400 })
  }

  await deleteUser(user.id)
  await clearSessionCookie()

  return NextResponse.json({ ok: true, message: "Account deleted successfully." })
}
