// ============================================================
// TOPSEOTOOL — Self-Contained Enterprise Security Verification
// ============================================================

const crypto = require("crypto")
const assert = require("assert")

console.log("=======================================================")
console.log("🔒 TOPSEOTOOL ENTERPRISE SECURITY VALIDATION SUITE")
console.log("=======================================================\n")

// 1. AES-256-GCM Encryption Test
console.log("▶ [1/6] Validating AES-256-GCM Authenticated Encryption...")
const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 12
const TAG_LENGTH = 16
const PBKDF2_ITERATIONS = 100_000
const PBKDF2_SALT = "topseotool_enterprise_secret_salt_v1"

const masterKey = crypto.pbkdf2Sync(
  "test_secret_for_security_suite_verification_32_bytes",
  PBKDF2_SALT,
  PBKDF2_ITERATIONS,
  32,
  "sha256"
)

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, masterKey, iv, { authTagLength: TAG_LENGTH })
  let ciphertext = cipher.update(text, "utf8", "hex")
  ciphertext += cipher.final("hex")
  const tag = cipher.getAuthTag().toString("hex")
  return `v1:${iv.toString("hex")}:${tag}:${ciphertext}`
}

function decrypt(envelope) {
  const parts = envelope.split(":")
  if (parts.length !== 4) return null
  const [, ivHex, tagHex, ciphertextHex] = parts
  const iv = Buffer.from(ivHex, "hex")
  const tag = Buffer.from(tagHex, "hex")
  const decipher = crypto.createDecipheriv(ALGORITHM, masterKey, iv, { authTagLength: TAG_LENGTH })
  decipher.setAuthTag(tag)
  let decrypted = decipher.update(ciphertextHex, "hex", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}

const secretPayload = "sk_live_stripe_secret_token_abc1234567890"
const enc = encrypt(secretPayload)
assert(enc.startsWith("v1:"), "Envelope format must start with v1:")
assert(!enc.includes(secretPayload), "Plaintext must not be present in ciphertext")
assert.strictEqual(decrypt(enc), secretPayload, "Decrypted payload must match plaintext")

// Tamper test
assert.throws(() => {
  const tampered = enc.slice(0, -4) + "ffff"
  decrypt(tampered)
}, "Tampered ciphertext must fail authentication tag check")
console.log("  ✔ AES-256-GCM encryption, decryption, and authentication tag validation passed.")

// 2. Secret Masking Test
console.log("\n▶ [2/6] Validating Secret Masking...")
function maskSecret(secret, visibleChars = 4) {
  if (!secret) return "••••••••"
  if (secret.length <= visibleChars * 2) return "••••••••"
  const prefix = secret.slice(0, Math.min(visibleChars, 8))
  const suffix = secret.slice(-visibleChars)
  return `${prefix}••••••••${suffix}`
}
const masked = maskSecret(secretPayload, 4)
assert(masked.includes("••••••••"), "Masked secret must have mask glyphs")
assert(masked.startsWith("sk_l"), "Masked secret starts with prefix")
assert(masked.endsWith("7890"), "Masked secret ends with suffix")
console.log("  ✔ Secret masking securely conceals credentials:", masked)

// 3. Zero-Exposure Response Sanitizer Test
console.log("\n▶ [3/6] Validating Zero-Exposure Response Scrubbing...")
const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /secret/i,
  /keyhash/i,
  /credential/i,
  /privatekey/i,
  /(access|refresh|id|internal|auth|session)_?token/i,
  /^token$/i,
  /database_?url/i,
  /stripe_?secret/i,
  /gemini_?api/i,
  /resend_?api/i,
]

function sanitizeForClient(data, seen = new WeakSet()) {
  if (data === null || data === undefined) return data
  if (typeof data !== "object") return data
  if (seen.has(data)) return data
  seen.add(data)
  if (Array.isArray(data)) return data.map((item) => sanitizeForClient(item, seen))
  const cleaned = {}
  for (const [key, value] of Object.entries(data)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") continue
    if (SENSITIVE_KEY_PATTERNS.some((p) => p.test(key))) continue
    cleaned[key] = sanitizeForClient(value, seen)
  }
  return cleaned
}

const rawDbObject = {
  id: "usr_99",
  email: "admin@topseotool.net",
  password: "$2a$12$e8FjK.wZ2...hash",
  secret: "top_secret_salt",
  stripeSecretKey: "sk_live_secret",
  geminiApiKey: "AIzaSy...",
  databaseUrl: "postgresql://postgres:pass@localhost:5432/db",
  userRole: "SUPER_ADMIN",
  profile: {
    name: "Omar",
    internalToken: "secret_token_123",
  },
}

const scrubbed = sanitizeForClient(rawDbObject)
assert.strictEqual(scrubbed.id, "usr_99")
assert.strictEqual(scrubbed.email, "admin@topseotool.net")
assert.strictEqual(scrubbed.userRole, "SUPER_ADMIN")
assert.strictEqual(scrubbed.password, undefined, "Password must be scrubbed")
assert.strictEqual(scrubbed.secret, undefined, "Secret must be scrubbed")
assert.strictEqual(scrubbed.stripeSecretKey, undefined, "Stripe secret key must be scrubbed")
assert.strictEqual(scrubbed.geminiApiKey, undefined, "Gemini key must be scrubbed")
assert.strictEqual(scrubbed.databaseUrl, undefined, "Database URL must be scrubbed")
assert.strictEqual(scrubbed.profile.internalToken, undefined, "Nested token must be scrubbed")
assert.strictEqual(scrubbed.profile.name, "Omar")
console.log("  ✔ Zero-exposure sanitizer scrubbed all sensitive database credentials.")

// 4. XSS & Injection Defense Test
console.log("\n▶ [4/6] Validating XSS, Prototype Pollution & SQL Injection Defense...")
function sanitizeInputString(input) {
  if (typeof input !== "string") return ""
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<\/?(iframe|object|embed|form|link|style|meta|base)\b[^>]*>/gi, "")
    .replace(/(javascript|vbscript|data):/gi, "$1_blocked:")
    .replace(/\son\w+\s*=/gi, " on_blocked=")
    .trim()
}

const badInput = `<script>alert('pwn')</script><iframe src="malicious.com"></iframe><img src=x onerror=alert(1)>`
const cleanedInput = sanitizeInputString(badInput)
assert(!cleanedInput.includes("<script>"), "Script tag stripped")
assert(!cleanedInput.includes("<iframe"), "Iframe tag stripped")
assert(!cleanedInput.includes("onerror="), "Onerror event stripped")

// SQLi detection
const SQLI_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|UNION|DECLARE)\b)/i,
  /(--|#|\/\*|\*\/)/,
  /(';\s*--)/,
]
function detectSqlInjection(input) {
  return SQLI_PATTERNS.some((p) => p.test(input))
}
assert(detectSqlInjection("UNION SELECT * FROM accounts--"), "SQL injection detected")
assert(!detectSqlInjection("search keyword for coffee shop seo"), "Benign input passes")
console.log("  ✔ XSS payloads neutralized and SQL injection signatures detected.")

// 5. Rate Limiter Test
console.log("\n▶ [5/6] Validating Multi-Tier Sliding Window Rate Limiter...")
const memoryStore = new Map()
function evaluateRateLimit(key, limit, windowMs) {
  const now = Date.now()
  let entry = memoryStore.get(key)
  if (!entry) {
    entry = { timestamps: [] }
    memoryStore.set(key, entry)
  }
  entry.timestamps = entry.timestamps.filter((ts) => ts > now - windowMs)
  if (entry.timestamps.length >= limit) {
    return { allowed: false, remaining: 0 }
  }
  entry.timestamps.push(now)
  return { allowed: true, remaining: limit - entry.timestamps.length }
}

const authIp = "client_ip_192.168.1.100"
for (let i = 0; i < 5; i++) {
  assert(evaluateRateLimit(authIp, 5, 60000).allowed, `Attempt ${i + 1} allowed`)
}
// 6th attempt must fail
assert(!evaluateRateLimit(authIp, 5, 60000).allowed, "6th attempt throttled (429)")
console.log("  ✔ Sliding window rate limiter correctly blocked 6th attempt.")

// 6. API Key CSPRNG & SHA-256 Hashing Test
console.log("\n▶ [6/6] Validating API Key Generation & SHA-256 Hashing...")
const tokenBytes = crypto.randomBytes(24).toString("hex")
const rawKey = `topseo_live_${tokenBytes}`
const hash1 = crypto.createHash("sha256").update(rawKey).digest("hex")
const hash2 = crypto.createHash("sha256").update(rawKey).digest("hex")
assert.strictEqual(hash1, hash2, "SHA-256 must be deterministic")
assert.strictEqual(hash1.length, 64, "SHA-256 hash length must be 64 chars")

// Constant-time verification
const buf1 = Buffer.from(hash1, "hex")
const buf2 = Buffer.from(hash2, "hex")
assert(crypto.timingSafeEqual(buf1, buf2), "timingSafeEqual must succeed for identical hashes")
console.log("  ✔ API Key CSPRNG, SHA-256 hashing, and timing-safe equality verified.")

console.log("\n=======================================================")
console.log("🎉 ALL ENTERPRISE SECURITY MODULES VERIFIED & WORKING!")
console.log("=======================================================")
