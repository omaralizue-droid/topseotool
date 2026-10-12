import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { findUserByEmail, logAdminAction } from "@/lib/db"
import { createSessionToken, setSessionCookie, toSafeUser } from "@/lib/auth/session"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid JSON request payload." }, { status: 400 })
    }

    const { email, password } = body as { email?: string; password?: string }
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ ok: false, error: "Please enter both email and password." }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const user = await findUserByEmail(normalizedEmail)
    if (!user) {
      return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 })
    }

    if (user.status === "suspended") {
      return NextResponse.json(
        { ok: false, error: "This account has been suspended by an administrator. Please contact support." },
        { status: 403 }
      )
    }

    const passwordValid = bcrypt.compareSync(password, user.passwordHash)
    if (!passwordValid) {
      return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 })
    }

    const token = await createSessionToken(user)
    await setSessionCookie(token)

    if (user.role === "admin") {
      await logAdminAction({
        actorId: user.id,
        actorEmail: user.email,
        action: "auth.login_admin",
        targetType: "user",
        targetId: user.id,
        details: "Administrator logged in to console",
      })
    }

    return NextResponse.json({
      ok: true,
      user: toSafeUser(user),
      redirectUrl: user.role === "admin" ? "/admin" : "/dashboard",
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to sign in."
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
