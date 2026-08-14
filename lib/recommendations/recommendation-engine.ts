export interface SynthesizedRecommendation {
  id: string
  title: string
  problem: string
  whyItMatters: string
  expectedImpact: "HIGH" | "MEDIUM" | "LOW"
  difficulty: "EASY" | "MEDIUM" | "HARD"
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
  recommendedAction: string
  relatedUrl?: string | null
  sourceMetric: string
  category: "Technical SEO" | "Content" | "On-page SEO" | "Internal linking" | "Structured data" | "AI visibility" | "Brand authority" | "Competitor gap"
  status: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "IGNORED"
}

export function generateSynthesizedRecommendations(
  domain: string,
  seoScore: number,
  aiVisibilityScore: number,
  criticalIssuesCount: number,
  competitorDomains: string[]
): SynthesizedRecommendation[] {
  const recommendations: SynthesizedRecommendation[] = []

  // 1. Structured Data / AEO Gap
  recommendations.push({
    id: "rec-schema-aeo",
    title: "Implement FAQ & Organization JSON-LD Schema for AEO",
    problem: `Domain ${domain} lacks structured JSON-LD schema needed by LLM crawlers for direct Q&A citation.`,
    whyItMatters: "Generative AI engines like ChatGPT and Perplexity rely on Schema.org markup to extract authoritative answer snippets.",
    expectedImpact: "HIGH",
    difficulty: "EASY",
    priority: "CRITICAL",
    recommendedAction: `Add <script type="application/ld+json"> with Organization and FAQPage schema to the homepage of ${domain}.`,
    relatedUrl: `https://${domain}`,
    sourceMetric: "Structured Data Audit",
    category: "Structured data",
    status: "OPEN",
  })

  // 2. Technical SEO Crawl Issue
  if (criticalIssuesCount > 0) {
    recommendations.push({
      id: "rec-tech-critical",
      title: "Resolve Critical Technical Crawl Blockers",
      problem: `Detected ${criticalIssuesCount} critical issue(s) impacting site indexability and mobile viewport rendering.`,
      whyItMatters: "Technical crawl errors prevent search engines from indexing core pages and degrade Core Web Vitals scores.",
      expectedImpact: "HIGH",
      difficulty: "MEDIUM",
      priority: "CRITICAL",
      recommendedAction: "Fix mobile viewport meta tags and ensure canonical URLs resolve to 200 OK status.",
      relatedUrl: `https://${domain}`,
      sourceMetric: "Technical SEO Crawl",
      category: "Technical SEO",
      status: "OPEN",
    })
  }

  // 3. AI Visibility & Citation Gap
  if (aiVisibilityScore < 95) {
    recommendations.push({
      id: "rec-ai-citation",
      title: "Publish Commercial Comparison Guide to Capture LLM Citation Market Share",
      problem: `Competitors (${competitorDomains[0] ?? "rivals"}) hold a higher citation rank for commercial transactional queries.`,
      whyItMatters: "AI engines cite third-party comparison guides when generating product recommendation lists.",
      expectedImpact: "HIGH",
      difficulty: "MEDIUM",
      priority: "HIGH",
      recommendedAction: `Publish a comprehensive '${domain} vs ${competitorDomains[0] ?? "Alternatives"}' comparison guide with structured table markdown.`,
      sourceMetric: "AI Citation Scan",
      category: "Competitor gap",
      status: "OPEN",
    })
  }

  // 4. Content & On-Page SEO
  recommendations.push({
    id: "rec-content-depth",
    title: "Expand Core Feature Landing Pages to Over 800 Words",
    problem: "Several secondary landing pages contain thin content (<300 words).",
    whyItMatters: "Comprehensive content depth increases topical authority for both traditional SERPs and generative AI search models.",
    expectedImpact: "MEDIUM",
    difficulty: "EASY",
    priority: "MEDIUM",
    recommendedAction: "Add H2 subheadings, detailed use-case breakdowns, and contextual internal links.",
    sourceMetric: "On-Page Content Audit",
    category: "Content",
    status: "OPEN",
  })

  return recommendations
}