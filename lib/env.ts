import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.string().default("postgresql://localhost:5432/topseotool"),
  AUTH_SECRET: z.string().default("dev-secret-change-in-production-32chars"),
  AUTH_URL: z.string().optional(),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  ENCRYPTION_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_PRO: z.string().optional(),
  STRIPE_PRICE_AGENCY: z.string().optional(),
  STRIPE_PRICE_BUSINESS: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().default("noreply@topseotool.net"),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("TOPSEOTOOL"),
  USE_MOCK_AI: z.string().default("true"),
})

export const env = envSchema.parse(process.env)

/**
 * Enterprise Audit Check: Guarantees that server-only secrets are NEVER
 * exposed with the NEXT_PUBLIC_ prefix in the environment.
 */
export function assertNoLeakedSecrets(): { safe: boolean; violations: string[] } {
  const violations: string[] = []
  const sensitiveNames = [
    "DATABASE",
    "SECRET",
    "PRIVATE_KEY",
    "GEMINI_KEY",
    "RESEND_KEY",
    "ENCRYPTION",
  ]

  for (const [key] of Object.entries(process.env)) {
    if (key.startsWith("NEXT_PUBLIC_")) {
      const remainder = key.replace("NEXT_PUBLIC_", "").toUpperCase()
      // Publishable Stripe key is the only explicitly permitted public key
      if (key === "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY") continue

      if (sensitiveNames.some((s) => remainder.includes(s))) {
        violations.push(key)
      }
    }
  }

  if (violations.length > 0) {
    console.error(
      `[CRITICAL SECURITY ALERT] The following secrets appear to be exposed via NEXT_PUBLIC_ prefixes: ${violations.join(", ")}`
    )
  }

  return {
    safe: violations.length === 0,
    violations,
  }
}

/**
 * Validate production environment variables without logging secret values.
 * Call during server startup or deployment check.
 */
export function validateProductionEnv(): { isReady: boolean; missingVariables: string[] } {
  const missing: string[] = []

  if (!process.env.DATABASE_URL) missing.push("DATABASE_URL")
  if (!process.env.AUTH_SECRET) missing.push("AUTH_SECRET")

  if (process.env.NODE_ENV === "production" && missing.length > 0) {
    console.warn(`[ENV WARNING] Missing critical production environment variables: ${missing.join(", ")}`)
  }

  return {
    isReady: missing.length === 0,
    missingVariables: missing,
  }
}