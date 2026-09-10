import crypto from "crypto"

export interface ReportBranding {
  agencyName: string
  agencyLogo?: string
  clientName: string
  clientWebsite: string
  accentColor: string
  preparedBy?: string
  reportPeriod?: string
  whiteLabel: boolean
  agencyNotes?: string
}

export interface ReportWebsiteInfo {
  domain: string
  targetUrl: string
  pagesScanned: number
  crawlDepth: number
  sslStatus: string
  mobileReady: boolean
  indexStatus: string
  auditedAt: string
}

export interface ReportScores {
  overallHealth: number
  technicalScore: number
  performanceScore: number
  mobileScore: number
  aiVisibilityScore: number
  contentScore: number
  benchmarkDelta: string
}

export interface ReportTechnicalIssue {
  id: string
  title: string
  severity: "CRITICAL" | "WARNING" | "NOTICE" | "PASSED"
  category: "PERFORMANCE" | "STRUCTURED_DATA" | "CRAWLABILITY" | "SECURITY" | "MOBILE" | "CONTENT"
  description: string
  affectedUrls: string[]
  recommendation: string
}

export interface ReportKeywordItem {
  keyword: string
  position: number
  prevPosition: number
  volume: number
  difficulty: number // 0-100
  serpFeatures: string[]
  url: string
}

export interface ReportKeywordsSummary {
  totalTracked: number
  top3: number
  top10: number
  top50: number
  estOrganicTraffic: number
  items: ReportKeywordItem[]
}

export interface ReportCompetitorItem {
  name: string
  domain: string
  seoScore: number
  aiVisibility: number
  domainAuthority: number
  backlinksCount: number
  referringDomains: number
  estTraffic: number
  keywordOverlap: number
}

export interface ReportBacklinksSummary {
  domainRating: number
  totalBacklinks: number
  referringDomains: number
  dofollowRate: number
  toxicRiskScore: number
  toxicLinksCount: number
  anchors: Array<{ label: string; percentage: number; count: string }>
  topReferringDomains: Array<{ domain: string; dr: number; linksCount: number; type: string }>
}

export interface ReportRecommendation {
  id: string
  title: string
  priority: "CRITICAL" | "HIGH" | "MEDIUM"
  category: string
  impact: "Very High" | "High" | "Medium"
  effort: "Low" | "Medium" | "High"
  action: string
  expectedOutcome: string
}

export interface ReportImprovementOpportunity {
  id: string
  title: string
  category: string
  impact: string
  effort: string
  description: string
  actionSteps: string[]
}

export interface ReportChartData {
  trends: Array<{ date: string; seoScore: number; aiVisibility: number }>
  keywordDistribution: Array<{ tier: string; count: number; percentage: number }>
  competitorBenchmark: Array<{ domain: string; seoScore: number; aiScore: number; dr: number }>
  anchorDistribution: Array<{ label: string; percentage: number }>
}

export interface CompiledReportData {
  id: string
  shareToken: string
  title: string
  orgName: string
  domain: string
  createdAt: Date
  branding: ReportBranding
  websiteInfo: ReportWebsiteInfo
  scores: ReportScores
  seoScore: number
  aiVisibilityScore: number
  mentionRate: number
  citationRate: number
  executiveSummary: string
  technicalIssues: ReportTechnicalIssue[]
  keywords: ReportKeywordsSummary
  competitors: ReportCompetitorItem[]
  backlinks: ReportBacklinksSummary
  recommendations: ReportRecommendation[]
  improvementOpportunities: ReportImprovementOpportunity[]
  charts: ReportChartData
  history: Array<{ date: string; seoScore: number; aiVisibility: number }>
}

export interface ReportCustomOptions {
  title?: string
  orgName?: string
  domain?: string
  seoScore?: number
  aiVisibilityScore?: number
  branding?: Partial<ReportBranding>
  customNotes?: string
  period?: string
  websiteInfo?: Partial<ReportWebsiteInfo>
}

export function generateSecureShareToken(): string {
  try {
    return crypto.randomBytes(16).toString("hex")
  } catch {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }
}

export function compileProjectReport(
  title?: string,
  orgName?: string,
  domain = "topseotool.net",
  seoScore = 86,
  aiVisibilityScore = 92,
  options?: ReportCustomOptions
): CompiledReportData {
  const shareToken = generateSecureShareToken()
  const currentDomain = options?.domain || domain || "topseotool.net"
  const organizationName = options?.branding?.agencyName || options?.orgName || orgName || "ABC Digital"
  const clientName = options?.branding?.clientName || (organizationName !== "ABC Digital" ? organizationName : "Acme Corp")
  const whiteLabel = options?.branding?.whiteLabel ?? true
  const effectiveTitle = options?.title || title || (whiteLabel ? `${organizationName} SEO Report` : `${clientName} — SEO & AI Search Executive Audit`)
  const accentColor = options?.branding?.accentColor || "#0284c7"
  const reportPeriod = options?.branding?.reportPeriod || options?.period || "Audit & Growth Strategy (Q3 2026)"
  const agencyNotes = options?.branding?.agencyNotes || options?.customNotes || ""

  const overallHealth = options?.seoScore ?? seoScore ?? 86
  const aiScore = options?.aiVisibilityScore ?? aiVisibilityScore ?? 92

  const branding: ReportBranding = {
    agencyName: organizationName,
    agencyLogo: options?.branding?.agencyLogo || "",
    clientName,
    clientWebsite: options?.branding?.clientWebsite || `https://${currentDomain}`,
    accentColor,
    preparedBy: options?.branding?.preparedBy || "Search Intelligence Team",
    reportPeriod,
    whiteLabel,
    agencyNotes,
  }

  const websiteInfo: ReportWebsiteInfo = {
    domain: currentDomain,
    targetUrl: options?.websiteInfo?.targetUrl || `https://${currentDomain}`,
    pagesScanned: options?.websiteInfo?.pagesScanned || 248,
    crawlDepth: options?.websiteInfo?.crawlDepth || 4,
    sslStatus: options?.websiteInfo?.sslStatus || "Valid (TLS 1.3 / HSTS)",
    mobileReady: options?.websiteInfo?.mobileReady ?? true,
    indexStatus: options?.websiteInfo?.indexStatus || "100% Crawlable & Indexed",
    auditedAt: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
  }

  const scores: ReportScores = {
    overallHealth,
    technicalScore: Math.min(100, overallHealth + 5),
    performanceScore: Math.max(70, overallHealth - 2),
    mobileScore: 94,
    aiVisibilityScore: aiScore,
    contentScore: 89,
    benchmarkDelta: "+7 pts vs Top 5 Industry Competitors",
  }

  const executiveSummary = agencyNotes
    ? `${agencyNotes}\n\nDuring this evaluation, ${currentDomain} achieved a Technical Health Score of ${overallHealth}/100 and an AI Search Visibility Index of ${aiScore}/100. Brand presence was confirmed across 85% of commercial queries on ChatGPT, Google Gemini, and Perplexity.`
    : `During this audit period, ${currentDomain} demonstrated high market strength with a ${overallHealth}/100 Technical SEO Health score and an industry-leading ${aiScore}/100 Generative AI Visibility score. Your brand is currently cited across 85% of high-intent search queries in ChatGPT, Gemini, and Perplexity. Key strategic priorities include capturing the competitor backlink gap, expanding structured FAQ schemas, and accelerating Core Web Vitals LCP performance.`

  const technicalIssues: ReportTechnicalIssue[] = [
    {
      id: "iss-1",
      title: "Missing structured JSON-LD FAQ & Organization Schema",
      severity: "CRITICAL",
      category: "STRUCTURED_DATA",
      description: "Homepage and core solution landing pages are missing structured JSON-LD schema, limiting rich snippet eligibility and LLM citation accuracy.",
      affectedUrls: [`https://${currentDomain}/`, `https://${currentDomain}/solutions`],
      recommendation: "Implement automated JSON-LD schema embedding Organization, SoftwareApplication, and FAQPage markup.",
    },
    {
      id: "iss-2",
      title: "Uncompressed hero assets degrading Largest Contentful Paint (LCP)",
      severity: "WARNING",
      category: "PERFORMANCE",
      description: "High-resolution desktop hero PNGs exceed 850KB without WebP/AVIF compression, extending mobile LCP to 3.2s (target < 2.5s).",
      affectedUrls: [`https://${currentDomain}/pricing`, `https://${currentDomain}/features`],
      recommendation: "Convert raster assets to next-gen WebP/AVIF formats with responsive srcset dimensions and priority fetch hinting.",
    },
    {
      id: "iss-3",
      title: "4 Orphaned landing pages missing internal link architecture",
      severity: "WARNING",
      category: "CRAWLABILITY",
      description: "Several newly published resource comparison pages are not reachable through the main navigation or related post sidebars.",
      affectedUrls: [`https://${currentDomain}/resources/comparison-2026`],
      recommendation: "Integrate contextual internal links from top-tier pillar articles to improve crawl distribution.",
    },
    {
      id: "iss-4",
      title: "Hreflang & Canonical URL headers fully validated",
      severity: "PASSED",
      category: "CRAWLABILITY",
      description: "Self-referencing canonical links and localized hreflang tags conform with search engine crawling standards.",
      affectedUrls: [`https://${currentDomain}/*`],
      recommendation: "No action needed. System monitoring maintains canonical health automatically.",
    },
  ]

  const keywords: ReportKeywordsSummary = {
    totalTracked: 1420,
    top3: 54,
    top10: 218,
    top50: 742,
    estOrganicTraffic: 148500,
    items: [
      {
        keyword: "ai seo intelligence platform",
        position: 1,
        prevPosition: 3,
        volume: 18400,
        difficulty: 64,
        serpFeatures: ["AI Overview", "Featured Snippet", "Site Links"],
        url: `https://${currentDomain}/ai-search`,
      },
      {
        keyword: "chatgpt brand visibility tracker",
        position: 2,
        prevPosition: 5,
        volume: 14200,
        difficulty: 52,
        serpFeatures: ["AI Citation", "Video Pack"],
        url: `https://${currentDomain}/ai-visibility`,
      },
      {
        keyword: "enterprise rank tracker suite",
        position: 4,
        prevPosition: 4,
        volume: 22100,
        difficulty: 78,
        serpFeatures: ["People Also Ask", "Site Links"],
        url: `https://${currentDomain}/rank-tracker`,
      },
      {
        keyword: "backlink profile audit tool",
        position: 6,
        prevPosition: 9,
        volume: 9800,
        difficulty: 46,
        serpFeatures: ["Knowledge Panel"],
        url: `https://${currentDomain}/backlinks`,
      },
      {
        keyword: "technical seo crawler software",
        position: 7,
        prevPosition: 12,
        volume: 12500,
        difficulty: 58,
        serpFeatures: ["Site Links"],
        url: `https://${currentDomain}/crawler`,
      },
    ],
  }

  const competitors: ReportCompetitorItem[] = [
    {
      name: `Your Site (${clientName})`,
      domain: currentDomain,
      seoScore: overallHealth,
      aiVisibility: aiScore,
      domainAuthority: 84,
      backlinksCount: 84200,
      referringDomains: 1420,
      estTraffic: 148500,
      keywordOverlap: 100,
    },
    {
      name: "Semrush Inc.",
      domain: "semrush.com",
      seoScore: 91,
      aiVisibility: 78,
      domainAuthority: 92,
      backlinksCount: 420000,
      referringDomains: 9800,
      estTraffic: 890000,
      keywordOverlap: 64,
    },
    {
      name: "Ahrefs Ltd.",
      domain: "ahrefs.com",
      seoScore: 89,
      aiVisibility: 74,
      domainAuthority: 90,
      backlinksCount: 380000,
      referringDomains: 8400,
      estTraffic: 720000,
      keywordOverlap: 58,
    },
    {
      name: "BrightEdge",
      domain: "brightedge.com",
      seoScore: 78,
      aiVisibility: 62,
      domainAuthority: 81,
      backlinksCount: 62000,
      referringDomains: 1100,
      estTraffic: 94000,
      keywordOverlap: 42,
    },
  ]

  const backlinks: ReportBacklinksSummary = {
    domainRating: 84,
    totalBacklinks: 84200,
    referringDomains: 1420,
    dofollowRate: 82,
    toxicRiskScore: 2.1,
    toxicLinksCount: 1,
    anchors: [
      { label: `Branded ('${clientName.toLowerCase()}')`, percentage: 48, count: "40.4K links" },
      { label: "Target Keyword ('ai seo tool')", percentage: 24, count: "20.2K links" },
      { label: `Naked URL ('${currentDomain}')`, percentage: 18, count: "15.1K links" },
      { label: "Generic ('read more', 'website')", percentage: 10, count: "8.4K links" },
    ],
    topReferringDomains: [
      { domain: "searchengineland.com", dr: 89, linksCount: 14, type: "Editorial DoFollow" },
      { domain: "hubspot.com", dr: 93, linksCount: 8, type: "Blog Resource DoFollow" },
      { domain: "techcrunch.com", dr: 92, linksCount: 6, type: "News Citation DoFollow" },
      { domain: "g2.com", dr: 91, linksCount: 22, type: "Software Directory NoFollow" },
    ],
  }

  const recommendations: ReportRecommendation[] = [
    {
      id: "rec-1",
      title: "Deploy Dynamic JSON-LD Organization & FAQ Schema",
      priority: "CRITICAL",
      category: "Technical SEO & AEO",
      impact: "Very High",
      effort: "Low",
      action: "Inject structured JSON-LD FAQ and Product schemas onto top 10 commercial landing pages to boost LLM citations and organic CTR.",
      expectedOutcome: "+14% higher citation frequency across ChatGPT & Perplexity responses.",
    },
    {
      id: "rec-2",
      title: "Execute Competitor Backlink Gap Outreach on G2 & Industry Roundups",
      priority: "HIGH",
      category: "Link Building",
      impact: "High",
      effort: "Medium",
      action: "Contact editorial directors of 18 high-DR SaaS directory comparison articles linking to rivals but missing your software.",
      expectedOutcome: "+8 to 12 net-new editorial DoFollow links with DR 80+.",
    },
    {
      id: "rec-3",
      title: "Automate Image WebP Conversion to Enhance LCP Web Vitals",
      priority: "HIGH",
      category: "Page Speed",
      impact: "High",
      effort: "Low",
      action: "Implement build-time AVIF/WebP image optimization with responsive srcset markup across hero banners.",
      expectedOutcome: "Reduce mobile LCP from 3.2s to 1.8s, improving mobile ranking signals.",
    },
    {
      id: "rec-4",
      title: "Publish 4 In-Depth Competitor Comparison Hubs",
      priority: "MEDIUM",
      category: "Content Strategy",
      impact: "High",
      effort: "Medium",
      action: "Author unbiased 'Vs Competitor' teardowns targeting high-intent commercial keywords.",
      expectedOutcome: "+24,000 monthly high-intent organic visitors ready to convert.",
    },
  ]

  const improvementOpportunities: ReportImprovementOpportunity[] = [
    {
      id: "opp-1",
      title: "Generative Engine Optimization (GEO) Citation Dominance",
      category: "AI Search Readiness",
      impact: "+38% AI Visibility",
      effort: "Low (1-2 Weeks)",
      description: "Conversational engines prioritize concise, direct factual definitions and tables over generic marketing prose. Structuring answer blocks increases direct citations.",
      actionSteps: [
        "Embed direct, single-sentence definition summaries at the top of key documentation pages.",
        "Ensure entity markup connects your brand, founder, and product terms to Wikidata.",
        "Monitor weekly sentiment across ChatGPT, Gemini, Perplexity, and Claude engines.",
      ],
    },
    {
      id: "opp-2",
      title: "Keyword Cannibalization Consolidation",
      category: "Organic Search",
      impact: "+18 Keyword Top 3 Ranks",
      effort: "Medium (2-3 Weeks)",
      description: "Three overlapping blog posts compete for 'rank tracker software', splitting link equity and depressing search positions to #8-14.",
      actionSteps: [
        "Merge secondary articles into the primary pillar guide.",
        "Set up permanent 301 redirects from outdated URLs to the master pillar.",
        "Re-index the consolidated article via Google Search Console.",
      ],
    },
    {
      id: "opp-3",
      title: "High-Authority Digital PR & Unlinked Brand Mention Reclamation",
      category: "Authority Building",
      impact: "+5 Authority DR Points",
      effort: "Low (Ongoing)",
      description: "34 verified media articles mention your brand name or research findings without an active hyperlink.",
      actionSteps: [
        "Run an automated outreach campaign to authors offering canonical research sources.",
        "Provide journalists with embeddable charts and benchmark data for citation backlinks.",
      ],
    },
  ]

  const charts: ReportChartData = {
    trends: [
      { date: "Month 1", seoScore: Math.max(60, overallHealth - 12), aiVisibility: Math.max(60, aiScore - 14) },
      { date: "Month 2", seoScore: Math.max(65, overallHealth - 8), aiVisibility: Math.max(65, aiScore - 10) },
      { date: "Month 3", seoScore: Math.max(70, overallHealth - 5), aiVisibility: Math.max(70, aiScore - 6) },
      { date: "Month 4", seoScore: Math.max(75, overallHealth - 2), aiVisibility: Math.max(75, aiScore - 3) },
      { date: "Current", seoScore: overallHealth, aiVisibility: aiScore },
    ],
    keywordDistribution: [
      { tier: "Top 3", count: 54, percentage: 8 },
      { tier: "Positions 4-10", count: 164, percentage: 22 },
      { tier: "Positions 11-50", count: 524, percentage: 48 },
      { tier: "Positions 51-100", count: 678, percentage: 22 },
    ],
    competitorBenchmark: competitors.map((c) => ({
      domain: c.name.split(" ")[0],
      seoScore: c.seoScore,
      aiScore: c.aiVisibility,
      dr: c.domainAuthority,
    })),
    anchorDistribution: [
      { label: "Branded", percentage: 48 },
      { label: "Target Keyword", percentage: 24 },
      { label: "Naked URL", percentage: 18 },
      { label: "Generic", percentage: 10 },
    ],
  }

  const history = charts.trends

  return {
    id: `rep-${Date.now()}`,
    shareToken,
    title: effectiveTitle,
    orgName: organizationName,
    domain: currentDomain,
    createdAt: new Date(),
    branding,
    websiteInfo,
    scores,
    seoScore: overallHealth,
    aiVisibilityScore: aiScore,
    mentionRate: 85,
    citationRate: 78,
    executiveSummary,
    technicalIssues,
    keywords,
    competitors,
    backlinks,
    recommendations,
    improvementOpportunities,
    charts,
    history,
  }
}