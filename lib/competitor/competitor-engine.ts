/**
 * Competitor Intelligence & Keyword Gap Analysis Engine
 * 
 * Functions:
 * 1. analyzeCompetitorDomain(domain, yourDomain):
 *    - Organic keywords count & distribution
 *    - Estimated traffic (monthly visits & value)
 *    - Top pages (traffic share, visits, top keyword)
 *    - Ranking keywords (position, volume, KD, CPC, traffic share)
 *    - Keyword gaps count & opportunities
 *    - Content gaps (missing topical clusters)
 *    - Backlinks count & Referring domains count
 *    - Top competitors (competing domains in SERPs)
 *    - Traffic trend (12-month historical visits)
 *    - Winning keywords (recent top 3 / #1 rank gainers)
 * 
 * 2. generateKeywordGapAnalysis(yourDomain, compA, compB, compC):
 *    - Multi-domain keyword matrix: Your Website vs Competitor A vs Competitor B vs Competitor C
 *    - Highlights keywords competitors rank for but user doesn't (Missing / Untapped)
 *    - Filters for Missing, Weak, Strong, Shared, Untapped
 *    - CSV export generator
 */

export interface CompetitorTopPage {
  id: string
  url: string
  path: string
  trafficSharePct: number
  monthlyVisits: number
  trafficValueUsd: number
  topKeyword: string
  topKeywordPos: number
  keywordsCount: number
}

export interface CompetitorRankingKeyword {
  id: string
  keyword: string
  position: number
  prevPosition: number
  positionChange: number // e.g. +3, -1, 0, or 999 (New)
  volume: number
  kd: number
  cpc: number
  trafficSharePct: number
  monthlyTraffic: number
  serpFeatures: string[]
  intent: "Informational" | "Commercial" | "Transactional" | "Navigational"
}

export interface ContentGapCluster {
  id: string
  topic: string
  competitorArticleCount: number
  userArticleCount: number
  totalSearchVolume: number
  averageKd: number
  recommendedAction: string
  priority: "Critical" | "High" | "Medium"
}

export interface RivalCompetitorDomain {
  domain: string
  overlapKeywordsCount: number
  commonKeywordsPct: number
  organicTraffic: number
  domainRating: number
}

export interface CompetitorIntelligenceResult {
  domain: string
  analyzedAt: string
  domainRating: number

  // 1. Organic Keywords
  organicKeywordsCount: number
  keywordsTop3: number
  keywordsTop10: number
  keywordsTop50: number
  keywordsTop100: number
  keywordsMoMGrowth: string

  // 2. Estimated Traffic
  estimatedMonthlyTraffic: number
  monthlyTrafficValueUsd: number
  trafficMoMGrowth: string

  // 3. Top Pages
  topPages: CompetitorTopPage[]

  // 4. Ranking Keywords
  rankingKeywords: CompetitorRankingKeyword[]

  // 5. Keyword Gaps Summary
  totalKeywordGapsCount: number
  highValueGapsCount: number

  // 6. Content Gaps
  contentGaps: ContentGapCluster[]

  // 7. Backlinks
  backlinksCount: number

  // 8. Referring Domains
  referringDomainsCount: number

  // 9. Top Competitors
  topCompetitors: RivalCompetitorDomain[]

  // 10. Traffic Trend (12-Month)
  trafficTrend: Array<{ month: string; traffic: number }>

  // 11. Winning Keywords
  winningKeywords: CompetitorRankingKeyword[]
}

export type GapType = "Missing" | "Untapped" | "Weak" | "Strong" | "Shared"

export interface KeywordGapItem {
  id: string
  keyword: string
  volume: number
  kd: number
  cpc: number
  intent: "Informational" | "Commercial" | "Transactional" | "Navigational"
  gapType: GapType
  userRank: number | null // null = does not rank
  compARank: number | null
  compBRank: number | null
  compCRank: number | null
  bestCompRank: number
  isHighlighted: boolean // true if competitor ranks but user doesn't
}

export interface KeywordGapAnalysisResult {
  yourDomain: string
  competitorA: string
  competitorB: string
  competitorC: string
  analyzedAt: string
  totalKeywordsEvaluated: number
  counts: {
    missing: number
    untapped: number
    weak: number
    strong: number
    shared: number
  }
  gapKeywords: KeywordGapItem[]
}

// ── Single Competitor Deep-Dive Generator ─────────────────────────────────────

export function analyzeCompetitorDomain(
  rawDomain: string,
  userDomain = "example.com"
): CompetitorIntelligenceResult {
  const domain = cleanDomain(rawDomain)
  const isSeedSemrush = domain.includes("semrush")
  const isSeedAhrefs = domain.includes("ahrefs")

  const baseKeywords = isSeedSemrush ? 482000 : isSeedAhrefs ? 520000 : 94000
  const baseTraffic = isSeedSemrush ? 1840000 : isSeedAhrefs ? 2100000 : 340000
  const baseBacklinks = isSeedSemrush ? 14200000 : isSeedAhrefs ? 18900000 : 1240000
  const baseRefDomains = isSeedSemrush ? 84500 : isSeedAhrefs ? 92000 : 8400
  const dr = isSeedSemrush ? 91 : isSeedAhrefs ? 92 : 76

  // 10. Traffic Trend (12 Months)
  const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"]
  const trendMultiplier = [0.82, 0.85, 0.88, 0.9, 0.93, 0.95, 0.97, 1.0, 1.02, 1.05, 1.08, 1.12]
  const trafficTrend = months.map((m, i) => ({
    month: m,
    traffic: Math.round(baseTraffic * trendMultiplier[i]),
  }))

  // 3. Top Pages
  const topPages: CompetitorTopPage[] = [
    {
      id: "p1",
      url: `https://${domain}/blog/keyword-research-guide`,
      path: "/blog/keyword-research-guide",
      trafficSharePct: 14.8,
      monthlyVisits: Math.round(baseTraffic * 0.148),
      trafficValueUsd: 142000,
      topKeyword: "how to do keyword research",
      topKeywordPos: 1,
      keywordsCount: 4210,
    },
    {
      id: "p2",
      url: `https://${domain}/features/seo-audit`,
      path: "/features/seo-audit",
      trafficSharePct: 11.2,
      monthlyVisits: Math.round(baseTraffic * 0.112),
      trafficValueUsd: 198000,
      topKeyword: "website seo audit tool",
      topKeywordPos: 1,
      keywordsCount: 3100,
    },
    {
      id: "p3",
      url: `https://${domain}/blog/backlink-strategies`,
      path: "/blog/backlink-strategies",
      trafficSharePct: 8.5,
      monthlyVisits: Math.round(baseTraffic * 0.085),
      trafficValueUsd: 94000,
      topKeyword: "best backlink strategies 2026",
      topKeywordPos: 2,
      keywordsCount: 2400,
    },
    {
      id: "p4",
      url: `https://${domain}/pricing`,
      path: "/pricing",
      trafficSharePct: 6.4,
      monthlyVisits: Math.round(baseTraffic * 0.064),
      trafficValueUsd: 280000,
      topKeyword: `${domain} pricing plans`,
      topKeywordPos: 1,
      keywordsCount: 890,
    },
    {
      id: "p5",
      url: `https://${domain}/features/competitor-analysis`,
      path: "/features/competitor-analysis",
      trafficSharePct: 5.8,
      monthlyVisits: Math.round(baseTraffic * 0.058),
      trafficValueUsd: 112000,
      topKeyword: "seo competitor analysis online",
      topKeywordPos: 2,
      keywordsCount: 1650,
    },
  ]

  // 4. Ranking Keywords
  const rankingKeywords: CompetitorRankingKeyword[] = [
    {
      id: "rk1",
      keyword: "seo software tools",
      position: 1,
      prevPosition: 2,
      positionChange: 1,
      volume: 49500,
      kd: 82,
      cpc: 8.4,
      trafficSharePct: 18.2,
      monthlyTraffic: 9009,
      serpFeatures: ["AI Overview", "Featured Snippet", "Sitelinks"],
      intent: "Commercial",
    },
    {
      id: "rk2",
      keyword: "best website crawler",
      position: 2,
      prevPosition: 2,
      positionChange: 0,
      volume: 27100,
      kd: 64,
      cpc: 6.15,
      trafficSharePct: 12.4,
      monthlyTraffic: 3360,
      serpFeatures: ["Featured Snippet", "People Also Ask"],
      intent: "Commercial",
    },
    {
      id: "rk3",
      keyword: "technical seo checklist 2026",
      position: 1,
      prevPosition: 4,
      positionChange: 3,
      volume: 18100,
      kd: 46,
      cpc: 4.8,
      trafficSharePct: 15.6,
      monthlyTraffic: 2823,
      serpFeatures: ["AI Overview", "People Also Ask"],
      intent: "Informational",
    },
    {
      id: "rk4",
      keyword: "keyword difficulty checker",
      position: 3,
      prevPosition: 3,
      positionChange: 0,
      volume: 33100,
      kd: 71,
      cpc: 5.2,
      trafficSharePct: 9.8,
      monthlyTraffic: 3243,
      serpFeatures: ["People Also Ask", "Sitelinks"],
      intent: "Commercial",
    },
    {
      id: "rk5",
      keyword: "backlink audit tool enterprise",
      position: 2,
      prevPosition: 5,
      positionChange: 3,
      volume: 12400,
      kd: 58,
      cpc: 9.5,
      trafficSharePct: 11.2,
      monthlyTraffic: 1388,
      serpFeatures: ["Sitelinks", "Knowledge Panel"],
      intent: "Transactional",
    },
    {
      id: "rk6",
      keyword: "ai search visibility radar",
      position: 1,
      prevPosition: 999,
      positionChange: 999,
      volume: 8900,
      kd: 34,
      cpc: 3.9,
      trafficSharePct: 16.4,
      monthlyTraffic: 1459,
      serpFeatures: ["AI Overview", "Featured Snippet"],
      intent: "Commercial",
    },
  ]

  // 11. Winning Keywords (Top Rank Gainers / New #1s)
  const winningKeywords = rankingKeywords.filter(
    (k) => k.position <= 3 && (k.positionChange > 0 || k.positionChange === 999)
  )

  // 6. Content Gaps
  const contentGaps: ContentGapCluster[] = [
    {
      id: "cg1",
      topic: "AEO & Generative Engine Optimization Framework",
      competitorArticleCount: 18,
      userArticleCount: 0,
      totalSearchVolume: 42000,
      averageKd: 36,
      recommendedAction: "Publish comprehensive AEO guide with FAQ schema to capture AI engine citations.",
      priority: "Critical",
    },
    {
      id: "cg2",
      topic: "Core Web Vitals INP & LCP Code Optimization",
      competitorArticleCount: 14,
      userArticleCount: 1,
      totalSearchVolume: 28500,
      averageKd: 42,
      recommendedAction: "Create in-depth Next.js performance tuning walkthrough with code snippets.",
      priority: "High",
    },
    {
      id: "cg3",
      topic: "Multi-Tenant Enterprise SEO Architecture",
      competitorArticleCount: 8,
      userArticleCount: 0,
      totalSearchVolume: 14200,
      averageKd: 29,
      recommendedAction: "Publish whitepaper detailing enterprise RBAC, workspace isolation, and API limits.",
      priority: "Medium",
    },
  ]

  // 9. Top Competitors of this domain
  const topCompetitors: RivalCompetitorDomain[] = [
    {
      domain: domain === "semrush.com" ? "ahrefs.com" : "semrush.com",
      overlapKeywordsCount: Math.round(baseKeywords * 0.68),
      commonKeywordsPct: 68,
      organicTraffic: Math.round(baseTraffic * 1.1),
      domainRating: 92,
    },
    {
      domain: "seranking.com",
      overlapKeywordsCount: Math.round(baseKeywords * 0.42),
      commonKeywordsPct: 42,
      organicTraffic: 890000,
      domainRating: 84,
    },
    {
      domain: "moz.com",
      overlapKeywordsCount: Math.round(baseKeywords * 0.38),
      commonKeywordsPct: 38,
      organicTraffic: 720000,
      domainRating: 88,
    },
    {
      domain: "ubersuggest.com",
      overlapKeywordsCount: Math.round(baseKeywords * 0.31),
      commonKeywordsPct: 31,
      organicTraffic: 610000,
      domainRating: 81,
    },
  ]

  return {
    domain,
    analyzedAt: new Date().toISOString(),
    domainRating: dr,
    organicKeywordsCount: baseKeywords,
    keywordsTop3: Math.round(baseKeywords * 0.12),
    keywordsTop10: Math.round(baseKeywords * 0.34),
    keywordsTop50: Math.round(baseKeywords * 0.72),
    keywordsTop100: baseKeywords,
    keywordsMoMGrowth: "+14.2% MoM",
    estimatedMonthlyTraffic: baseTraffic,
    monthlyTrafficValueUsd: Math.round(baseTraffic * 1.35),
    trafficMoMGrowth: "+11.8% MoM",
    topPages,
    rankingKeywords,
    totalKeywordGapsCount: 14200,
    highValueGapsCount: 380,
    contentGaps,
    backlinksCount: baseBacklinks,
    referringDomainsCount: baseRefDomains,
    topCompetitors,
    trafficTrend,
    winningKeywords,
  }
}

// ── Multi-Domain Keyword Gap Analysis Engine ──────────────────────────────────

export function generateKeywordGapAnalysis(
  yourDomain = "example.com",
  compA = "semrush.com",
  compB = "ahrefs.com",
  compC = "seranking.com"
): KeywordGapAnalysisResult {
  const cleanYour = cleanDomain(yourDomain)
  const cleanA = cleanDomain(compA)
  const cleanB = cleanDomain(compB)
  const cleanC = cleanDomain(compC)

  const gapKeywords: KeywordGapItem[] = [
    // 1. Missing Gaps (Competitors rank in top 10, user does NOT rank!)
    {
      id: "gap-1",
      keyword: "all in one seo platform",
      volume: 24600,
      kd: 58,
      cpc: 6.8,
      intent: "Commercial",
      gapType: "Missing",
      userRank: null, // User doesn't rank!
      compARank: 1,
      compBRank: 3,
      compCRank: 4,
      bestCompRank: 1,
      isHighlighted: true,
    },
    {
      id: "gap-2",
      keyword: "automated backlink audit software",
      volume: 18100,
      kd: 46,
      cpc: 8.5,
      intent: "Transactional",
      gapType: "Missing",
      userRank: null,
      compARank: 2,
      compBRank: 1,
      compCRank: 5,
      bestCompRank: 1,
      isHighlighted: true,
    },
    {
      id: "gap-3",
      keyword: "best rank tracker for agencies",
      volume: 14200,
      kd: 42,
      cpc: 5.9,
      intent: "Commercial",
      gapType: "Missing",
      userRank: null,
      compARank: 3,
      compBRank: 2,
      compCRank: 1,
      bestCompRank: 1,
      isHighlighted: true,
    },
    {
      id: "gap-4",
      keyword: "enterprise seo reporting pdf",
      volume: 9800,
      kd: 38,
      cpc: 7.2,
      intent: "Transactional",
      gapType: "Missing",
      userRank: null,
      compARank: 4,
      compBRank: 3,
      compCRank: 6,
      bestCompRank: 3,
      isHighlighted: true,
    },
    {
      id: "gap-5",
      keyword: "aeo search visibility simulator",
      volume: 12400,
      kd: 32,
      cpc: 4.5,
      intent: "Commercial",
      gapType: "Missing",
      userRank: null,
      compARank: 1,
      compBRank: 2,
      compCRank: 3,
      bestCompRank: 1,
      isHighlighted: true,
    },

    // 2. Untapped (At least one competitor ranks in top 10, user doesn't rank)
    {
      id: "gap-6",
      keyword: "serp feature tracking api",
      volume: 8200,
      kd: 29,
      cpc: 5.4,
      intent: "Transactional",
      gapType: "Untapped",
      userRank: null,
      compARank: 5,
      compBRank: null,
      compCRank: 2,
      bestCompRank: 2,
      isHighlighted: true,
    },
    {
      id: "gap-7",
      keyword: "keyword cannibalization audit tool",
      volume: 6400,
      kd: 24,
      cpc: 3.8,
      intent: "Informational",
      gapType: "Untapped",
      userRank: null,
      compARank: 2,
      compBRank: 12,
      compCRank: null,
      bestCompRank: 2,
      isHighlighted: true,
    },

    // 3. Weak (User ranks, but competitors outrank user)
    {
      id: "gap-8",
      keyword: "technical seo crawler online",
      volume: 33100,
      kd: 62,
      cpc: 7.1,
      intent: "Commercial",
      gapType: "Weak",
      userRank: 28, // Weak!
      compARank: 2,
      compBRank: 4,
      compCRank: 6,
      bestCompRank: 2,
      isHighlighted: false,
    },
    {
      id: "gap-9",
      keyword: "website health score check",
      volume: 19400,
      kd: 48,
      cpc: 4.2,
      intent: "Informational",
      gapType: "Weak",
      userRank: 18,
      compARank: 3,
      compBRank: 1,
      compCRank: 7,
      bestCompRank: 1,
      isHighlighted: false,
    },

    // 4. Strong (User outranks all competitors)
    {
      id: "gap-10",
      keyword: "ai generative answer optimization",
      volume: 16800,
      kd: 31,
      cpc: 4.6,
      intent: "Commercial",
      gapType: "Strong",
      userRank: 1, // User is #1!
      compARank: 4,
      compBRank: 7,
      compCRank: 12,
      bestCompRank: 4,
      isHighlighted: false,
    },

    // 5. Shared (All domains rank)
    {
      id: "gap-11",
      keyword: "keyword difficulty checker",
      volume: 49500,
      kd: 74,
      cpc: 6.5,
      intent: "Commercial",
      gapType: "Shared",
      userRank: 8,
      compARank: 1,
      compBRank: 2,
      compCRank: 4,
      bestCompRank: 1,
      isHighlighted: false,
    },
  ]

  const counts = {
    missing: gapKeywords.filter((k) => k.gapType === "Missing").length,
    untapped: gapKeywords.filter((k) => k.gapType === "Untapped").length,
    weak: gapKeywords.filter((k) => k.gapType === "Weak").length,
    strong: gapKeywords.filter((k) => k.gapType === "Strong").length,
    shared: gapKeywords.filter((k) => k.gapType === "Shared").length,
  }

  return {
    yourDomain: cleanYour,
    competitorA: cleanA,
    competitorB: cleanB,
    competitorC: cleanC,
    analyzedAt: new Date().toISOString(),
    totalKeywordsEvaluated: gapKeywords.length,
    counts,
    gapKeywords,
  }
}

/**
 * CSV Export for Keyword Gap Matrix
 */
export function exportKeywordGapToCSV(gapResult: KeywordGapAnalysisResult): string {
  const headers = [
    "Keyword",
    "Volume",
    "KD %",
    "CPC (USD)",
    "Intent",
    "Gap Type",
    `Your Rank (${gapResult.yourDomain})`,
    `Competitor A (${gapResult.competitorA})`,
    `Competitor B (${gapResult.competitorB})`,
    `Competitor C (${gapResult.competitorC})`,
    "Competitor Ranking But You Not?",
  ]

  const rows = gapResult.gapKeywords.map((k) => [
    `"${k.keyword.replace(/"/g, '""')}"`,
    k.volume,
    k.kd,
    k.cpc.toFixed(2),
    k.intent,
    k.gapType,
    k.userRank !== null ? `#${k.userRank}` : "Not Ranking",
    k.compARank !== null ? `#${k.compARank}` : "Not Ranking",
    k.compBRank !== null ? `#${k.compBRank}` : "Not Ranking",
    k.compCRank !== null ? `#${k.compCRank}` : "Not Ranking",
    k.isHighlighted ? "YES (GAP OPPORTUNITY)" : "NO",
  ])

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
}

function cleanDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
}
