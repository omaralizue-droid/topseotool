// ============================================================
// TOPSEOTOOL — Enterprise Input Guard & Injection Defense
// Defends against XSS, Prototype Pollution, SQL Injection & Malicious Payloads
// ============================================================

import { z } from "zod"

/**
 * Escapes HTML characters to prevent Reflected & Stored Cross-Site Scripting (XSS).
 */
export function escapeHtml(str: string): string {
  if (typeof str !== "string") return ""
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
}

/**
 * Strips dangerous HTML tags, inline scripts, event handlers, and javascript: protocols.
 */
export function sanitizeInputString(input: string): string {
  if (typeof input !== "string") return ""

  return input
    // Remove control characters (except newline, carriage return, tab)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Remove script tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove iframe, object, embed, form tags
    .replace(/<\/?(iframe|object|embed|form|link|style|meta|base)\b[^>]*>/gi, "")
    // Remove javascript: and data: URLs
    .replace(/(javascript|vbscript|data):/gi, "$1_blocked:")
    // Remove inline event handlers (onload=, onerror=, onclick=, etc.)
    .replace(/\son\w+\s*=/gi, " on_blocked=")
    .trim()
}

/**
 * Deep sanitization of objects to prevent Prototype Pollution attacks
 * and recursively clean all string values.
 */
export function sanitizeObject<T>(input: T, seen = new WeakSet()): T {
  if (input === null || input === undefined) return input
  if (typeof input === "string") return sanitizeInputString(input) as unknown as T
  if (typeof input !== "object") return input

  if (seen.has(input as object)) return input
  seen.add(input as object)

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeObject(item, seen)) as unknown as T
  }

  if (input instanceof Date || input instanceof RegExp) {
    return input
  }

  const result: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(input)) {
    // 🛡️ Block prototype pollution attempts
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue
    }
    result[key] = sanitizeObject(val, seen)
  }

  return result as T
}

/**
 * SQL Injection Detection: Checks dynamic parameters against common SQL injection attack signatures.
 * (Prisma parameterizes queries automatically; this guard validates raw filters, search terms, and sort orders).
 */
const SQLI_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|UNION|DECLARE)\b)/i,
  /(--|#|\/\*|\*\/)/,
  /(';\s*--)/,
  /(\bOR\b\s+['"\d]+=['"\d]+)/i,
  /(\bAND\b\s+['"\d]+=['"\d]+)/i,
]

export function detectSqlInjection(input: string): boolean {
  if (typeof input !== "string") return false
  const decoded = decodeURIComponent(input)
  return SQLI_PATTERNS.some((pattern) => pattern.test(decoded))
}

/**
 * Ensures an identifier string (such as column name or sort order) is strictly alphanumeric and safe.
 */
export function assertSafeIdentifier(identifier: string, allowedList?: string[]): string {
  if (allowedList && !allowedList.includes(identifier)) {
    throw new Error(`Invalid identifier: "${identifier}". Must be one of: ${allowedList.join(", ")}`)
  }
  if (!/^[a-zA-Z0-9_]{1,64}$/.test(identifier)) {
    throw new Error(`Unsafe SQL identifier detected: "${identifier}"`)
  }
  return identifier
}

/**
 * Reusable Zod custom schemas with built-in sanitization
 */
export const safeString = (min = 1, max = 256) =>
  z
    .string()
    .min(min)
    .max(max)
    .transform((val) => sanitizeInputString(val))

export const safeDomain = z
  .string()
  .min(3)
  .max(128)
  .regex(
    /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
    "Invalid domain format"
  )
  .transform((d) => d.toLowerCase().trim())

export const safeUrl = z
  .string()
  .url("Must be a valid URL")
  .max(2048)
  .refine(
    (url) => url.startsWith("https://") || url.startsWith("http://"),
    "Only HTTP and HTTPS URLs are allowed"
  )
