import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { findUserByEmail, createUser } from "@/lib/db"
import { createSessionToken, setSessionCookie, toSafeUser } from "@/lib/auth/session"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid JSON request payload." }, { status: 400 })
    }

    const { name, email, password } = body as {
      name?: string
      email?: string
      password?: string
    }

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ ok: false, error: "Name must be at least 2 characters." }, { status: 400 })
    }
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ ok: false, error: "Please provide a valid email address." }, { status: 400 })
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ ok: false, error: "Password must be at least 8 characters long." }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const existing = await findUserByEmail(normalizedEmail)
    if (existing) {
      return NextResponse.json({ ok: false, error: "An account with this email address already exists." }, { status: 409 })
    }

    const passwordHash = bcrypt.hashSync(password, 10)
    const newUser = await createUser({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "customer",
      plan: "free",
    })

    const token = await createSessionToken(newUser)
    await setSessionCookie(token)

    return NextResponse.json({
      ok: true,
      user: toSafeUser(newUser),
      message: "Account created successfully.",
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to register user."
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
