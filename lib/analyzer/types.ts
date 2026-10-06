// Shared types for the AI Visibility analyzer.
// This file is imported by both server routes and client components, so it must stay dependency-free.

export type BotStatus = "allowed" | "blocked" | "partial" | "unknown"

export interface AiBot {
  id: string
  name: string
  owner: string
  purpose: string
  status: BotStatus
}

export type CheckStatus = "pass" | "warn" | "fail"

export interface ReadinessCheck {
  id: string
  label: string
  status: CheckStatus
  detail: string
  weight: number
}

export interface SiteSnapshot {
  inputUrl: string
  finalUrl: string
  domain: string
  reachable: boolean
  fetchError: string | null
  statusCode: number | null
  responseTimeMs: number | null
  https: boolean
  title: string | null
  description: string | null
  h1: string[]
  h2: string[]
  canonical: string | null
  lang: string | null
  hasOpenGraph: boolean
  schemaTypes: string[]
  wordCount: number
  totalImages: number
  imagesMissingAlt: number
  robotsNoindex: boolean
  robotsTxtFound: boolean
  sitemapFound: boolean
  llmsTxtFound: boolean
  bots: AiBot[]
  /** Clean visible text excerpt, used as grounding context for the AI. */
  textSample: string
}

export type PromptIntent = "branded" | "category" | "problem" | "comparison" | "reviews" | "alternatives"

export interface ProbePrompt {
  id: string
  intent: PromptIntent
  question: string
}

export interface BrandProfile {
  brand: string
  category: string
  summary: string
  audience: string
  competitors: string[]
  prompts: ProbePrompt[]
  source: "ai" | "heuristic"
}

export interface ProbeSource {
  title: string
  uri: string
  domain: string
}

export type Prominence = "lead" | "listed" | "passing" | "absent"
export type Sentiment = "positive" | "neutral" | "negative" | "mixed" | "n/a"

export interface ProbeResult {
  id: string
  intent: PromptIntent
  question: string
  status: "ok" | "unavailable" | "error"
  error?: string
  answer: string
  mentioned: boolean
  domainCited: boolean
  /** 1-based position of the brand among brands named in the answer. */
  position: number | null
  prominence: Prominence
  sentiment: Sentiment
  brandsNamed: string[]
  sources: ProbeSource[]
  searchQueries: string[]
}

export type Impact = "high" | "medium" | "low"
export type Effort = "quick" | "moderate" | "heavy"

export interface ActionItem {
  title: string
  why: string
  how: string
  impact: Impact
  effort: Effort
  area: "content" | "technical" | "authority" | "structured-data"
}

export interface AiReport {
  verdict: string
  perception: string
  strengths: string[]
  gaps: string[]
  actions: ActionItem[]
  metaTitle: string
  metaDescription: string
  llmsTxt: string
  schemaJsonLd: string
  robotsTxt: string
  source: "ai" | "rules"
}

export interface ScanResponse {
  ok: true
  aiEnabled: boolean
  site: SiteSnapshot
  checks: ReadinessCheck[]
  profile: BrandProfile
}

export interface ApiError {
  ok: false
  error: string
}
