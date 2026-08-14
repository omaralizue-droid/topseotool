import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { handleApiError, ValidationError } from "@/lib/errors"
import { z } from "zod"

const schema = z.object({ token: z.string().min(1) })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token } = schema.parse(body)

    const verification = await db.verificationToken.findFirst({
      where: { token, expires: { gt: new Date() } }
    })

    if (!verification) {
      throw new ValidationError("Invalid or expired verification token")
    }

    await db.user.update({
      where: { email: verification.identifier },
      data: { emailVerified: new Date() }
    })

    await db.verificationToken.deleteMany({
      where: { identifier: verification.identifier }
    })

    return NextResponse.json({ ok: true, message: "Email verified successfully." })
  } catch (err) {
    return handleApiError(err, "VERIFY_EMAIL")
  }
}