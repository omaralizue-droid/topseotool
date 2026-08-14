export interface CompetitorBenchmark {
  id: string
  name: string
  domain: string
  description?: string | null
  seoScore: number
  aiVisibility: number
  mentionRate: number
  citationRate: number
  recommendationRate: number
  sentiment: string
  contentCoverage: number
  addedDate: Date
}

export interface WinLossInsight {
  query: string
  winner: string
  userRank: number | null
  competitorRank: number | null
  opportunity: string
}

export function generateWinLossAnalysis(userBrand: string, competitors: CompetitorBenchmark[]): {
  competitorWins: WinLossInsight[]
  userWins: WinLossInsight[]
  contentOpportunities: Array<{ topic: string; impact: string; difficulty: string; description: string }>
} {
  const compName = competitors[0]?.name ?? "Competitor"

  const competitorWins: WinLossInsight[] = [
    {
      query: `Top enterprise ${userBrand} alternatives for high-volume teams`,
      winner: compName,
      userRank: 3,
      competitorRank: 1,
      opportunity: "Publish comparison landing page with structured schema & enterprise feature table.",
    },
    {
      query: "Which platform offers better multi-user role permissions?",
      winner: compName,
      userRank: 2,
      competitorRank: 1,
      opportunity: "Add detailed documentation page on RBAC & team permissions to improve LLM indexing.",
    },
  ]

  const userWins: WinLossInsight[] = [
    {
      query: "Best software for tracking ChatGPT & Gemini brand mentions",
      winner: userBrand,
      userRank: 1,
      competitorRank: 4,
      opportunity: "Maintain #1 position by continuing weekly AI search visibility scans.",
    },
    {
      query: "Top SEO website audit tool with AEO recommendation engine",
      winner: userBrand,
      userRank: 1,
      competitorRank: 3,
      opportunity: "Highlight AEO methodology in blog posts to capture AI citation share.",
    },
  ]

  const contentOpportunities = [
    {
      topic: "Answer Engine Optimization (AEO) vs Traditional SEO Benchmark",
      impact: "High",
      difficulty: "Medium",
      description: "Create an in-depth guide on AEO strategy. Competitors lack content in this area.",
    },
    {
      topic: "Multi-Engine LLM Perception Audit Checklist",
      impact: "High",
      difficulty: "Low",
      description: "Publish downloadable checklist schema to capture LLM source citations.",
    },
  ]

  return { competitorWins, userWins, contentOpportunities }
}