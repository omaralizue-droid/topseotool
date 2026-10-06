import { safeFetch } from "./safe-fetch"
import { evaluateRobots } from "./robots"
import type { SiteSnapshot } from "./types"

const ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", mdash: "—", ndash: "–",
  hellip: "…", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", copy: "©", reg: "®", trade: "™",
}

export function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m)
    .replace(/\s+/g, " ")
    .trim()
}

const stripTags = (s: string) => decodeEntities(s.replace(/<[^>]+>/g, " "))

function metaContent(html: string, attr: "name" | "property", value: string): string | null {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? []
  for (const tag of tags) {
    const a = tag.match(new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`, "i"))?.[1]
    if (a?.toLowerCase() === value) {
      const c = tag.match(/content\s*=\s*"([^"]*)"/i)?.[1] ?? tag.match(/content\s*=\s*'([^']*)'/i)?.[1]
      return c ? decodeEntities(c) : null
    }
  }
  return null
}

function collectSchemaTypes(html: string): string[] {
  const types = new Set<string>()
  const blocks = html.matchAll(/<script[^>]+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  const walk = (node: unknown) => {
    if (Array.isArray(node)) return node.forEach(walk)
    if (node && typeof node === "object") {
      const obj = node as Record<string, unknown>
      const t = obj["@type"]
      if (typeof t === "string") types.add(t)
      if (Array.isArray(t)) t.forEach((x) => typeof x === "string" && types.add(x))
      Object.values(obj).forEach(walk)
    }
  }
  for (const m of blocks) {
    try {
      walk(JSON.parse(m[1].trim()))
    } catch {
      /* ignore malformed JSON-LD */
    }
  }
  return [...types].slice(0, 12)
}

const looksLikeHtml = (body: string) => /^\s*(<!doctype|<html|<head|<body)/i.test(body)

async function fetchText(url: URL, timeoutMs = 5000): Promise<string | null> {
  try {
    const res = await safeFetch(url, { timeoutMs, maxRedirects: 3 })
    if (res.status !== 200 || !res.body.trim()) return null
    return res.body
  } catch {
    return null
  }
}

export async function crawlSite(target: URL): Promise<SiteSnapshot> {
  const origin = target.origin
  const domain = target.hostname.replace(/^www\./, "").toLowerCase()

  const [homepage, robotsTxt, llmsTxt, sitemapXml] = await Promise.all([
    safeFetch(target, { timeoutMs: 9000 }).then(
      (r) => ({ ok: true as const, r }),
      (e: Error) => ({ ok: false as const, error: e.message })
    ),
    fetchText(new URL("/robots.txt", origin)),
    fetchText(new URL("/llms.txt", origin)),
    fetchText(new URL("/sitemap.xml", origin)),
  ])

  const robotsValid = robotsTxt && !looksLikeHtml(robotsTxt) ? robotsTxt : null
  const { bots, sitemaps } = evaluateRobots(robotsValid)

  const snapshot: SiteSnapshot = {
    inputUrl: target.href,
    finalUrl: target.href,
    domain,
    reachable: false,
    fetchError: null,
    statusCode: null,
    responseTimeMs: null,
    https: target.protocol === "https:",
    title: null,
    description: null,
    h1: [],
    h2: [],
    canonical: null,
    lang: null,
    hasOpenGraph: false,
    schemaTypes: [],
    wordCount: 0,
    totalImages: 0,
    imagesMissingAlt: 0,
    robotsNoindex: false,
    robotsTxtFound: !!robotsValid,
    sitemapFound: sitemaps.length > 0 || (!!sitemapXml && /<(urlset|sitemapindex)\b/i.test(sitemapXml)),
    llmsTxtFound: !!llmsTxt && !looksLikeHtml(llmsTxt) && llmsTxt.trim().length > 20,
    bots,
    textSample: "",
  }

  if (!homepage.ok) {
    snapshot.fetchError = homepage.error
    return snapshot
  }

  const { r } = homepage
  const html = r.body
  const finalUrl = new URL(r.finalUrl)
  snapshot.finalUrl = r.finalUrl
  snapshot.https = finalUrl.protocol === "https:"
  snapshot.statusCode = r.status
  snapshot.responseTimeMs = r.responseTimeMs
  snapshot.reachable = r.status < 400 && html.length > 0
  if (!snapshot.reachable) {
    snapshot.fetchError = `The site responded with HTTP ${r.status}${r.status === 403 ? " (likely a bot firewall)" : ""}.`
  }

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
  snapshot.title = title ? decodeEntities(title).slice(0, 200) || null : null
  snapshot.description = metaContent(html, "name", "description")?.slice(0, 400) || null
  snapshot.h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => stripTags(m[1])).filter(Boolean).slice(0, 5)
  snapshot.h2 = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) => stripTags(m[1])).filter(Boolean).slice(0, 12)
  snapshot.canonical = html.match(/<link\b[^>]*rel\s*=\s*["']canonical["'][^>]*>/i)?.[0].match(/href\s*=\s*["']([^"']+)["']/i)?.[1] ?? null
  snapshot.lang = html.match(/<html\b[^>]*\blang\s*=\s*["']([^"']+)["']/i)?.[1] ?? null
  snapshot.hasOpenGraph = !!metaContent(html, "property", "og:title") || !!metaContent(html, "property", "og:image")
  snapshot.schemaTypes = collectSchemaTypes(html)
  snapshot.robotsNoindex = /noindex/i.test(metaContent(html, "name", "robots") ?? "")

  const imgs = html.match(/<img\b[^>]*>/gi) ?? []
  snapshot.totalImages = imgs.length
  snapshot.imagesMissingAlt = imgs.filter((t) => !/\balt\s*=\s*["'][^"']+["']/i.test(t)).length

  const body = html.match(/<body\b[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html
  const text = decodeEntities(
    body
      .replace(/<(script|style|noscript|svg|template|iframe)\b[\s\S]*?<\/\1>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " ")
  )
  snapshot.wordCount = text.split(" ").filter((w) => /[a-z]{2,}/i.test(w)).length
  snapshot.textSample = text.slice(0, 3000)

  return snapshot
}
