// ============================================================
// TOPSEOTOOL — Enterprise Secret Encryption & Key Management
// AES-256-GCM Authenticated Encryption for Sensitive Secrets
// ============================================================

import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 12 // 96 bits for GCM
const TAG_LENGTH = 16 // 128 bits
const PBKDF2_ITERATIONS = 100_000
const PBKDF2_SALT = "topseotool_enterprise_secret_salt_v1"

let cachedMasterKey: Buffer | null = null

/**
 * Derive a 256-bit symmetric encryption key from environment secrets.
 * Uses PBKDF2 with 100,000 iterations to generate key material.
 */
function getMasterKey(): Buffer {
  if (cachedMasterKey) return cachedMasterKey

  const secretSource =
    process.env.ENCRYPTION_KEY ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "default_enterprise_fallback_master_secret_32_bytes_long"

  // If already a 64-char hex string (32 bytes), parse directly
  if (/^[0-9a-fA-F]{64}$/.test(secretSource)) {
    cachedMasterKey = Buffer.from(secretSource, "hex")
    return cachedMasterKey
  }

  // Otherwise derive deterministically via PBKDF2
  cachedMasterKey = crypto.pbkdf2Sync(
    secretSource,
    PBKDF2_SALT,
    PBKDF2_ITERATIONS,
    32,
    "sha256"
  )
  return cachedMasterKey
}

export interface EncryptedPayload {
  version: "v1"
  iv: string // hex
  tag: string // hex
  ciphertext: string // hex
}

/**
 * Encrypts a sensitive string (API key, webhook secret, token) using AES-256-GCM.
 * Returns a serialized envelope: `v1:<iv_hex>:<tag_hex>:<ciphertext_hex>`
 */
export function encryptSecret(plaintext: string): string {
  if (!plaintext) return ""

  const key = getMasterKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH })

  let ciphertext = cipher.update(plaintext, "utf8", "hex")
  ciphertext += cipher.final("hex")
  const tag = cipher.getAuthTag().toString("hex")

  return `v1:${iv.toString("hex")}:${tag}:${ciphertext}`
}

/**
 * Decrypts an AES-256-GCM encrypted envelope.
 * Returns the decrypted plaintext string, or null if decryption fails / signature mismatch.
 */
export function decryptSecret(envelope: string): string | null {
  if (!envelope || !envelope.startsWith("v1:")) return null

  try {
    const parts = envelope.split(":")
    if (parts.length !== 4) return null

    const [, ivHex, tagHex, ciphertextHex] = parts
    const key = getMasterKey()
    const iv = Buffer.from(ivHex, "hex")
    const tag = Buffer.from(tagHex, "hex")

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH })
    decipher.setAuthTag(tag)

    let decrypted = decipher.update(ciphertextHex, "hex", "utf8")
    decrypted += decipher.final("utf8")
    return decrypted
  } catch {
    // Decryption or authentication tag failure
    return null
  }
}

/**
 * Masks a secret string for safe display in administrative user interfaces.
 * Example: `sk_live_1234567890abcdef` -> `sk_live_••••••••cdef`
 */
export function maskSecret(secret: string | null | undefined, visibleChars = 4): string {
  if (!secret) return "••••••••"
  if (secret.length <= visibleChars * 2) return "••••••••"

  const prefix = secret.slice(0, Math.min(visibleChars, 8))
  const suffix = secret.slice(-visibleChars)
  return `${prefix}••••••••${suffix}`
}

/**
 * Generates a cryptographically secure random secret token (CSPRNG).
 */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex")
}
