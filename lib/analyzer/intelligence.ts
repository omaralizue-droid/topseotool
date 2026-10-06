import { describeAiError, generateGrounded, generateJson } from "./gemini"
import { buildLlmsTxt, buildRobotsTxt, buildSchema } from "./fixes"
import type {
  ActionItem, AiReport, BrandProfile, ProbePrompt, ProbeResult, ProbeSource, PromptIntent,
  Prominence, ReadinessCheck, Sentiment, SiteSnapshot,
} from "./types"

const INTENTS: PromptIntent[] = ["branded", "category", "problem", "comparison", "reviews", "alternatives"]
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "")

function siteContext(site: SiteSnapshot): string {
  return [
    `URL: ${site.finalUrl}`,
    `Title: ${site.title ?? "(none)"}`,
    `Meta description: ${site.description ?? "(none)"}`,
    `H1: ${site.h1.join(" | ") || "(none)"}`,
    `H2: ${site.h2.slice(0, 8).join(" | ") || "(none)"}`,
    `Page text excerpt: ${site.textSample.slice(0, 2200) || "(page text unavailable)"}`,
  ].join("\n")
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — Understand the brand and design realistic buyer questions
// ─────────────────────────────────────────────────────────────────────────────

const PROFILE_SCHEMA = {
  type: "object",
  properties: {
    category: { type: "string", description: "Short market category, e.g. 'project management software'" },
    summary: { type: "string", description: "1–2 sentence factual description of what the brand offers" },
    audience: { type: "string", description: "Who the brand serves, a short phrase" },
    competitors: { type: "array", items: { type: "string" }, description: "3–5 real, well-known competitor brand names" },
    prompts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          intent: { type: "string", enum: INTENTS },
          question: { type: "string" },
        },
        required: ["intent", "question"],
      },
    },
  },
  required: ["category", "summary", "audience", "competitors", "prompts"],
}

export async function buildProfile(brand: string, site: SiteSnapshot): Promise<BrandProfile> {
  const raw = await generateJson<{
    category: string; summary: string; audience: string; competitors: string[]
    prompts: { intent: PromptIntent; question: string }[]
  }>(
    `You are an expert in AI search (generative engine optimization).
Analyze this brand and its website, then write the questions real people type into ChatGPT, Perplexity or Google AI Mode when they are looking for what this brand offers.

Brand name: ${brand}
${siteContext(site)}

Write exactly 6 questions with these intents, in this order:
1. "branded" — asks directly about ${brand} (e.g. what it is / what it does)
2. "category" — a "best X for Y" style question for its category. MUST NOT contain the brand name.
3. "category" — a different buying question for the category (another angle, use case or audience). MUST NOT contain the brand name.
4. "problem" — a question describing the problem this brand solves, without naming any brand.
5. "comparison" — ${brand} versus its single most relevant competitor.
6. "reviews" — whether ${brand} is good / worth it / trustworthy.

Make questions natural, specific to the brand's real market and geography if obvious, and under 20 words each.
If the page text is unavailable, infer from the brand name and domain, and keep the category broad.`,
    PROFILE_SCHEMA,
    { timeoutMs: 20000 }
  )

  const brandKey = norm(brand)
  const prompts: ProbePrompt[] = (raw.prompts ?? [])
    .filter((p) => p?.question && INTENTS.includes(p.intent))
    .slice(0, 6)
    .map((p, i) => {
      // Guard: an "unbranded" question that names the brand would inflate the discovery score.
      const leaks = (p.intent === "category" || p.intent === "problem") && brandKey.length > 2 && norm(p.question).includes(brandKey)
      return { id: `q${i + 1}`, intent: leaks ? "alternatives" : p.intent, question: p.question.trim() }
    })

  if (prompts.length < 3) return heuristicProfile(brand, site)

  return {
    brand,
    category: raw.category?.trim() || "online business",
    summary: raw.summary?.trim() || site.description || `${brand} at ${site.domain}.`,
    audience: raw.audience?.trim() || "",
    competitors: (raw.competitors ?? []).map((c) => c.trim()).filter(Boolean).slice(0, 5),
    prompts,
    source: "ai",
  }
}

export function heuristicProfile(brand: string, site: SiteSnapshot): BrandProfile {
  return {
    brand,
    category: "online business",
    summary: site.description || site.title || `${brand} (${site.domain})`,
    audience: "",
    competitors: [],
    prompts: [
      { id: "q1", intent: "branded", question: `What is ${brand} and what does it do?` },
      { id: "q2", intent: "reviews", question: `Is ${brand} legit and worth using?` },
      { id: "q3", intent: "alternatives", question: `What are the best alternatives to ${brand}?` },
    ],
    source: "heuristic",
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Ask the question to a search-grounded AI and measure the answer
// ─────────────────────────────────────────────────────────────────────────────

const META_MARKER = "<<<META>>>"

function sourceDomain(title: string, uri: string): string {
  const t = title.trim().toLowerCase().replace(/^www\./, "")
  if (/^[a-z0-9.-]+\.[a-z]{2,}$/.test(t)) return t
  try {
    const host = new URL(uri).hostname.replace(/^www\./, "")
    return host.includes("vertexaisearch") ? t : host
  } catch {
    return t
  }
}

export async function runProbe(
  prompt: ProbePrompt,
  brand: string,
  domain: string
): Promise<ProbeResult> {
  const base: ProbeResult = {
    id: prompt.id, intent: prompt.intent, question: prompt.question, status: "ok", answer: "",
    mentioned: false, domainCited: false, position: null, prominence: "absent", sentiment: "n/a",
    brandsNamed: [], sources: [], searchQueries: [],
  }

  try {
    const res = await generateGrounded(
      `You are a helpful AI assistant, like ChatGPT search, Perplexity or Google AI Mode, answering a real user.
Search the web for current information, then answer naturally in under 200 words.
If the user is looking for products, services or companies, recommend specific real ones by name.

User question: "${prompt.question}"

After your answer, on its own new line, write ${META_MARKER} followed by one line of JSON:
{"brands":[{"name":"<brand>","sentiment":"positive|neutral|negative|mixed"}]}
listing every company, product or brand named in your answer, in the order they first appear.`
    )

    const [answerPart, metaPart = ""] = res.text.split(META_MARKER)
    const answer = answerPart.trim()
    let brands: { name: string; sentiment?: string }[] = []
    try {
      const json = metaPart.slice(metaPart.indexOf("{"), metaPart.lastIndexOf("}") + 1)
      brands = (JSON.parse(json).brands ?? []).filter((b: { name?: unknown }) => typeof b?.name === "string")
    } catch {
      /* model skipped the metadata line — fall back to text matching only */
    }

    const brandKey = norm(brand)
    const domainRoot = domain.split(".")[0]
    const lower = answer.toLowerCase()
    const matches = (name: string) => {
      const k = norm(name)
      if (k.length < 2) return false
      if (k === brandKey || k === norm(domain)) return true
      return k.length >= 4 && brandKey.length >= 4 && (k.includes(brandKey) || brandKey.includes(k))
    }

    const idx = brands.findIndex((b) => matches(b.name))
    const textMention =
      (brand.length > 2 && lower.includes(brand.toLowerCase())) ||
      lower.includes(domain) ||
      (brandKey.length > 3 && norm(answer).includes(brandKey))
    const mentioned = idx >= 0 || textMention

    const sources: ProbeSource[] = res.sources.slice(0, 10).map((s) => ({
      title: s.title, uri: s.uri, domain: sourceDomain(s.title, s.uri),
    }))
    const domainCited = sources.some((s) => s.domain === domain || s.domain.endsWith(`.${domain}`) || (domainRoot.length > 3 && s.domain.startsWith(`${domainRoot}.`)))

    const position = idx >= 0 ? idx + 1 : null
    let prominence: Prominence = "absent"
    if (mentioned) {
      const hits = [lower.indexOf(brand.toLowerCase()), lower.indexOf(domain)].filter((i) => i >= 0)
      const firstHit = hits.length ? Math.min(...hits) : answer.length
      prominence = position === 1 || (position == null && firstHit < answer.length * 0.2) ? "lead" : position != null && position <= 5 ? "listed" : "passing"
    }

    const rawSentiment = idx >= 0 ? brands[idx].sentiment : undefined
    const sentiment: Sentiment = !mentioned
      ? "n/a"
      : rawSentiment && ["positive", "neutral", "negative", "mixed"].includes(rawSentiment)
        ? (rawSentiment as Sentiment)
        : "neutral"

    return {
      ...base,
      answer,
      mentioned,
      domainCited,
      position,
      prominence,
      sentiment,
      brandsNamed: brands.map((b) => b.name.trim()).filter(Boolean).slice(0, 15),
      sources,
      searchQueries: res.searchQueries.slice(0, 5),
    }
  } catch (err) {
    return { ...base, status: "error", error: describeAiError(err) }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — Synthesize a strategic report and fixes
// ─────────────────────────────────────────────────────────────────────────────

const REPORT_SCHEMA = {
  type: "object",
  properties: {
    verdict: { type: "string", description: "One punchy sentence summarizing the brand's AI visibility" },
    perception: { type: "string", description: "2–3 sentences on how AI engines currently describe the brand, citing what the answers actually said" },
    strengths: { type: "array", items: { type: "string" } },
    gaps: { type: "array", items: { type: "string" } },
    actions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          why: { type: "string" },
          how: { type: "string" },
          impact: { type: "string", enum: ["high", "medium", "low"] },
          effort: { type: "string", enum: ["quick", "moderate", "heavy"] },
          area: { type: "string", enum: ["content", "technical", "authority", "structured-data"] },
        },
        required: ["title", "why", "how", "impact", "effort", "area"],
      },
    },
    metaTitle: { type: "string" },
    metaDescription: { type: "string" },
    llmsSummary: { type: "string", description: "One-sentence factual summary for llms.txt" },
    keyFacts: { type: "array", items: { type: "string" }, description: "4–6 short factual statements about the brand from its site" },
  },
  required: ["verdict", "perception", "strengths", "gaps", "actions", "metaTitle", "metaDescription", "llmsSummary", "keyFacts"],
}

export interface ReportInput {
  brand: string
  site: SiteSnapshot
  checks: ReadinessCheck[]
  profile: BrandProfile
  probes: ProbeResult[]
  scores: { overall: number; visibility: number | null; readiness: number }
}

export async function buildReport(input: ReportInput): Promise<AiReport> {
  const { brand, site, checks, profile, probes, scores } = input
  const probeDigest = probes
    .filter((p) => p.status === "ok")
    .map((p) =>
      [
        `Q (${p.intent}): ${p.question}`,
        `  ${brand} mentioned: ${p.mentioned ? `yes (position ${p.position ?? "?"}, ${p.sentiment})` : "NO"}; own site cited: ${p.domainCited ? "yes" : "no"}`,
        `  Brands named: ${p.brandsNamed.slice(0, 8).join(", ") || "none"}`,
        `  Sources: ${[...new Set(p.sources.map((s) => s.domain))].slice(0, 6).join(", ") || "none"}`,
        `  Answer excerpt: ${p.answer.slice(0, 500).replace(/\s+/g, " ")}`,
      ].join("\n")
    )
    .join("\n\n")

  const failing = checks.filter((c) => c.status !== "pass").map((c) => `- [${c.status}] ${c.label}: ${c.detail}`).join("\n")

  const raw = await generateJson<{
    verdict: string; perception: string; strengths: string[]; gaps: string[]; actions: ActionItem[]
    metaTitle: string; metaDescription: string; llmsSummary: string; keyFacts: string[]
  }>(
    `You are a senior AI search (GEO/AEO) strategist. Write a sharp, specific audit for "${brand}" (${site.domain}).
Base every statement on the evidence below. Never invent numbers, awards or reviews. Be direct and concrete.

BRAND PROFILE
Category: ${profile.category}
Summary: ${profile.summary}
Audience: ${profile.audience}
Known competitors: ${profile.competitors.join(", ") || "unknown"}

SCORES
Overall ${scores.overall}/100 · AI visibility ${scores.visibility ?? "not measured"}/100 · AI readiness ${scores.readiness}/100

WEBSITE
${siteContext(site)}
Schema types: ${site.schemaTypes.join(", ") || "none"}
llms.txt: ${site.llmsTxtFound ? "present" : "missing"}

TECHNICAL ISSUES
${failing || "none"}

WHAT AI ENGINES ANSWERED (live, search-grounded)
${probeDigest || "AI answers unavailable."}

Write:
- verdict: one sentence.
- perception: how AI describes ${brand} today, or that it doesn't know it.
- strengths: 2–4 items. gaps: 2–4 items.
- actions: 5–7 prioritized actions, highest impact first. Name the specific sources/sites from the answers where ${brand} should get listed or reviewed, the specific competitors winning, and the exact content pages to create. "how" should be 1–2 concrete sentences.
- metaTitle (≤60 chars) and metaDescription (140–160 chars) optimized for AI and search.
- llmsSummary and keyFacts for an llms.txt file, using only facts from the website.`,
    REPORT_SCHEMA,
    { timeoutMs: 45000, thinkingBudget: 1024, temperature: 0.5 }
  )

  const url = site.finalUrl
  const summary = raw.llmsSummary?.trim() || profile.summary
  return {
    verdict: raw.verdict,
    perception: raw.perception,
    strengths: (raw.strengths ?? []).slice(0, 4),
    gaps: (raw.gaps ?? []).slice(0, 4),
    actions: (raw.actions ?? []).slice(0, 7),
    metaTitle: raw.metaTitle,
    metaDescription: raw.metaDescription,
    llmsTxt: buildLlmsTxt({ brand, url, summary, category: profile.category, audience: profile.audience, facts: raw.keyFacts ?? [] }),
    schemaJsonLd: buildSchema({ brand, url, description: summary, category: profile.category }),
    robotsTxt: buildRobotsTxt(site.bots, new URL(url).origin),
    source: "ai",
  }
}

const CHECK_ACTIONS: Record<string, Omit<ActionItem, "why">> = {
  reachable: { title: "Make your homepage readable by crawlers", how: "Allow bot user-agents through your firewall/CDN and make sure the page returns HTTP 200 without requiring JavaScript.", impact: "high", effort: "moderate", area: "technical" },
  "ai-search-bots": { title: "Unblock AI search crawlers in robots.txt", how: "Add explicit Allow rules for OAI-SearchBot, PerplexityBot, Claude-SearchBot, Googlebot and Bingbot (see the robots.txt fix below).", impact: "high", effort: "quick", area: "technical" },
  indexable: { title: "Remove the noindex directive", how: "Delete the meta robots noindex tag from pages you want to appear in search and AI answers.", impact: "high", effort: "quick", area: "technical" },
  schema: { title: "Add Organization JSON-LD schema", how: "Paste the generated JSON-LD into your site's <head> so AI engines can verify your brand facts.", impact: "high", effort: "quick", area: "structured-data" },
  "llms-txt": { title: "Publish an llms.txt file", how: "Upload the generated llms.txt to the root of your domain (yourdomain.com/llms.txt).", impact: "medium", effort: "quick", area: "structured-data" },
  title: { title: "Rewrite your title tag", how: "Use 50–60 characters with your brand name and core category.", impact: "medium", effort: "quick", area: "content" },
  description: { title: "Write a clear meta description", how: "Summarize what you do and for whom in 140–160 characters.", impact: "medium", effort: "quick", area: "content" },
  h1: { title: "Use one descriptive H1", how: "State your core offering in a single H1 heading.", impact: "low", effort: "quick", area: "content" },
  content: { title: "Add more server-rendered content", how: "Explain your product, use cases, pricing and FAQs in HTML text that loads without JavaScript.", impact: "high", effort: "moderate", area: "content" },
  sitemap: { title: "Publish an XML sitemap", how: "Generate /sitemap.xml and reference it in robots.txt.", impact: "low", effort: "quick", area: "technical" },
  https: { title: "Serve the site over HTTPS", how: "Install a TLS certificate and redirect HTTP to HTTPS.", impact: "medium", effort: "moderate", area: "technical" },
  speed: { title: "Improve server response time", how: "Add caching/CDN so the page responds in under 1 second.", impact: "low", effort: "moderate", area: "technical" },
}

/** Rule-based fallback when the AI service is unavailable. */
export function rulesReport(input: ReportInput): AiReport {
  const { brand, site, checks, profile, probes, scores } = input
  const issues = checks.filter((c) => c.status !== "pass").sort((a, b) => b.weight - a.weight)
  const actions: ActionItem[] = issues
    .filter((c) => CHECK_ACTIONS[c.id])
    .slice(0, 6)
    .map((c) => ({ ...CHECK_ACTIONS[c.id], why: c.detail }))

  const ok = probes.filter((p) => p.status === "ok")
  const mentions = ok.filter((p) => p.mentioned).length
  const summary = profile.summary
  const url = site.finalUrl

  return {
    verdict: ok.length
      ? `${brand} appeared in ${mentions} of ${ok.length} AI answers, with an overall score of ${scores.overall}/100.`
      : `${brand} scores ${scores.readiness}/100 on AI readiness. Live AI answers could not be measured this time.`,
    perception: ok.length
      ? mentions ? `AI engines mention ${brand} in ${mentions} of ${ok.length} tested questions.` : `AI engines did not mention ${brand} in any tested question.`
      : "AI answer testing was unavailable, so this report is based on your website's technical signals only.",
    strengths: checks.filter((c) => c.status === "pass").sort((a, b) => b.weight - a.weight).slice(0, 3).map((c) => `${c.label}: ${c.detail}`),
    gaps: issues.slice(0, 4).map((c) => `${c.label}: ${c.detail}`),
    actions,
    metaTitle: site.title ?? `${brand} — ${profile.category}`,
    metaDescription: site.description ?? summary,
    llmsTxt: buildLlmsTxt({ brand, url, summary, category: profile.category, audience: profile.audience, facts: site.h2.slice(0, 5) }),
    schemaJsonLd: buildSchema({ brand, url, description: summary, category: profile.category }),
    robotsTxt: buildRobotsTxt(site.bots, new URL(url).origin),
    source: "rules",
  }
}
