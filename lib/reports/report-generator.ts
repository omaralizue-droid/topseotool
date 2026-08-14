import crypto from "crypto"

export interface CompiledReportData {
  id: string
  shareToken: string
  title: string
  orgName: string
  domain: string
  createdAt: Date
  seoScore: number
  aiVisibilityScore: number
  mentionRate: number
  citationRate: number
  executiveSummary: string
  technicalIssues: Array<{ title: string; severity: string; category: string }>
  competitors: Array<{ name: string; domain: string; seoScore: number; aiVisibility: number }>
  recommendations: Array<{ title: string; priority: string; action: string }>
  history: Array<{ date: string; seoScore: number; aiVisibility: number }>
}

export function generateSecureShareToken(): string {
  return crypto.randomBytes(16).toString("hex")
}

export function compileProjectReport(
  title: string,
  orgName: string,
  domain: string,
  seoScore = 84,
  aiVisibilityScore = 92
): CompiledReportData {
  const shareToken = generateSecureShareToken()

  return {
    id: `rep-${Date.now()}`,
    shareToken,
    title,
    orgName,
    domain,
    createdAt: new Date(),
    seoScore,
    aiVisibilityScore,
    mentionRate: 85,
    citationRate: 78,
    executiveSummary: `During this audit period, ${domain} maintained a strong overall digital presence with a ${seoScore}/100 Technical SEO Health score and a ${aiVisibilityScore}/100 AI Search Visibility score. Brand mentions were detected across 85% of sampled commercial queries in ChatGPT, Gemini, and Perplexity.`,
    technicalIssues: [
      { title: "Missing structured JSON-LD FAQ Schema", severity: "CRITICAL", category: "STRUCTURED_DATA" },
      { title: "Unoptimized landing page image sizes", severity: "WARNING", category: "PERFORMANCE" },
    ],
    competitors: [
      { name: "Legacy Competitor", domain: "competitor-example.com", seoScore: 72, aiVisibility: 45 },
    ],
    recommendations: [
      { title: "Implement FAQ & Organization JSON-LD Schema", priority: "CRITICAL", action: "Add JSON-LD script to homepage to boost LLM citations." },
      { title: "Publish Comparison Guide vs Key Rivals", priority: "HIGH", action: "Publish brand comparison page to capture competitor search share." },
    ],
    history: [
      { date: "Week 1", seoScore: 78, aiVisibility: 84 },
      { date: "Week 2", seoScore: 82, aiVisibility: 88 },
      { date: "Week 3", seoScore: 84, aiVisibility: 92 },
    ],
  }
}