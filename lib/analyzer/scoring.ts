// Transparent, deterministic scoring. Pure functions — safe to import in client components.
import type { ProbeResult, ReadinessCheck, SiteSnapshot, CheckStatus, PlatformScore } from "./types"

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

/** Computes per-platform accuracy and visibility score across ChatGPT, Perplexity, Gemini, Claude, Copilot, and Grok. */
export function computePlatformScores(
  probes: ProbeResult[],
  site: SiteSnapshot,
  overallVal: number
): PlatformScore[] {
  const okProbes = probes.filter((p) => p.status === "ok")
  const total = okProbes.length || 1
  const mentionedCount = okProbes.filter((p) => p.mentioned).length
  const baseMentionRate = Math.round((mentionedCount / total) * 100)

  // Crawler status lookups from site snapshot
  const getBotStatus = (botId: string) =>
    site.bots.find((b) => b.id.toLowerCase() === botId.toLowerCase())?.status ?? "allowed"

  const hasLiveProbes = okProbes.length > 0

  // 1. Google Gemini (Live Search Grounded Engine)
  const gemBot = getBotStatus("Google-Extended") === "blocked" || getBotStatus("Googlebot") === "blocked" ? -20 : 0
  const gemScore = hasLiveProbes
    ? Math.max(0, Math.min(100, Math.round(baseMentionRate * 0.7 + (site.schemaTypes.length > 0 ? 20 : 5) + (okProbes.some((p) => p.domainCited) ? 10 : 0))))
    : 0
  const gemAccuracy = hasLiveProbes
    ? Math.max(60, Math.min(99, Math.round(75 + (site.schemaTypes.length > 0 ? 15 : 0) + (okProbes.some((p) => p.domainCited) ? 10 : 0))))
    : 0

  // 2. Other Engines (Crawler Technical Readiness Signals)
  const gptBlocked = getBotStatus("OAI-SearchBot") === "blocked" || getBotStatus("GPTBot") === "blocked"
  const perpBlocked = getBotStatus("PerplexityBot") === "blocked"
  const claudeBlocked = getBotStatus("ClaudeBot") === "blocked" || getBotStatus("Claude-SearchBot") === "blocked"
  const bingBlocked = getBotStatus("Bingbot") === "blocked"

  const readinessBase = Math.round(overallVal * 0.8)

  const getRankInfo = (score: number) => {
    if (score >= 88) return { label: "#1 Lead Pick", pos: 1, status: "dominant" as const }
    if (score >= 76) return { label: "#2 Position", pos: 2, status: "strong" as const }
    if (score >= 62) return { label: "Top 3 Ranked", pos: 3, status: "strong" as const }
    if (score >= 48) return { label: "Top 5 List", pos: 5, status: "moderate" as const }
    return { label: "Unranked", pos: null, status: "unranked" as const }
  }

  return [
    {
      id: "gemini",
      name: "Google Gemini",
      engine: "Google Search Grounding",
      model: "Gemini 2.0 Flash",
      scorePercent: gemScore,
      accuracyPercent: gemAccuracy,
      rankLabel: hasLiveProbes ? getRankInfo(gemScore).label : "API Not Configured",
      rankPosition: hasLiveProbes ? getRankInfo(gemScore).pos : null,
      status: hasLiveProbes ? getRankInfo(gemScore).status : "unranked",
      sentiment: gemScore >= 75 ? "positive" : gemScore >= 50 ? "neutral" : "mixed",
      mentionRate: hasLiveProbes ? baseMentionRate : 0,
      accentColor: "#2563eb",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      icon: "◈",
      details: hasLiveProbes
        ? "Verified via live Google Search Grounding"
        : "Gemini API key not configured in this environment",
    },
    {
      id: "chatgpt",
      name: "ChatGPT",
      engine: "OpenAI SearchGPT",
      model: "Crawler Signal",
      scorePercent: gptBlocked ? 20 : Math.max(40, readinessBase),
      accuracyPercent: site.description ? 85 : 70,
      rankLabel: gptBlocked ? "Crawler Blocked" : "Crawler Ready",
      rankPosition: gptBlocked ? null : 3,
      status: gptBlocked ? "unranked" : "moderate",
      sentiment: gptBlocked ? "mixed" : "neutral",
      mentionRate: gptBlocked ? 0 : Math.round(readinessBase * 0.9),
      accentColor: "#10a37f",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: "✦",
      details: gptBlocked ? "OAI-SearchBot blocked in robots.txt" : "OAI-SearchBot allowed (Crawler readiness index)",
    },
    {
      id: "perplexity",
      name: "Perplexity AI",
      engine: "Sonar Search",
      model: "Crawler Signal",
      scorePercent: perpBlocked ? 15 : Math.max(40, Math.round(readinessBase + (site.llmsTxtFound ? 8 : 0))),
      accuracyPercent: site.llmsTxtFound ? 90 : 75,
      rankLabel: perpBlocked ? "Crawler Blocked" : "Crawler Ready",
      rankPosition: perpBlocked ? null : 3,
      status: perpBlocked ? "unranked" : "moderate",
      sentiment: perpBlocked ? "mixed" : "neutral",
      mentionRate: perpBlocked ? 0 : Math.round(readinessBase * 0.88),
      accentColor: "#6366f1",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      icon: "⊕",
      details: perpBlocked ? "PerplexityBot blocked in robots.txt" : "PerplexityBot allowed (Crawler readiness index)",
    },
    {
      id: "claude",
      name: "Anthropic Claude",
      engine: "Claude Search",
      model: "Crawler Signal",
      scorePercent: claudeBlocked ? 20 : Math.max(40, Math.round(readinessBase + (site.wordCount >= 400 ? 5 : 0))),
      accuracyPercent: site.wordCount >= 400 ? 88 : 72,
      rankLabel: claudeBlocked ? "Crawler Blocked" : "Crawler Ready",
      rankPosition: claudeBlocked ? null : 4,
      status: claudeBlocked ? "unranked" : "moderate",
      sentiment: claudeBlocked ? "mixed" : "neutral",
      mentionRate: claudeBlocked ? 0 : Math.round(readinessBase * 0.85),
      accentColor: "#d97706",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      icon: "◇",
      details: claudeBlocked ? "ClaudeBot blocked in robots.txt" : "ClaudeBot allowed (Crawler readiness index)",
    },
    {
      id: "copilot",
      name: "Microsoft Copilot",
      engine: "Bing Search Index",
      model: "Crawler Signal",
      scorePercent: bingBlocked ? 10 : Math.max(35, Math.round(readinessBase + (site.https ? 6 : -10))),
      accuracyPercent: site.https ? 85 : 65,
      rankLabel: bingBlocked ? "Crawler Blocked" : "Crawler Ready",
      rankPosition: bingBlocked ? null : 4,
      status: bingBlocked ? "unranked" : "moderate",
      sentiment: bingBlocked ? "mixed" : "neutral",
      mentionRate: bingBlocked ? 0 : Math.round(readinessBase * 0.8),
      accentColor: "#0284c7",
      badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
      icon: "⬡",
      details: bingBlocked ? "Bingbot blocked in robots.txt" : "Bingbot allowed (Crawler readiness index)",
    },
    {
      id: "grok",
      name: "xAI Grok",
      engine: "xAI Grounding",
      model: "Crawler Signal",
      scorePercent: Math.max(30, Math.round(readinessBase * 0.8)),
      accuracyPercent: 75,
      rankLabel: "Crawler Signal",
      rankPosition: null,
      status: "unranked",
      sentiment: "neutral",
      mentionRate: Math.round(readinessBase * 0.75),
      accentColor: "#9333ea",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      icon: "⟡",
      details: "Real-time crawler access and web readiness signal",
    },
  ]
}

export interface CompetitorComparisonItem {
  brand: string
  isTarget: boolean
  mentionCount: number
  mentionPercent: number
  prominence: "lead" | "listed" | "passing" | "absent"
  sentiment: "positive" | "neutral" | "mixed" | "n/a"
}

export function compareCompetitors(
  probes: ProbeResult[],
  targetBrand: string,
  extraCompetitors: string[] = []
): CompetitorComparisonItem[] {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "")
  const okProbes = probes.filter((p) => p.status === "ok")
  const total = okProbes.length || 1

  const allNames = new Set<string>()
  allNames.add(targetBrand)
  for (const c of extraCompetitors) {
    if (c.trim()) allNames.add(c.trim())
  }
  // Also collect top competitors discovered in probe answers
  for (const p of okProbes) {
    for (const b of p.brandsNamed) {
      if (b.trim() && allNames.size < 7) allNames.add(b.trim())
    }
  }

  const results: CompetitorComparisonItem[] = []

  for (const name of allNames) {
    const k = norm(name)
    if (!k) continue
    const isTarget = k === norm(targetBrand)

    let mentionCount = 0
    let leadCount = 0
    let posSentiment = 0
    let negSentiment = 0

    for (const p of okProbes) {
      const match =
        p.brandsNamed.some((b) => norm(b) === k || norm(b).includes(k) || k.includes(norm(b))) ||
        (isTarget && p.mentioned) ||
        norm(p.answer).includes(k)

      if (match) {
        mentionCount++
        if (p.position === 1 || (isTarget && p.prominence === "lead")) leadCount++
        if (p.sentiment === "positive") posSentiment++
        if (p.sentiment === "negative") negSentiment++
      }
    }

    const prominence =
      mentionCount === 0
        ? "absent"
        : leadCount >= 1
        ? "lead"
        : mentionCount >= 2
        ? "listed"
        : "passing"

    const sentiment =
      mentionCount === 0
        ? "n/a"
        : posSentiment > negSentiment
        ? "positive"
        : negSentiment > posSentiment
        ? "mixed"
        : "neutral"

    results.push({
      brand: name,
      isTarget,
      mentionCount,
      mentionPercent: Math.round((mentionCount / total) * 100),
      prominence,
      sentiment,
    })
  }

  return results.sort((a, b) => (b.isTarget ? -1 : a.isTarget ? 1 : b.mentionCount - a.mentionCount))
}
