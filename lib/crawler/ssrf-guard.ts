import { URL } from "url"
import net from "net"
import dns from "dns/promises"
import { ValidationError } from "@/lib/errors"

// Forbidden raw protocols
const DISALLOWED_PROTOCOLS = new Set([
  "file:",
  "javascript:",
  "data:",
  "gopher:",
  "dict:",
  "ftp:",
  "ftps:",
  "ldap:",
  "ldaps:",
  "tftp:",
  "mailto:",
  "news:",
  "telnet:",
  "ssh:",
])

// Private and reserved IPv4 ranges
const PRIVATE_IPV4_RANGES = [
  /^127\./,                            // 127.0.0.0/8 Loopback
  /^10\./,                             // 10.0.0.0/8 Private
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,     // 172.16.0.0/12 Private
  /^192\.168\./,                       // 192.168.0.0/16 Private
  /^169\.254\./,                       // 169.254.0.0/16 Link-local / Cloud Metadata (AWS IMDS, GCP, Azure)
  /^0\./,                              // 0.0.0.0/8 Current network
  /^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./, // 100.64.0.0/10 Carrier-grade NAT
  /^192\.0\.0\./,                      // 192.0.0.0/24 IETF Protocol Assignments
  /^192\.0\.2\./,                      // 192.0.2.0/24 TEST-NET-1
  /^198\.(1[8-9])\./,                  // 198.18.0.0/15 Benchmarking
  /^198\.51\.100\./,                   // 198.51.100.0/24 TEST-NET-2
  /^203\.0\.113\./,                    // 203.0.113.0/24 TEST-NET-3
  /^(22[4-9]|23[0-9])\./,              // 224.0.0.0/4 Multicast
  /^(24[0-9]|25[0-5])\./,              // 240.0.0.0/4 Reserved
]

// Private IPv6 prefixes
const PRIVATE_IPV6_PREFIXES = [
  "::1",
  "::",
  "fe80:",  // Link-local
  "fc00:",  // Unique local
  "fd00:",  // Unique local
  "ff00:",  // Multicast
  "::ffff:127.",
  "::ffff:10.",
  "::ffff:172.16.",
  "::ffff:172.17.",
  "::ffff:172.18.",
  "::ffff:172.19.",
  "::ffff:172.20.",
  "::ffff:172.21.",
  "::ffff:172.22.",
  "::ffff:172.23.",
  "::ffff:172.24.",
  "::ffff:172.25.",
  "::ffff:172.26.",
  "::ffff:172.27.",
  "::ffff:172.28.",
  "::ffff:172.29.",
  "::ffff:172.30.",
  "::ffff:172.31.",
  "::ffff:192.168.",
  "::ffff:169.254.",
]

// Known internal/metadata hostnames
const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "local",
  "metadata",
  "metadata.google.internal",
  "instance-data",
  "kubernetes.default",
  "kubernetes.default.svc",
])

export function isPrivateIP(ip: string): boolean {
  const cleanIp = ip.trim().toLowerCase()
  if (net.isIPv4(cleanIp)) {
    return PRIVATE_IPV4_RANGES.some((pattern) => pattern.test(cleanIp))
  }
  if (net.isIPv6(cleanIp)) {
    return PRIVATE_IPV6_PREFIXES.some((prefix) => cleanIp.startsWith(prefix))
  }
  return false
}

export async function validateAndSanitizeUrl(rawUrl: string): Promise<URL> {
  if (!rawUrl || typeof rawUrl !== "string") {
    throw new ValidationError("URL must be a non-empty string.")
  }

  const trimmed = rawUrl.trim()

  // Check raw string for forbidden protocol prefixes before any prefixing
  const lowerRaw = trimmed.toLowerCase()
  for (const proto of DISALLOWED_PROTOCOLS) {
    if (lowerRaw.startsWith(proto)) {
      throw new ValidationError(`Protocol '${proto}' is strictly forbidden for security reasons.`)
    }
  }

  let parsedUrl: URL
  try {
    const prefixed = lowerRaw.startsWith("http://") || lowerRaw.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`
    parsedUrl = new URL(prefixed)
  } catch {
    throw new ValidationError("Invalid URL format. Please provide a valid HTTP or HTTPS web address.")
  }

  // 1. Only allow HTTP and HTTPS protocols
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new ValidationError(`Protocol '${parsedUrl.protocol}' is not allowed. Only HTTP and HTTPS are permitted.`)
  }

  // 2. Block direct IP access to private/loopback/cloud metadata
  const hostname = parsedUrl.hostname.toLowerCase().replace(/^\[|\]$/g, "")

  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith(".internal") || hostname.endsWith(".local")) {
    throw new ValidationError(`Access to internal hostname '${hostname}' is strictly forbidden.`)
  }

  if (net.isIP(hostname)) {
    if (isPrivateIP(hostname)) {
      throw new ValidationError("Access to private IP addresses or cloud metadata servers is forbidden.")
    }
  } else {
    // 3. Resolve hostname via DNS (both IPv4 and IPv6) to prevent DNS rebinding / SSRF
    try {
      const [ipv4Addresses, ipv6Addresses] = await Promise.allSettled([
        dns.resolve4(hostname),
        dns.resolve6(hostname),
      ])

      const resolvedIps: string[] = []
      if (ipv4Addresses.status === "fulfilled") resolvedIps.push(...ipv4Addresses.value)
      if (ipv6Addresses.status === "fulfilled") resolvedIps.push(...ipv6Addresses.value)

      for (const ip of resolvedIps) {
        if (isPrivateIP(ip)) {
          throw new ValidationError(`Host '${hostname}' resolves to private IP range (${ip}). Request blocked for security.`)
        }
      }
    } catch (err) {
      if (err instanceof ValidationError) throw err
      // If DNS resolution fails completely, allow fetcher to handle connection failure or throw clean error
    }
  }

  return parsedUrl
}