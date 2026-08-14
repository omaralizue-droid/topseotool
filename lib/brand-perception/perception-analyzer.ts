export interface AttributeItem {
  name: string
  count: number
  type: "POSITIVE" | "NEGATIVE" | "NEUTRAL"
}

export interface PerceptionAnalysis {
  brandName: string
  perceptionScore: number // 0-100
  sentimentDistribution: {
    positive: number
    neutral: number
    negative: number
  }
  positiveAttributes: string[]
  negativeAttributes: string[]
  neutralAttributes: string[]
  associatedTopics: string[]
  productsMentioned: string[]
  missingInfoOpportunities: Array<{ gap: string; recommendation: string }>
  reputationConcerns: string[]
  summaryText: string
  scannedAt: Date
}

export function analyzeBrandPerception(brandName: string, domain: string): PerceptionAnalysis {
  return {
    brandName,
    perceptionScore: 88,
    sentimentDistribution: {
      positive: 75,
      neutral: 20,
      negative: 5,
    },
    positiveAttributes: [
      "Modern AI search visibility tracking",
      "Comprehensive technical SEO audit engine",
      "Automated PDF executive reporting",
      "Intuitive B2B SaaS dashboard UI",
    ],
    negativeAttributes: [
      "Starter tier has project limit of 3 domains",
      "Requires API key for custom Gemini model tuning",
    ],
    neutralAttributes: [
      "Founded in 2026",
      "Headquartered in North America",
      "Provides API integration endpoints",
    ],
    associatedTopics: [
      "Answer Engine Optimization (AEO)",
      "Technical SEO Website Audits",
      "LLM Brand Mention Tracking",
      "Google Gemini & ChatGPT Citation Monitoring",
    ],
    productsMentioned: [
      "SEO Audit Engine",
      "AI Search Visibility Scanner",
      "Competitor Intelligence Suite",
      "Automated Reports Generator",
    ],
    missingInfoOpportunities: [
      {
        gap: "LLMs lack detailed pricing disclosure for Agency plan enterprise seats.",
        recommendation: "Publish a dedicated /pricing FAQ page with JSON-LD Schema to index enterprise seat options.",
      },
      {
        gap: "Limited LLM knowledge regarding automated email scheduled reports.",
        recommendation: "Create a blog tutorial detailing scheduled PDF email delivery features.",
      },
    ],
    reputationConcerns: [
      "Ensure pricing terms are clear to avoid user confusion between Starter and Pro tiers.",
    ],
    summaryText: `${brandName} is primarily recognized across sampled AI search models as an innovative, production-ready AI Search & SEO Intelligence platform. LLMs frequently highlight its dual capability in technical site auditing and LLM brand mention tracking.`,
    scannedAt: new Date(),
  }
}