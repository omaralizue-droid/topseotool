// ============================================================
// TOPSEOTOOL — Programmatic SEO Engine Dataset & Metadata
// Defines structured content, schemas, and comparison data for the 8 Landing Pages
// ============================================================

export interface ProgrammaticPageData {
  slug: string
  path: string
  title: string
  h1: string
  subheadline: string
  metaDescription: string
  heroBadge: string
  metrics: Array<{ value: string; label: string; trend?: string }>
  features: Array<{ title: string; desc: string; icon: string }>
  comparison: {
    title: string
    rows: Array<{ feature: string; topseotool: string; legacy: string }>
  }
  faqs: Array<{ question: string; answer: string }>
  breadcrumbs: Array<{ name: string; item: string }>
}

export const PROGRAMMATIC_PAGES: Record<string, ProgrammaticPageData> = {
  "seo-tools": {
    slug: "seo-tools",
    path: "/seo-tools",
    title: "Best Enterprise SEO Tools & Intelligence Suite (2026)",
    h1: "All-in-One SEO Tools & AI Search Intelligence",
    subheadline:
      "Audit websites, discover profitable keywords, track rankings, analyze competitors and optimize content from one powerful platform.",
    metaDescription:
      "Comprehensive SEO tools suite. Technical site audits, keyword clustering, daily SERP tracking, backlink analytics, and AI search engine visibility across ChatGPT and Perplexity.",
    heroBadge: "All-in-One Platform",
    metrics: [
      { value: "100+", label: "Automated Audit Checks", trend: "Real-time" },
      { value: "200M+", label: "Global Keywords Indexed", trend: "190+ Countries" },
      { value: "Daily", label: "Automated SERP Radar", trend: "Mobile & Desktop" },
      { value: "6 Engines", label: "AI Search LLMs Tracked", trend: "AEO Optimization" },
    ],
    features: [
      { title: "Technical Site Crawler", desc: "Crawls thousands of JavaScript pages, evaluates canonicals, redirects, and Core Web Vitals.", icon: "Globe" },
      { title: "Keyword Intent Explorer", desc: "Filter by search volume, intent category, CPC, and localized keyword difficulty scores.", icon: "Search" },
      { title: "Daily Rank Tracking", desc: "Track exact keyword positions across Google and Bing with automated rank drop alerts.", icon: "TrendingUp" },
      { title: "Competitor Domain Gap", desc: "Spot the exact high-value keywords your rivals rank for that you are currently missing.", icon: "Users2" },
      { title: "Backlink Graph Explorer", desc: "Monitor referring domain velocity, toxic anchor footprints, and high-DA link opportunities.", icon: "Link2" },
      { title: "AI Search Citation Monitor", desc: "Track every time ChatGPT, Claude, Gemini, or Perplexity mentions or cites your brand.", icon: "Brain" },
    ],
    comparison: {
      title: "TOPSEOTOOL vs Legacy SEO Software",
      rows: [
        { feature: "AI Search Engine Tracking (ChatGPT, Perplexity)", topseotool: "Included natively in all plans", legacy: "Not supported or limited" },
        { feature: "Non-Blocking Background Queue Architecture", topseotool: "Redis + BullMQ instant response", legacy: "Synchronous page blocking" },
        { feature: "White-Label Agency PDF Reporting", topseotool: "100% White-label included", legacy: "Expensive enterprise add-on" },
        { feature: "Developer REST API & Webhooks", topseotool: "Standard v1 REST API", legacy: "Restricted behind $500+/mo plans" },
      ],
    },
    faqs: [
      {
        question: "What tools are included in the TOPSEOTOOL suite?",
        answer: "The platform includes deep technical site auditing, keyword research & clustering, daily rank tracking, competitor gap analysis, backlink monitoring, NLP content optimization, and AI search citation tracking.",
      },
      {
        question: "Can I replace Semrush or Ahrefs with TOPSEOTOOL?",
        answer: "Yes. TOPSEOTOOL replaces traditional crawling, keyword research, and rank tracking tools while adding modern AI Engine Optimization (AEO) tracking that legacy tools lack.",
      },
      {
        question: "Is there a free trial available?",
        answer: "Yes, you can start completely free with no credit card required, or test any paid plan risk-free with our 14-day free trial.",
      },
    ],
    breadcrumbs: [
      { name: "Home", item: "/" },
      { name: "SEO Tools", item: "/seo-tools" },
    ],
  },

  "seo-audit": {
    slug: "seo-audit",
    path: "/seo-audit",
    title: "Free Technical SEO Audit Tool & Site Health Scanner",
    h1: "Deep Technical Site Audit & Core Web Vitals Scanner",
    subheadline:
      "Crawl your website in seconds. Detect broken links, crawl errors, missing schema markup, and performance bottlenecks silently hurting your rankings.",
    metaDescription:
      "Enterprise technical SEO audit tool. Scan thousands of URLs, evaluate Core Web Vitals (LCP, INP, CLS), catch 4xx/5xx errors, and fix on-page issues.",
    heroBadge: "Site Health Diagnostics",
    metrics: [
      { value: "< 60s", label: "Average Crawl Execution", trend: "Asynchronous" },
      { value: "100+", label: "Diagnostic Checkpoints", trend: "Automated" },
      { value: "CWV", label: "Real User Metric Signals", trend: "CrUX Integration" },
      { value: "1-Click", label: "Actionable Recommendations", trend: "Prioritized" },
    ],
    features: [
      { title: "Comprehensive Crawler", desc: "Parses HTML and JavaScript rendering to identify broken links, redirects, and canonical loops.", icon: "ShieldCheck" },
      { title: "Core Web Vitals Scoring", desc: "Measures real-world Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and CLS.", icon: "Zap" },
      { title: "Structured Data Validation", desc: "Verifies JSON-LD schemas, Open Graph tags, Twitter cards, and FAQ markup.", icon: "Layers" },
      { title: "Scheduled Recurring Audits", desc: "Automated weekly health scans that alert you when health scores drop by >= 5 points.", icon: "Clock" },
    ],
    comparison: {
      title: "Why Our Site Audit Outperforms Traditional Crawlers",
      rows: [
        { feature: "Crawler Execution", topseotool: "Non-blocking background job queue", legacy: "Ties up browser or server threads" },
        { feature: "Automated Anomaly Alerts", topseotool: "Instant email alert on score drops", legacy: "Manual login check required" },
        { feature: "LLM Readiness Checks", topseotool: "Validates llms.txt & AI bot directives", legacy: "No AI crawler awareness" },
      ],
    },
    faqs: [
      {
        question: "How does the SEO audit crawler work?",
        answer: "Our background crawler fetches pages asynchronously, checks HTTP response headers, renders internal links, checks canonical declarations, and computes categorized health scores across Technical, Content, and Performance pillars.",
      },
      {
        question: "Does the crawler respect robots.txt?",
        answer: "Yes, our crawler fully respects robots.txt directives and crawls responsibly with customizable crawl speed and depth limits.",
      },
    ],
    breadcrumbs: [
      { name: "Home", item: "/" },
      { name: "SEO Audit", item: "/seo-audit" },
    ],
  },

  "keyword-research": {
    slug: "keyword-research",
    path: "/keyword-research",
    title: "Keyword Research Tool — Search Volume, KD% & Intent Clusters",
    h1: "Profitable Keyword Research & Intent Clustering Tool",
    subheadline:
      "Uncover high-intent, low-difficulty search queries that drive actual pipeline and paying customers across global and local markets.",
    metaDescription:
      "Discover profitable search terms with our advanced keyword research tool. Search volume, Keyword Difficulty (KD%), CPC, intent grouping, and competitor overlap.",
    heroBadge: "Keyword Intelligence",
    metrics: [
      { value: "200M+", label: "Keyword Database", trend: "Updated Daily" },
      { value: "4 Types", label: "Intent Groupings", trend: "Commercial & More" },
      { value: "0-100", label: "Calibrated KD Scale", trend: "Real Page 1 Scores" },
      { value: "CPC Data", label: "Paid Search Benchmarks", trend: "Commercial Value" },
    ],
    features: [
      { title: "Intent Clustering", desc: "Automatically groups keywords into Commercial, Informational, Transactional, and Navigational buckets.", icon: "Search" },
      { title: "Keyword Difficulty (KD%)", desc: "Evaluates actual page authority and backlink profiles required to rank in the Top 10.", icon: "BarChart3" },
      { title: "Question Keyword Discovery", desc: "Identifies question queries (Who, What, Where, Why) ideal for Featured Snippets and AI citations.", icon: "Sparkles" },
      { title: "High-Volume Seed Expansion", desc: "Turn single seed terms into hundreds of long-tail variations with exact search volume.", icon: "TrendingUp" },
    ],
    comparison: {
      title: "Keyword Intelligence Comparison",
      rows: [
        { feature: "Intent Classification", topseotool: "Automated NLP Intent Detection", legacy: "Manual tagging or rules" },
        { feature: "AI Answer Optimization", topseotool: "Evaluates LLM search citation volume", legacy: "Google 10-blue-links only" },
        { feature: "Export Formats", topseotool: "CSV, JSON, REST API integration", legacy: "Clunky CSV exports" },
      ],
    },
    faqs: [
      {
        question: "How accurate is the search volume data?",
        answer: "Our search volumes are calculated from blended clickstream datasets and search provider metrics, filtered to eliminate bot noise and seasonal distortions.",
      },
      {
        question: "What is Keyword Difficulty (KD%)?",
        answer: "KD% is a 0-100 score estimating how hard it is to rank on Page 1, calculated from the backlink authority and content depth of existing top-ranking pages.",
      },
    ],
    breadcrumbs: [
      { name: "Home", item: "/" },
      { name: "Keyword Research", item: "/keyword-research" },
    ],
  },

  "rank-tracker": {
    slug: "rank-tracker",
    path: "/rank-tracker",
    title: "Daily SERP Rank Tracker — Accurate Multi-Engine Position Tracking",
    h1: "Automated Daily SERP Rank Tracker & Drop Detection",
    subheadline:
      "Monitor your search engine positions across Google & Bing in 190+ countries. Get instant alerts when rankings change or competitors displace you.",
    metaDescription:
      "Accurate SERP rank tracker. Daily automated position checks, mobile vs desktop rankings, featured snippet tracking, and real-time rank drop alerts.",
    heroBadge: "Rank Surveillance",
    metrics: [
      { value: "24/7", label: "Automated Surveillance", trend: "Scheduled Jobs" },
      { value: "190+", label: "Supported Geographies", trend: "City-Level Precision" },
      { value: "Mobile/Desktop", label: "Device Segmentation", trend: "Real User Agents" },
      { value: "Drop Alert", label: "Triggered Notifications", trend: ">= 3 Spots Delta" },
    ],
    features: [
      { title: "Daily Position Auditing", desc: "Runs scheduled background queries every morning to record exact SERP rank deltas.", icon: "TrendingUp" },
      { title: "Instant Drop Alerts", desc: "Sends immediate notifications when target keywords drop out of Top 3 or off Page 1.", icon: "ShieldAlert" },
      { title: "SERP Feature Detection", desc: "Tracks Featured Snippets, Knowledge Panels, Video Carousels, and People Also Ask boxes.", icon: "Globe" },
      { title: "Historical Progress Charts", desc: "Visualize rank movement trends over 7, 30, and 90-day intervals with benchmark comparisons.", icon: "BarChart3" },
    ],
    comparison: {
      title: "Rank Tracker Capabilities",
      rows: [
        { feature: "Update Frequency", topseotool: "Daily automated background queue", legacy: "Weekly or expensive daily add-on" },
        { feature: "Rank Drop Alerts", topseotool: "Real-time email & in-app alerts", legacy: "Weekly digest emails" },
        { feature: "Local Geolocation", topseotool: "Postal code & city level", legacy: "Country level only" },
      ],
    },
    faqs: [
      {
        question: "How often are keyword rankings updated?",
        answer: "Rankings are updated automatically every 24 hours in our background worker pool, and can also be refreshed on-demand with a single click.",
      },
      {
        question: "Can I track rankings for mobile and desktop separately?",
        answer: "Yes, you can segment any tracked keyword by Desktop or Mobile devices to account for mobile-first indexing differences.",
      },
    ],
    breadcrumbs: [
      { name: "Home", item: "/" },
      { name: "Rank Tracker", item: "/rank-tracker" },
    ],
  },

  "competitor-analysis": {
    slug: "competitor-analysis",
    path: "/competitor-analysis",
    title: "Competitor SEO Analysis Tool — Domain Overlap & Keyword Gap",
    h1: "Competitor Domain Intelligence & Keyword Gap Analysis",
    subheadline:
      "Deconstruct your rivals' organic acquisition playbook. Uncover their top revenue-generating keywords, content gaps, and backlinks.",
    metaDescription:
      "Analyze competitor domains side-by-side. Spot keyword overlap gaps, monitor competitor ranking swings, and discover untapped organic opportunities.",
    heroBadge: "Competitive Edge",
    metrics: [
      { value: "Side-by-Side", label: "Multi-Domain Comparison", trend: "Up to 10 Rivals" },
      { value: "Keyword Gap", label: "Untapped Queries Found", trend: "High Conversion" },
      { value: "SERP Share", label: "Visibility Benchmarking", trend: "Direct Comparison" },
      { value: "Link Gap", label: "Intersecting Link Prospects", trend: "Referring Domains" },
    ],
    features: [
      { title: "Keyword Gap Matrix", desc: "Identify high-volume keywords where rivals rank on Page 1 and your domain is missing.", icon: "Users2" },
      { title: "Competitor Rank Swings", desc: "Automated alerts when competitors gain or lose top rankings on target queries.", icon: "TrendingUp" },
      { title: "Shared Link Intersect", desc: "Find referring domains linking to 2 or more of your competitors but not to your site.", icon: "Link2" },
      { title: "AI Visibility Benchmark", desc: "Compare how often AI engines recommend your competitors vs your brand.", icon: "Brain" },
    ],
    comparison: {
      title: "Competitor Analysis Comparison",
      rows: [
        { feature: "AI Brand Share", topseotool: "Evaluates ChatGPT & Perplexity share", legacy: "No LLM competitor metrics" },
        { feature: "Keyword Gap Speed", topseotool: "Instant sub-second matrix rendering", legacy: "Slow multi-minute crawls" },
        { feature: "Client Export", topseotool: "Branded PDF competitor reports", legacy: "Raw CSV exports" },
      ],
    },
    faqs: [
      {
        question: "How many competitors can I monitor?",
        answer: "You can track up to 10 competitor domains per project depending on your plan tier, with continuous daily monitoring.",
      },
      {
        question: "What is a Keyword Gap?",
        answer: "A keyword gap reveals search queries where your competitors rank in the top search results, but your domain does not rank at all, representing high-opportunity content topics.",
      },
    ],
    breadcrumbs: [
      { name: "Home", item: "/" },
      { name: "Competitor Analysis", item: "/competitor-analysis" },
    ],
  },

  "backlink-checker": {
    slug: "backlink-checker",
    path: "/backlink-checker",
    title: "Backlink Checker & Toxic Link Audit Tool",
    h1: "Comprehensive Backlink Checker & Referring Domain Auditor",
    subheadline:
      "Analyze your backlink graph, evaluate Domain Authority, monitor lost high-value backlinks, and detect toxic spam link footprints.",
    metaDescription:
      "Inspect backlink profiles with precision. Track referring domains, domain authority (DA), lost backlink alerts, anchor text distribution, and toxic links.",
    heroBadge: "Authority & Links",
    metrics: [
      { value: "48,000+", label: "Backlink Index Capacity", trend: "Deep Graph" },
      { value: "0-100", label: "Domain Authority Metric", trend: "Algorithmic" },
      { value: "Lost Alert", label: "High-DA Link Monitoring", trend: "Instant Trigger" },
      { value: "Toxic Audit", label: "Spam Risk Percentage", trend: "Anchor Text Analysis" },
    ],
    features: [
      { title: "Referring Domain Health", desc: "Crawl inbound links, evaluating domain authority and subnet diversity.", icon: "Link2" },
      { title: "Lost Backlink Alerts", desc: "Get notified immediately when high-DA referring domains remove links to your pages.", icon: "ShieldAlert" },
      { title: "Toxic Link Identification", desc: "Flag spammy anchor patterns and link farm networks that could trigger algorithmic penalties.", icon: "ShieldCheck" },
      { title: "Anchor Text Breakdown", desc: "Audit branded, exact-match, and partial-match anchor text ratios.", icon: "BarChart3" },
    ],
    comparison: {
      title: "Backlink Analysis Capabilities",
      rows: [
        { feature: "Lost Link Detection", topseotool: "Automated daily drop alerts", legacy: "Manual checks or delayed notice" },
        { feature: "Toxic Risk Scoring", topseotool: "Integrated spam score analysis", legacy: "Requires separate audit module" },
        { feature: "Link Velocity", topseotool: "Historical net new vs lost trends", legacy: "Static total counts only" },
      ],
    },
    faqs: [
      {
        question: "How does the backlink checker find lost links?",
        answer: "Our background worker verifies known backlink URLs on a scheduled cycle. If the target link is missing from the source page or returns 404, an alert is dispatched.",
      },
      {
        question: "What is Domain Authority (DA)?",
        answer: "Domain Authority is a proprietary 0-100 metric calculated from the quantity and quality of unique referring domains linking to a website.",
      },
    ],
    breadcrumbs: [
      { name: "Home", item: "/" },
      { name: "Backlink Checker", item: "/backlink-checker" },
    ],
  },

  "content-optimizer": {
    slug: "content-optimizer",
    path: "/content-optimizer",
    title: "AI Content Optimizer & NLP SEO Writing Assistant",
    h1: "Real-Time NLP Content Optimizer & AEO Assistant",
    subheadline:
      "Write content that ranks #1 on Google and gets cited by ChatGPT, Claude, and Perplexity. Real-time readability and topical keyword coverage scoring.",
    metaDescription:
      "Optimize articles with real-time NLP content scoring. Discover semantically related entities, readability grade, FAQ schema validation, and llms.txt integration.",
    heroBadge: "Content Excellence",
    metrics: [
      { value: "NLP Score", label: "Real-Time Content Grade", trend: "0-100 Benchmark" },
      { value: "Semantic", label: "Topical Keyword Coverage", trend: "Correlated Terms" },
      { value: "llms.txt", label: "AI Crawler Standards", trend: "Instant Generator" },
      { value: "Readability", label: "FK Grade Level Checks", trend: "User Experience" },
    ],
    features: [
      { title: "Real-Time Content Scoring", desc: "Live 0-100 grade based on topical breadth, heading hierarchy, and entity mentions.", icon: "Sparkles" },
      { title: "Topical Coverage Matrix", desc: "Identifies essential secondary entities used by top-ranking competitors on Page 1.", icon: "Search" },
      { title: "AEO Citation Readiness", desc: "Formats definitions and FAQ answers to maximize citation probability inside LLMs.", icon: "Brain" },
      { title: "Schema Generator", desc: "Generates validated JSON-LD FAQ, HowTo, and Article markup in one click.", icon: "Code2" },
    ],
    comparison: {
      title: "Content Optimization Comparison",
      rows: [
        { feature: "Dual Optimization (SEO + AEO)", topseotool: "Optimizes for Google & AI Assistants", legacy: "Google 10 blue links only" },
        { feature: "llms.txt Integration", topseotool: "Built-in standard support", legacy: "No AI crawler features" },
        { feature: "Real-Time Writing Assistant", topseotool: "Live suggestions while you type", legacy: "Requires third-party plugin" },
      ],
    },
    faqs: [
      {
        question: "How does the NLP content score work?",
        answer: "The scoring engine analyzes the top 20 pages ranking for your target keyword, extracts essential semantic entities and question patterns, and scores your draft against these benchmarks.",
      },
      {
        question: "What is AEO (AI Engine Optimization)?",
        answer: "AEO is the practice of optimizing content so that AI search engines (like ChatGPT Search and Perplexity) select your site as a direct citation source.",
      },
    ],
    breadcrumbs: [
      { name: "Home", item: "/" },
      { name: "Content Optimizer", item: "/content-optimizer" },
    ],
  },

  "serp-analyzer": {
    slug: "serp-analyzer",
    path: "/serp-analyzer",
    title: "SERP Analyzer — Deep Page 1 Search Results Forensics",
    h1: "Deep Page 1 SERP Forensics & Correlation Analyzer",
    subheadline:
      "Dissect the top 100 search results for any query. Uncover the exact correlation factors separating #1 from #10.",
    metaDescription:
      "SERP analyzer tool. Inspect Page 1 search results, correlate word counts, backlink counts, page speed, and schema features across top-ranking competitors.",
    heroBadge: "SERP Correlation",
    metrics: [
      { value: "Top 100", label: "Results Analyzed per Query", trend: "Full SERP" },
      { value: "40+", label: "Correlation Factors Checked", trend: "On-Page & Off-Page" },
      { value: "Features", label: "SERP Blocks Categorized", trend: "Snippets, PAA, Video" },
      { value: "Intent", label: "Dominant Search Intent", trend: "Classified" },
    ],
    features: [
      { title: "Page 1 Factor Correlation", desc: "Analyze word counts, heading counts, image counts, and load times of the top 10 results.", icon: "BarChart3" },
      { title: "SERP Feature Breakdown", desc: "See which SERP features (Featured Snippets, PAA, Local 3-Pack, Sitelinks) dominate the query.", icon: "Globe" },
      { title: "Search Intent Profile", desc: "Determine whether searchers want software, guides, product lists, or local service providers.", icon: "Search" },
      { title: "Volatility Radar", desc: "Track ranking fluctuations and algorithm update disruptions in real time.", icon: "TrendingUp" },
    ],
    comparison: {
      title: "SERP Analyzer Capabilities",
      rows: [
        { feature: "Depth of Analysis", topseotool: "Top 100 results with correlation matrix", legacy: "Top 10 results only" },
        { feature: "AI Answer Detection", topseotool: "Detects AI Overview answer boxes", legacy: "Traditional snippets only" },
        { feature: "Speed", topseotool: "Sub-second parallel headless queries", legacy: "30-60 second wait times" },
      ],
    },
    faqs: [
      {
        question: "What does the SERP analyzer show me?",
        answer: "It displays a full breakdown of the top ranking pages for your keyword, including word count, domain authority, backlink counts, schema markup usage, and page speed.",
      },
      {
        question: "How can I use this to rank higher?",
        answer: "By seeing the average word count, backlink threshold, and content structure of current Page 1 winners, you can tailor your page to exceed the minimum ranking requirements.",
      },
    ],
    breadcrumbs: [
      { name: "Home", item: "/" },
      { name: "SERP Analyzer", item: "/serp-analyzer" },
    ],
  },
}

export function getProgrammaticPage(slug: string): ProgrammaticPageData | undefined {
  return PROGRAMMATIC_PAGES[slug]
}

export function getAllProgrammaticPages(): ProgrammaticPageData[] {
  return Object.values(PROGRAMMATIC_PAGES)
}
