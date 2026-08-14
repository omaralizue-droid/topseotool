import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hashPassword } from "@/lib/password"
import { registerSchema } from "@/lib/validations"
import { slugify } from "@/lib/utils"
import { handleApiError } from "@/lib/errors"
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
    const rl = checkRateLimit(`register:${ip}`, 5, 900_000) // 5 registrations per 15 min
    if (!rl.allowed) return rateLimitResponse(rl.resetMs)

    const body = await req.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 })
    }
    const { name, email, password } = parsed.data

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 })
    }

    const hashed = await hashPassword(password)

    // Create user, organization, and owner membership in a transaction
    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name, email, password: hashed },
      })

      const orgName = `${name}'s Organization`
      const baseSlug = slugify(name || "org")
      const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`

      const org = await tx.organization.create({
        data: { name: orgName, slug, billingEmail: email },
      })

      await tx.organizationMember.create({
        data: { organizationId: org.id, userId: user.id, role: "OWNER" },
      })

      await tx.subscription.create({
        data: { organizationId: org.id, plan: "FREE" as any, status: "ACTIVE" },
      })

      return { user, org }
    })

    return NextResponse.json({ ok: true, userId: result.user.id, orgId: result.org.id }, { status: 201 })
  } catch (err) {
    return handleApiError(err, "REGISTER_POST")
  }
}