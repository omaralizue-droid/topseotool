import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { findUserById } from "@/lib/db"
import type { User, UserRole, PlanTier } from "@/lib/db/types"

const COOKIE_NAME = "topseotool_session"
const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || process.env.JWT_SECRET || "topseotool-enterprise-secret-key-min-32-chars-long!"
)

export interface SessionPayload {
  userId: string
  email: string
  role: UserRole
  plan: PlanTier
}

export interface SafeUser {
  id: string
  name: string
  email: string
  role: UserRole
  status: string
  plan: PlanTier
  scanCredits: number
  totalScansRun: number
  createdAt: string
}

export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    plan: user.plan,
    scanCredits: user.scanCredits,
    totalScansRun: user.totalScansRun,
    createdAt: user.createdAt,
  }
}

export async function createSessionToken(user: User): Promise<string> {
  return new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
    plan: user.plan,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY)
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY)
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as UserRole,
      plan: payload.plan as PlanTier,
    }
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null

    const session = await verifySessionToken(token)
    if (!session || !session.userId) return null

    const user = await findUserById(session.userId)
    if (!user || user.status === "suspended") return null

    return user
  } catch {
    return null
  }
}

export async function requireAuthUser(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Unauthorized: Please sign in to access this resource.")
  }
  return user
}

export async function requireAdminUser(): Promise<User> {
  const user = await requireAuthUser()
  if (user.role !== "admin") {
    throw new Error("Forbidden: Administrator access required.")
  }
  return user
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
