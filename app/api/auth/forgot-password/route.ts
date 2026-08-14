import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { handleApiError } from "@/lib/errors"
import { z } from "zod"

const schema = z.object({ email: z.string().email() })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = schema.parse(body)

    const user = await db.user.findUnique({ where: { email } })
    if (user) {
      const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
      const expires = new Date(Date.now() + 3600 * 1000) // 1 hour

      await db.verificationToken.create({
        data: { identifier: email, token, expires }
      })

      // In production, send email via Resend API
      console.log(`[AUTH] Password reset link for ${email}: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`)
    }

    return NextResponse.json({ ok: true, message: "If an account exists, a reset link was sent." })
  } catch (err) {
    return handleApiError(err, "FORGOT_PASSWORD")
  }
}