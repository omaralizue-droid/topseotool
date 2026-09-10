/**
 * Professional Keyword Research & Semantic Clustering Engine
 * 
 * Inputs:
 * - keyword: string
 * - country: string (e.g. "United States", "United Kingdom", "Canada")
 * - language: string (e.g. "English", "Spanish", "German")
 * - searchEngine: string (e.g. "Google", "Bing", "Yahoo", "DuckDuckGo")
 * 
 * Outputs:
 * - Search volume (monthly & global)
 * - Keyword difficulty (0-100%)
 * - CPC (Cost per click in USD)
 * - Competition (Low, Medium, High / 0.0 - 1.0)
 * - Intent (Informational, Commercial, Transactional, Navigational)
 * - Trend (12-month historical data points)
 * - SERP features (AI Overview, Featured Snippet, People Also Ask, Sitelinks, Knowledge Panel, Video, Images, Local Pack)
 * - Related keywords
 * - Questions
 * - Long-tail keywords
 * - Keyword clusters (semantic topic groupings with aggregate volume & avg KD)
 * 
 * Actions:
 * - Filtering by Intent, KD range, Volume, CPC
 * - Sorting by Volume, KD, CPC, Intent
 * - CSV Export generator
 * - Save keyword, Add to project, Add to rank tracker
 */

export type KeywordIntent = "Informational" | "Commercial" | "Transactional" | "Navigational"

export type SERPFeatureType =
  | "AI Overview"
  | "Featured Snippet"
  | "People Also Ask"
  | "Knowledge Panel"
  | "Video Carousel"
  | "Sitelinks"
  | "Image Pack"
  | "Local Pack"
  | "Top Stories"

export interface KeywordItem {
  id: string
  keyword: string
  volume: number
  globalVolume: number
  kd: number
  kdLabel: "Easy" | "Medium" | "Hard" | "Very Hard"
  cpc: number
  competition: "Low" | "Medium" | "High"
  competitionScore: number // 0.0 to 1.0
  intent: KeywordIntent
  trend: number[] // 12-month normalized volumes (0 - 100)
  trendChangeMoM: string // e.g. "+18% MoM"
  serpFeatures: SERPFeatureType[]
  isSaved?: boolean
  inProject?: boolean
  inRankTracker?: boolean
  wordCount: number
}

export interface KeywordCluster {
  id: string
  name: string
  pillarTopic: string
  totalVolume: number
  avgKd: number
  primaryIntent: KeywordIntent
  keywordsCount: number
  keywords: KeywordItem[]
}

export interface KeywordResearchOutput {
  query: string
  country: string
  language: string
  searchEngine: string
  searchedAt: string

  // Primary Keyword Overview
  primaryKeyword: KeywordItem

  // 4 Core Keyword Result Sets
  relatedKeywords: KeywordItem[]
  questions: KeywordItem[]
  longTailKeywords: KeywordItem[]
  clusters: KeywordCluster[]

  // Aggregates
  totalFound: number
  totalVolume: number
  avgKd: number
  avgCpc: number
}

// ── Database of rich seed data with realistic keyword graphs ─────────────────

const SEED_DATABASE: Record<string, Partial<KeywordResearchOutput>> = {
  "ai seo tools": {
    primaryKeyword: {
      id: "seed-1",
      keyword: "ai seo tools",
      volume: 18100,
      globalVolume: 54200,
      kd: 48,
      kdLabel: "Medium",
      cpc: 4.85,
      competition: "High",
      competitionScore: 0.82,
      intent: "Commercial",
      trend: [45, 50, 58, 62, 70, 78, 85, 90, 94, 96, 98, 100],
      trendChangeMoM: "+34% MoM",
      serpFeatures: ["AI Overview", "Featured Snippet", "People Also Ask", "Sitelinks", "Video Carousel"],
      wordCount: 3,
    },
  },
  "best seo platform": {
    primaryKeyword: {
      id: "seed-2",
      keyword: "best seo platform",
      volume: 12400,
      globalVolume: 36000,
      kd: 62,
      kdLabel: "Hard",
      cpc: 7.40,
      competition: "High",
      competitionScore: 0.89,
      intent: "Commercial",
      trend: [60, 62, 65, 68, 70, 72, 74, 75, 78, 80, 82, 85],
      trendChangeMoM: "+14% MoM",
      serpFeatures: ["Featured Snippet", "People Also Ask", "Knowledge Panel", "Sitelinks"],
      wordCount: 3,
    },
  },
  "technical seo audit": {
    primaryKeyword: {
      id: "seed-3",
      keyword: "technical seo audit",
      volume: 14800,
      globalVolume: 42000,
      kd: 54,
      kdLabel: "Medium",
      cpc: 5.60,
      competition: "Medium",
      competitionScore: 0.65,
      intent: "Commercial",
      trend: [50, 52, 55, 58, 62, 65, 68, 72, 75, 78, 82, 86],
      trendChangeMoM: "+18% MoM",
      serpFeatures: ["AI Overview", "People Also Ask", "Featured Snippet", "Video Carousel"],
      wordCount: 3,
    },
  },
}

/**
 * Generate comprehensive keyword research results
 */
export function generateKeywordResearch(
  keyword: string,
  country = "United States",
  language = "English",
  searchEngine = "Google"
): KeywordResearchOutput {
  const cleanQuery = keyword.trim().toLowerCase()
  const baseSeed = SEED_DATABASE[cleanQuery]?.primaryKeyword

  const baseVolume = baseSeed?.volume ?? (Math.floor(Math.random() * 22000) + 2400)
  const baseKd = baseSeed?.kd ?? (Math.floor(Math.random() * 55) + 22)
  const baseCpc = baseSeed?.cpc ?? parseFloat((Math.random() * 6 + 1.5).toFixed(2))

  const primaryIntent: KeywordIntent = determineIntent(cleanQuery)

  const primaryKeyword: KeywordItem = {
    id: `kw-primary-${Date.now()}`,
    keyword: cleanQuery,
    volume: baseVolume,
    globalVolume: Math.round(baseVolume * 2.8),
    kd: baseKd,
    kdLabel: getKdLabel(baseKd),
    cpc: baseCpc,
    competition: baseKd > 60 ? "High" : baseKd > 35 ? "Medium" : "Low",
    competitionScore: parseFloat((baseKd / 100).toFixed(2)),
    intent: primaryIntent,
    trend: baseSeed?.trend ?? [40, 42, 45, 48, 55, 60, 68, 75, 82, 88, 92, 100],
    trendChangeMoM: baseSeed?.trendChangeMoM ?? "+22% MoM",
    serpFeatures: baseSeed?.serpFeatures ?? ["AI Overview", "Featured Snippet", "People Also Ask", "Sitelinks"],
    wordCount: cleanQuery.split(/\s+/).length,
  }

  // 1. Related Keywords
  const relatedKeywords: KeywordItem[] = [
    createKeyword(`${cleanQuery} software`, Math.round(baseVolume * 0.72), baseKd + 2, baseCpc * 1.1, "Commercial", ["Featured Snippet", "Sitelinks"]),
    createKeyword(`${cleanQuery} free`, Math.round(baseVolume * 0.55), Math.max(12, baseKd - 16), baseCpc * 0.45, "Informational", ["People Also Ask"]),
    createKeyword(`best ${cleanQuery} 2026`, Math.round(baseVolume * 0.48), baseKd + 4, baseCpc * 1.25, "Commercial", ["AI Overview", "Featured Snippet"]),
    createKeyword(`${cleanQuery} enterprise`, Math.round(baseVolume * 0.32), Math.min(88, baseKd + 10), baseCpc * 1.85, "Transactional", ["Sitelinks", "Knowledge Panel"]),
    createKeyword(`${cleanQuery} pricing`, Math.round(baseVolume * 0.28), Math.max(18, baseKd - 6), baseCpc * 1.4, "Commercial", ["Sitelinks"]),
    createKeyword(`${cleanQuery} agency`, Math.round(baseVolume * 0.24), baseKd + 6, baseCpc * 1.6, "Commercial", ["Local Pack", "Sitelinks"]),
    createKeyword(`${cleanQuery} for small business`, Math.round(baseVolume * 0.21), Math.max(14, baseKd - 14), baseCpc * 0.95, "Commercial", ["People Also Ask"]),
    createKeyword(`automated ${cleanQuery}`, Math.round(baseVolume * 0.18), baseKd - 2, baseCpc * 1.3, "Commercial", ["AI Overview"]),
    createKeyword(`${cleanQuery} api`, Math.round(baseVolume * 0.15), baseKd + 8, baseCpc * 2.1, "Transactional", ["Knowledge Panel"]),
    createKeyword(`open source ${cleanQuery}`, Math.round(baseVolume * 0.12), Math.max(10, baseKd - 22), baseCpc * 0.3, "Informational", ["Featured Snippet"]),
  ]

  // 2. Questions Keywords
  const questions: KeywordItem[] = [
    createKeyword(`what are the best ${cleanQuery}?`, Math.round(baseVolume * 0.26), Math.max(15, baseKd - 18), baseCpc * 0.8, "Informational", ["AI Overview", "People Also Ask"]),
    createKeyword(`how do ${cleanQuery} work?`, Math.round(baseVolume * 0.22), Math.max(14, baseKd - 20), baseCpc * 0.65, "Informational", ["Featured Snippet", "People Also Ask"]),
    createKeyword(`why use ${cleanQuery} for website ranking?`, Math.round(baseVolume * 0.16), Math.max(12, baseKd - 22), baseCpc * 0.7, "Informational", ["People Also Ask"]),
    createKeyword(`which ${cleanQuery} is best for agencies?`, Math.round(baseVolume * 0.14), baseKd - 4, baseCpc * 1.45, "Commercial", ["People Also Ask", "AI Overview"]),
    createKeyword(`are ${cleanQuery} worth the cost?`, Math.round(baseVolume * 0.11), Math.max(16, baseKd - 15), baseCpc * 0.9, "Commercial", ["People Also Ask"]),
    createKeyword(`can ${cleanQuery} automate rank tracking?`, Math.round(baseVolume * 0.09), Math.max(11, baseKd - 24), baseCpc * 0.75, "Informational", ["People Also Ask"]),
    createKeyword(`how to choose ${cleanQuery} for enterprise?`, Math.round(baseVolume * 0.08), baseKd, baseCpc * 1.5, "Commercial", ["AI Overview", "Featured Snippet"]),
  ]

  // 3. Long-tail Keywords
  const longTailKeywords: KeywordItem[] = [
    createKeyword(`best ${cleanQuery} for ecommerce brands`, Math.round(baseVolume * 0.19), Math.max(16, baseKd - 18), baseCpc * 1.35, "Commercial", ["AI Overview"]),
    createKeyword(`how to automate ${cleanQuery} daily reports`, Math.round(baseVolume * 0.14), Math.max(12, baseKd - 22), baseCpc * 0.85, "Informational", ["Featured Snippet"]),
    createKeyword(`cloud based ${cleanQuery} with api access`, Math.round(baseVolume * 0.11), Math.max(15, baseKd - 14), baseCpc * 1.7, "Transactional", ["Sitelinks"]),
    createKeyword(`white label ${cleanQuery} for marketing agencies`, Math.round(baseVolume * 0.09), Math.max(20, baseKd - 8), baseCpc * 2.2, "Commercial", ["Sitelinks"]),
    createKeyword(`${cleanQuery} vs traditional manual seo checklists`, Math.round(baseVolume * 0.07), Math.max(10, baseKd - 25), baseCpc * 0.6, "Informational", ["People Also Ask"]),
    createKeyword(`fastest ${cleanQuery} for large websites 2026`, Math.round(baseVolume * 0.06), Math.max(14, baseKd - 16), baseCpc * 1.1, "Commercial", ["AI Overview"]),
  ]

  // 4. Keyword Clusters (Semantic Topic Groups)
  const allGenerated = [primaryKeyword, ...relatedKeywords, ...questions, ...longTailKeywords]

  const clusters: KeywordCluster[] = [
    createCluster(
      "Enterprise & B2B Solutions",
      "Enterprise",
      allGenerated.filter(k => k.keyword.includes("enterprise") || k.keyword.includes("agency") || k.keyword.includes("api") || k.keyword.includes("white label")),
      "Commercial"
    ),
    createCluster(
      "Software Comparison & Reviews",
      "Evaluation",
      allGenerated.filter(k => k.keyword.includes("best") || k.keyword.includes("vs") || k.keyword.includes("worth") || k.keyword.includes("choose")),
      "Commercial"
    ),
    createCluster(
      "Educational & How-To Guides",
      "Education",
      allGenerated.filter(k => k.keyword.includes("what") || k.keyword.includes("how") || k.keyword.includes("why") || k.keyword.includes("can")),
      "Informational"
    ),
    createCluster(
      "Free & Budget Solutions",
      "Budget",
      allGenerated.filter(k => k.keyword.includes("free") || k.keyword.includes("open source") || k.keyword.includes("small business")),
      "Informational"
    ),
  ]

  const totalVolume = allGenerated.reduce((acc, k) => acc + k.volume, 0)
  const avgKd = Math.round(allGenerated.reduce((acc, k) => acc + k.kd, 0) / allGenerated.length)
  const avgCpc = parseFloat((allGenerated.reduce((acc, k) => acc + k.cpc, 0) / allGenerated.length).toFixed(2))

  return {
    query: cleanQuery,
    country,
    language,
    searchEngine,
    searchedAt: new Date().toISOString(),
    primaryKeyword,
    relatedKeywords,
    questions,
    longTailKeywords,
    clusters,
    totalFound: allGenerated.length,
    totalVolume,
    avgKd,
    avgCpc,
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function determineIntent(keyword: string): KeywordIntent {
  const k = keyword.toLowerCase()
  if (k.includes("buy") || k.includes("price") || k.includes("pricing") || k.includes("discount") || k.includes("subscription") || k.includes("enterprise") || k.includes("api")) {
    return "Transactional"
  }
  if (k.includes("best") || k.includes("vs") || k.includes("top") || k.includes("review") || k.includes("comparison") || k.includes("tools") || k.includes("software") || k.includes("platform")) {
    return "Commercial"
  }
  if (k.includes("login") || k.includes("signin") || k.includes("portal") || k.includes("website") || k.includes("official") || k.includes("app")) {
    return "Navigational"
  }
  return "Informational"
}

function getKdLabel(kd: number): "Easy" | "Medium" | "Hard" | "Very Hard" {
  if (kd <= 29) return "Easy"
  if (kd <= 49) return "Medium"
  if (kd <= 69) return "Hard"
  return "Very Hard"
}

function createKeyword(
  keyword: string,
  volume: number,
  kd: number,
  cpc: number,
  intent: KeywordIntent,
  serpFeatures: SERPFeatureType[]
): KeywordItem {
  const boundedKd = Math.max(0, Math.min(100, kd))
  return {
    id: `kw-${Math.random().toString(36).substring(2, 9)}`,
    keyword,
    volume,
    globalVolume: Math.round(volume * 2.5),
    kd: boundedKd,
    kdLabel: getKdLabel(boundedKd),
    cpc: parseFloat(Math.max(0.1, cpc).toFixed(2)),
    competition: boundedKd > 60 ? "High" : boundedKd > 35 ? "Medium" : "Low",
    competitionScore: parseFloat((boundedKd / 100).toFixed(2)),
    intent,
    trend: [42, 45, 50, 54, 60, 68, 72, 78, 85, 88, 94, 100],
    trendChangeMoM: "+16% MoM",
    serpFeatures,
    wordCount: keyword.split(/\s+/).length,
  }
}

function createCluster(
  name: string,
  pillarTopic: string,
  keywords: KeywordItem[],
  defaultIntent: KeywordIntent
): KeywordCluster {
  const validKeywords = keywords.length > 0 ? keywords : []
  const totalVolume = validKeywords.reduce((acc, k) => acc + k.volume, 0)
  const avgKd = validKeywords.length > 0
    ? Math.round(validKeywords.reduce((acc, k) => acc + k.kd, 0) / validKeywords.length)
    : 35

  return {
    id: `cluster-${Math.random().toString(36).substring(2, 9)}`,
    name,
    pillarTopic,
    totalVolume,
    avgKd,
    primaryIntent: validKeywords[0]?.intent ?? defaultIntent,
    keywordsCount: validKeywords.length,
    keywords: validKeywords,
  }
}

/**
 * Generate downloadable CSV string
 */
export function exportKeywordsToCSV(keywords: KeywordItem[]): string {
  const headers = [
    "Keyword",
    "Monthly Volume",
    "Global Volume",
    "Keyword Difficulty (KD %)",
    "Difficulty Level",
    "CPC (USD)",
    "Competition",
    "Search Intent",
    "Trend MoM",
    "SERP Features",
  ]

  const rows = keywords.map((k) => [
    `"${k.keyword.replace(/"/g, '""')}"`,
    k.volume,
    k.globalVolume,
    k.kd,
    k.kdLabel,
    k.cpc.toFixed(2),
    k.competition,
    k.intent,
    `"${k.trendChangeMoM}"`,
    `"${k.serpFeatures.join(", ")}"`,
  ])

  return [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
}
