// Shared types for AI Platforms Rank & SEO Checker (Client & Server safe)

export interface EngineRankData {
  engine: "CHATGPT" | "GEMINI" | "PERPLEXITY" | "CLAUDE" | "COPILOT" | "GROK"
  name: string
  model: string
  color: string
  icon: string
  rankPosition: number | null // 1 = #1, 2 = #2, etc., null = unranked
  rankLabel: string // "#1 Ranked", "Top 3", "Top 5", "Unranked"
  mentionRate: number // 0-100%
  sentiment: "POSITIVE" | "NEUTRAL" | "MIXED" | "NEGATIVE"
  sentimentScore: number // 0-100
  aiSnippet: string
  citedSources: string[]
  keyStrength: string
}

export interface QueryMatrixItem {
  query: string
  category: "BRANDED" | "CATEGORY" | "COMPARISON" | "REVIEWS"
  ranks: Record<string, number | null>
}

export interface SEOCheckIssue {
  id: string
  category: "TECHNICAL" | "ON_PAGE" | "AI_CRAWLER" | "CONTENT" | "SCHEMA"
  severity: "CRITICAL" | "WARNING" | "PASSED"
  title: string
  detail: string
  recommendation: string
}

export interface QuickCheckResult {
  targetUrl: string
  domain: string
  brandName: string
  keyword: string
  scannedAt: string

  // High-level summary metrics
  summary: {
    aiVisibilityScore: number // 0-100
    aiScoreTier: string
    seoHealthScore: number // 0-100
    seoScoreTier: string
    enginesRankedCount: number // e.g. 5 of 6
    totalEngines: number // 6
    avgRankPosition: number // e.g. 1.8
    totalCitationsDetected: number
    aiCrawlerReadyScore: number // 0-100
  }

  // AI Platforms Rankings
  aiRankings: {
    engines: EngineRankData[]
    queryMatrix: QueryMatrixItem[]
    shareOfVoice: number // 0-100
    recommendationRate: number // 0-100
    brandPerception: string
  }

  // Live Generative Answer Simulator (AI Overview & Perplexity Answer Card)
  aiOverviewPreview: {
    headline: string
    summary: string
    keyDifferentiators: string[]
    recommendedFor: string
    citationCards: Array<{ title: string; url: string; domain: string }>
  }

  // Competitor Battle (if competitor domain provided)
  competitorBattle?: {
    competitorDomain: string
    competitorBrand: string
    primaryShareOfVoice: number
    competitorShareOfVoice: number
    winner: "PRIMARY" | "COMPETITOR" | "TIE"
    winsByEngine: Record<string, "PRIMARY" | "COMPETITOR" | "TIE">
    verdict: string
  }

  // Technical & Content SEO Audit
  seoAudit: {
    title: { value: string | null; length: number; status: "OPTIMAL" | "TOO_SHORT" | "TOO_LONG" | "MISSING" }
    description: { value: string | null; length: number; status: "OPTIMAL" | "TOO_SHORT" | "TOO_LONG" | "MISSING" }
    canonical: { value: string | null; isSelfCanonical: boolean }
    headings: { h1Count: number; h1Texts: string[]; h2Count: number; h3Count: number; status: "GOOD" | "WARNING" | "CRITICAL" }
    content: { wordCount: number; readingTimeMin: number; textToHtmlRatio: number }
    performance: { responseTimeMs: number; isHttps: boolean; statusCode: number; ttfbRating: "FAST" | "MODERATE" | "SLOW" }
    structuredData: { hasSchema: boolean; schemaTypes: string[]; hasOrganization: boolean; hasSoftwareOrProduct: boolean }
    aiBots: {
      gptBot: "ALLOWED" | "BLOCKED"
      perplexityBot: "ALLOWED" | "BLOCKED"
      claudeBot: "ALLOWED" | "BLOCKED"
      googleExtended: "ALLOWED" | "BLOCKED"
      ccBot: "ALLOWED" | "BLOCKED"
      robotsTxtFound: boolean
    }
    categoryScores: {
      technical: number
      onPage: number
      content: number
      aiCrawler: number
      schema: number
    }
    issues: SEOCheckIssue[]
  }

  // Advanced Generative Engine Optimization (GEO) Metrics
  advancedGeoMetrics?: {
    knowledgeGraphScore: number // 0-100 (Entity Grounding & Disambiguation)
    directAnswerProbability: number // 0-100 (Chance of direct citation in AI answers)
    citationAuthorityScore: number // 0-100 (Third-party validation weight)
    brandSentimentScore: number // 0-100 (Cross-engine sentiment consensus)
    ecosystemConsensus: "STRONG_CONSENSUS" | "MODERATE_CONSENSUS" | "DIVERGENT"
    synthesizedTakeaways: string[]
  }

  // Actionable Fixes & Code Artifacts
  actionableArtifacts: {
    llmsTxt: string
    schemaJsonLd: string
    robotsTxtSnippet: string
    topRecommendations: Array<{
      impact: "HIGH" | "MEDIUM" | "QUICK_WIN"
      title: string
      description: string
      action: string
    }>
  }
}

// Preset demo brands for instant preview
export const DEMO_PRESETS: Record<string, { domain: string; brandName: string; keyword: string }> = {
  "stripe.com": {
    domain: "stripe.com",
    brandName: "Stripe",
    keyword: "best payment processing platform for software & startups",
  },
  "notion.so": {
    domain: "notion.so",
    brandName: "Notion",
    keyword: "best workspace and documentation tool for teams",
  },
  "linear.app": {
    domain: "linear.app",
    brandName: "Linear",
    keyword: "best modern issue tracking and product development software",
  },
  "vercel.com": {
    domain: "vercel.com",
    brandName: "Vercel",
    keyword: "best frontend deployment and serverless hosting platform",
  },
  "shopify.com": {
    domain: "shopify.com",
    brandName: "Shopify",
    keyword: "top ecommerce platforms for scaling online stores",
  },
  "openai.com": {
    domain: "openai.com",
    brandName: "OpenAI",
    keyword: "frontier AI research, LLMs and generative intelligence APIs",
  },
}
