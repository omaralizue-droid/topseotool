import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hashPassword } from "@/lib/password"
import { handleApiError, ValidationError } from "@/lib/errors"
import { z } from "zod"

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, password } = schema.parse(body)

    const verification = await db.verificationToken.findFirst({
      where: { token, expires: { gt: new Date() } }
    })

    if (!verification) {
      throw new ValidationError("Invalid or expired reset token")
    }

    const hashedPassword = await hashPassword(password)

    await db.user.update({
      where: { email: verification.identifier },
      data: { password: hashedPassword }
    })

    await db.verificationToken.deleteMany({
      where: { identifier: verification.identifier }
    })

    return NextResponse.json({ ok: true, message: "Password updated successfully." })
  } catch (err) {
    return handleApiError(err, "RESET_PASSWORD")
  }
}