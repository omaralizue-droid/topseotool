export interface UseCase {
  slug: string
  title: string
  subtitle: string
  description: string
  badge: string
  targetAudience: string
  keyBenefits: string[]
  workflowSteps: { step: string; title: string; desc: string }[]
  metricsTracked: string[]
}

export const USE_CASES: UseCase[] = [
  {
    slug: "seo-agencies",
    title: "AI & Technical SEO Audits for Digital Marketing Agencies",
    subtitle: "Deliver automated client PDF reports and track AI search visibility across client portfolios.",
    description: "Equip your agency with white-label client reports, competitor comparison matrixes, and AI assistant rank tracking.",
    badge: "For Agencies",
    targetAudience: "SEO Consultants, Digital Agencies, Growth Marketing Teams",
    keyBenefits: [
      "White-label PDF reports with custom agency logo and branding",
      "Automated monthly site crawls with prioritized technical issue lists",
      "AI brand perception benchmarks comparing client vs key competitors",
      "Multi-user team workspace seats with role permissions",
    ],
    workflowSteps: [
      { step: "01", title: "Add Client Domains", desc: "Create separate projects for each client domain with tailored crawl parameters." },
      { step: "02", title: "Run Crawl & AI Scans", desc: "Evaluate 100+ technical SEO signals and test brand query prompts across ChatGPT, Gemini, and Perplexity." },
      { step: "03", title: "Generate White-Label PDF", desc: "Export branded PDF executive summaries directly to clients." },
    ],
    metricsTracked: ["Overall SEO Health Score", "AI Brand Mention Rate", "Citation Share vs Rivals", "Core Web Vitals Compliance"],
  },
  {
    slug: "saas-companies",
    title: "AI Search Visibility & Brand Citation Tracking for SaaS Brands",
    subtitle: "Ensure your SaaS product is recommended when buyers ask AI engines for software solutions.",
    description: "Monitor commercial prompts, track competitors in ChatGPT and Perplexity, and optimize structured schema data.",
    badge: "For SaaS",
    targetAudience: "SaaS Founders, Product Marketing Managers, Demand Gen Lead",
    keyBenefits: [
      "Real-time tracking of 'Best [Category] Software' commercial prompts",
      "Identify missing structured data FAQ schemas limiting LLM indexing",
      "Monitor competitor mention share in AI response recommendations",
      "Track citation URLs to acquire backlink & referral placements",
    ],
    workflowSteps: [
      { step: "01", title: "Define Commercial Prompts", desc: "Add queries buyers ask when comparing SaaS software in your space." },
      { step: "02", title: "Track AI Engine Recommendations", desc: "See exact prompt response positioning across ChatGPT, Gemini, Claude, and Perplexity." },
      { step: "03", title: "Implement AEO Recommendations", desc: "Deploy JSON-LD schemas and comparison landing pages to capture search share." },
    ],
    metricsTracked: ["Category AI Share of Voice", "Commercial Mention Sentiment", "LLM Citation Count", "Technical Crawl Score"],
  },
  {
    slug: "e-commerce-brands",
    title: "Product & Brand Citation Optimization for E-Commerce",
    subtitle: "Boost product recommendations in AI search engines and search discovery channels.",
    description: "Audit product page schema, monitor shopping query AI answers, and improve Core Web Vitals performance.",
    badge: "For E-Commerce",
    targetAudience: "E-Commerce Directors, D2C Brands, Online Retailers",
    keyBenefits: [
      "Product JSON-LD schema verification for price, stock, and review ratings",
      "Track product recommendations in conversational AI shopping queries",
      "Identify broken image URLs and slow mobile page performance",
      "Compare brand visibility against competing retail marketplaces",
    ],
    workflowSteps: [
      { step: "01", title: "Crawl Store Pages", desc: "Audit product and collection pages for technical issues and mobile responsiveness." },
      { step: "02", title: "Monitor Shopping Prompts", desc: "Test product queries like 'Best eco-friendly shoes' across AI models." },
      { step: "03", title: "Optimize Rich Snippets", desc: "Fix schema errors to ensure rich product snippets appear in search engines." },
    ],
    metricsTracked: ["Product Schema Coverage", "Shopping Query Mention Rate", "Mobile Performance LCP", "Competitive Citation Share"],
  },
]
