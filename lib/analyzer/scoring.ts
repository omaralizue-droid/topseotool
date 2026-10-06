// Transparent, deterministic scoring. Pure functions — safe to import in client components.
import type { ProbeResult, ReadinessCheck, SiteSnapshot, CheckStatus } from "./types"

const SEARCH_BOTS = ["OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "Claude-SearchBot", "Googlebot", "Bingbot"]
const TRAINING_BOTS = ["GPTBot", "ClaudeBot", "Google-Extended", "CCBot", "Applebot-Extended", "Meta-ExternalAgent"]
const ENTITY_SCHEMAS = /^(Organization|Corporation|LocalBusiness|Product|SoftwareApplication|WebApplication|Service|Brand|OnlineStore|Store|ProfessionalService|MobileApplication)$/i

export function buildReadinessChecks(s: SiteSnapshot): ReadinessCheck[] {
  const checks: ReadinessCheck[] = []
  const add = (id: string, label: string, weight: number, status: CheckStatus, detail: string) =>
    checks.push({ id, label, weight, status, detail })
  const unreadable = "We couldn't read the page, so this couldn't be verified."

  add("reachable", "Page reachable by crawlers", 10, s.reachable ? "pass" : "fail",
    s.reachable ? `Responded with HTTP ${s.statusCode}.` : s.fetchError ?? "The page could not be fetched.")

  const searchBlocked = s.bots.filter((b) => SEARCH_BOTS.includes(b.id) && b.status === "blocked")
  const searchPartial = s.bots.filter((b) => SEARCH_BOTS.includes(b.id) && b.status === "partial")
  add("ai-search-bots", "AI search crawlers allowed", 20,
    searchBlocked.length ? "fail" : searchPartial.length ? "warn" : "pass",
    searchBlocked.length
      ? `robots.txt blocks ${searchBlocked.map((b) => b.name).join(", ")} — these engines can't read or cite you.`
      : searchPartial.length
        ? `${searchPartial.map((b) => b.name).join(", ")} are partially restricted by robots.txt.`
        : "ChatGPT search, Perplexity, Claude, Google and Bing crawlers can all access your site.")

  const trainingBlocked = s.bots.filter((b) => TRAINING_BOTS.includes(b.id) && b.status === "blocked")
  add("ai-training-bots", "AI training crawlers", 5, trainingBlocked.length ? "warn" : "pass",
    trainingBlocked.length
      ? `${trainingBlocked.map((b) => b.name).join(", ")} blocked. Fine if intentional, but models will learn less about you.`
      : "Training crawlers are allowed, so future models can learn about your brand.")

  add("indexable", "Page is indexable", 5, s.robotsNoindex ? "fail" : s.reachable ? "pass" : "warn",
    s.robotsNoindex ? "A meta robots noindex tag hides this page from search and AI engines." : s.reachable ? "No noindex directive found." : unreadable)

  const entity = s.schemaTypes.filter((t) => ENTITY_SCHEMAS.test(t))
  add("schema", "Entity structured data (JSON-LD)", 12,
    entity.length ? "pass" : s.schemaTypes.length ? "warn" : "fail",
    entity.length
      ? `Found ${entity.join(", ")} schema — AI engines can verify who you are.`
      : s.schemaTypes.length
        ? `Found ${s.schemaTypes.slice(0, 4).join(", ")}, but no Organization/Product entity schema.`
        : s.reachable ? "No JSON-LD found. AI engines have to guess basic facts about your brand." : unreadable)

  add("llms-txt", "llms.txt file", 8, s.llmsTxtFound ? "pass" : "warn",
    s.llmsTxtFound ? "An /llms.txt file gives AI tools a clean summary of your site." : "No /llms.txt. It's an emerging standard that gives AI models a curated summary of your brand.")

  const tl = s.title?.length ?? 0
  add("title", "Title tag", 8, !s.title ? "fail" : tl >= 20 && tl <= 65 ? "pass" : "warn",
    !s.title ? (s.reachable ? "Missing <title> tag." : unreadable) : `"${s.title}" (${tl} chars${tl < 20 ? ", too short" : tl > 65 ? ", may be truncated" : ""}).`)

  const dl = s.description?.length ?? 0
  add("description", "Meta description", 8, !s.description ? "fail" : dl >= 70 && dl <= 170 ? "pass" : "warn",
    !s.description ? (s.reachable ? "Missing meta description — AI and search snippets lose a clear summary." : unreadable) : `${dl} characters${dl < 70 ? " — too thin to describe what you do" : dl > 170 ? " — will be truncated" : ""}.`)

  add("h1", "Single clear H1", 6, s.h1.length === 1 ? "pass" : s.h1.length > 1 ? "warn" : "fail",
    s.h1.length === 1 ? `"${s.h1[0].slice(0, 90)}"` : s.h1.length > 1 ? `${s.h1.length} H1 tags found — keep one primary topic.` : s.reachable ? "No H1 heading found." : unreadable)

  add("content", "Content depth", 8, s.wordCount >= 400 ? "pass" : s.wordCount >= 150 ? "warn" : "fail",
    s.reachable
      ? `${s.wordCount.toLocaleString()} words of readable text${s.wordCount < 150 ? " — likely rendered by JavaScript, which many AI crawlers can't execute" : s.wordCount < 400 ? " — thin for AI engines to extract facts from" : ""}.`
      : unreadable)

  add("https", "HTTPS", 4, s.https ? "pass" : "fail", s.https ? "Served securely over HTTPS." : "Site is not served over HTTPS.")
  add("sitemap", "XML sitemap", 4, s.sitemapFound ? "pass" : "warn", s.sitemapFound ? "Sitemap found." : "No sitemap found at /sitemap.xml or in robots.txt.")

  const rt = s.responseTimeMs
  add("speed", "Server response time", 2, rt == null ? "warn" : rt < 1500 ? "pass" : rt < 3500 ? "warn" : "fail",
    rt == null ? unreadable : `${rt} ms${rt >= 1500 ? " — slow responses can cause AI crawlers to time out" : ""}.`)

  return checks
}

export function readinessScore(checks: ReadinessCheck[]): number {
  const total = checks.reduce((s, c) => s + c.weight, 0) || 1
  const earned = checks.reduce((s, c) => s + (c.status === "pass" ? c.weight : c.status === "warn" ? c.weight / 2 : 0), 0)
  return Math.round((earned / total) * 100)
}

const UNBRANDED = new Set(["category", "problem"])
const PROMINENCE_VALUE = { lead: 1, listed: 0.6, passing: 0.3, absent: 0 } as const
const SENTIMENT_VALUE = { positive: 1, neutral: 0.6, mixed: 0.5, negative: 0, "n/a": 0 } as const

export interface VisibilityBreakdown {
  score: number
  discoveryRate: number
  recognitionRate: number
  prominence: number
  citationRate: number
  sentiment: number
  answered: number
  mentions: number
}

export function visibilityScore(probes: ProbeResult[]): VisibilityBreakdown | null {
  const ok = probes.filter((p) => p.status === "ok")
  if (!ok.length) return null
  const rate = (arr: ProbeResult[], f: (p: ProbeResult) => boolean) => (arr.length ? arr.filter(f).length / arr.length : 0)

  const unbranded = ok.filter((p) => UNBRANDED.has(p.intent))
  const branded = ok.filter((p) => !UNBRANDED.has(p.intent))
  const mentioned = ok.filter((p) => p.mentioned)

  const discoveryRate = rate(unbranded, (p) => p.mentioned)
  const recognitionRate = rate(branded, (p) => p.mentioned)
  const prominence = ok.reduce((s, p) => s + PROMINENCE_VALUE[p.prominence], 0) / ok.length
  const citationRate = rate(ok, (p) => p.domainCited)
  const sentiment = mentioned.length ? mentioned.reduce((s, p) => s + SENTIMENT_VALUE[p.sentiment], 0) / mentioned.length : 0

  const score = Math.round(
    (unbranded.length ? discoveryRate * 35 : recognitionRate * 35) +
      (branded.length ? recognitionRate * 15 : discoveryRate * 15) +
      prominence * 20 + citationRate * 20 + sentiment * 10
  )

  return {
    score,
    discoveryRate: Math.round(discoveryRate * 100),
    recognitionRate: Math.round(recognitionRate * 100),
    prominence: Math.round(prominence * 100),
    citationRate: Math.round(citationRate * 100),
    sentiment: Math.round(sentiment * 100),
    answered: ok.length,
    mentions: mentioned.length,
  }
}

export function overallScore(visibility: number | null, readiness: number): number {
  return visibility == null ? readiness : Math.round(visibility * 0.6 + readiness * 0.4)
}

export function scoreLabel(score: number): { label: string; tone: "great" | "good" | "fair" | "poor" } {
  if (score >= 80) return { label: "Excellent", tone: "great" }
  if (score >= 60) return { label: "Good", tone: "good" }
  if (score >= 40) return { label: "Needs work", tone: "fair" }
  return { label: "Low", tone: "poor" }
}

/** Counts how often each brand is named across AI answers (share of voice). */
export function shareOfVoice(probes: ProbeResult[], brand: string): { name: string; count: number; isTarget: boolean }[] {
  const counts = new Map<string, { name: string; count: number }>()
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "")
  const target = norm(brand)
  let targetCount = 0

  for (const p of probes) {
    if (p.status !== "ok") continue
    if (p.mentioned) targetCount++
    const seen = new Set<string>()
    for (const raw of p.brandsNamed) {
      const key = norm(raw)
      if (!key || seen.has(key) || key === target || key.includes(target) || target.includes(key)) continue
      seen.add(key)
      const entry = counts.get(key) ?? { name: raw, count: 0 }
      entry.count++
      counts.set(key, entry)
    }
  }
  const rows = [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 6).map((r) => ({ ...r, isTarget: false }))
  return [{ name: brand, count: targetCount, isTarget: true }, ...rows].sort((a, b) => b.count - a.count)
}

/** Most-cited source domains across all grounded answers. */
export function topSources(probes: ProbeResult[], ownDomain: string): { domain: string; count: number; own: boolean }[] {
  const counts = new Map<string, number>()
  for (const p of probes) {
    const seen = new Set<string>()
    for (const s of p.sources) {
      if (!s.domain || seen.has(s.domain)) continue
      seen.add(s.domain)
      counts.set(s.domain, (counts.get(s.domain) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([domain, count]) => ({ domain, count, own: domain === ownDomain || domain.endsWith(`.${ownDomain}`) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}
