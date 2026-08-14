import { FetchResult } from "./fetcher"

export interface AnalysisIssue {
  category: "TECHNICAL" | "CONTENT" | "PERFORMANCE" | "LINKS" | "MOBILE" | "SECURITY" | "STRUCTURED_DATA"
  severity: "CRITICAL" | "WARNING" | "INFO" | "PASSED"
  title: string
  explanation: string
  affectedUrl: string
  recommendation: string
}

export interface AnalysisResult {
  url: string
  overallScore: number
  categoryScores: {
    technical: number
    onPage: number
    content: number
    structuredData: number
    performance: number
  }
  summary: {
    totalChecks: number
    passedCount: number
    warningCount: number
    criticalCount: number
    responseTimeMs: number
    pageSizeKb: number
    wordCount: number
    title: string | null
    description: string | null
    h1Count: number
    h2Count: number
    imagesCount: number
    imagesMissingAlt: number
    internalLinks: number
    externalLinks: number
    schemaTypes: string[]
  }
  issues: AnalysisIssue[]
}

export function analyzeWebsite(fetchResult: FetchResult): AnalysisResult {
  const { url, finalUrl, statusCode, html, responseTimeMs, contentLengthBytes, isHttps } = fetchResult
  const issues: AnalysisIssue[] = []

  // Clean HTML text extraction
  const cleanHtml = html.replace(/<script\b[^<]*>[\s\S]*?<\/script>/gi, "").replace(/<style\b[^<]*>[\s\S]*?<\/style>/gi, "")

  // 1. TECHNICAL & SECURITY CHECKS
  let technicalScore = 100

  // HTTPS check
  if (!isHttps) {
    technicalScore -= 25
    issues.push({
      category: "SECURITY",
      severity: "CRITICAL",
      title: "Website is not using HTTPS",
      explanation: "HTTPS is a confirmed Google ranking factor and essential for web security and user trust.",
      affectedUrl: url,
      recommendation: "Install an SSL/TLS certificate and redirect all HTTP traffic to HTTPS.",
    })
  } else {
    issues.push({
      category: "SECURITY",
      severity: "PASSED",
      title: "HTTPS Security Enabled",
      explanation: "Website uses secure HTTPS encryption.",
      affectedUrl: url,
      recommendation: "No action required.",
    })
  }

  // HTTP Status Code
  if (statusCode !== 200) {
    technicalScore -= 30
    issues.push({
      category: "TECHNICAL",
      severity: "CRITICAL",
      title: `Server returned HTTP status code ${statusCode}`,
      explanation: `Pages should return a 200 OK status. Returned status ${statusCode} may prevent indexation.`,
      affectedUrl: url,
      recommendation: "Investigate server configuration or redirects to ensure standard 200 OK status.",
    })
  } else {
    issues.push({
      category: "TECHNICAL",
      severity: "PASSED",
      title: "HTTP Status Code 200 OK",
      explanation: "Server responded with a valid 200 OK status.",
      affectedUrl: url,
      recommendation: "No action required.",
    })
  }

  // Mobile Viewport tag
  const viewportMatch = /<meta\s+name=["']viewport["'][^>]*>/i.test(html)
  if (!viewportMatch) {
    technicalScore -= 20
    issues.push({
      category: "MOBILE",
      severity: "CRITICAL",
      title: "Missing mobile viewport meta tag",
      explanation: "Without a viewport meta tag, mobile browsers will render the page at desktop width.",
      affectedUrl: url,
      recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> to your <head>.',
    })
  } else {
    issues.push({
      category: "MOBILE",
      severity: "PASSED",
      title: "Mobile Viewport Configured",
      explanation: "Page includes proper mobile viewport tag for responsive rendering.",
      affectedUrl: url,
      recommendation: "No action required.",
    })
  }

  // Canonical tag
  const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)
  const canonicalUrl = canonicalMatch ? canonicalMatch[1] : null

  if (!canonicalUrl) {
    technicalScore -= 15
    issues.push({
      category: "TECHNICAL",
      severity: "WARNING",
      title: "Missing canonical URL tag",
      explanation: "Canonical tags prevent duplicate content issues by telling search engines the primary URL version.",
      affectedUrl: url,
      recommendation: `Add <link rel="canonical" href="${finalUrl}" /> to your <head>.`,
    })
  } else {
    issues.push({
      category: "TECHNICAL",
      severity: "PASSED",
      title: "Canonical URL Tag Present",
      explanation: `Canonical tag specifies: ${canonicalUrl}`,
      affectedUrl: url,
      recommendation: "No action required.",
    })
  }

  // Meta Robots / Indexability
  const metaRobotsMatch = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i)
  const metaRobots = metaRobotsMatch ? metaRobotsMatch[1] : ""
  if (metaRobots.toLowerCase().includes("noindex")) {
    technicalScore -= 40
    issues.push({
      category: "TECHNICAL",
      severity: "CRITICAL",
      title: "Page contains noindex directive",
      explanation: "The meta robots tag includes 'noindex', preventing search engines from indexing this page.",
      affectedUrl: url,
      recommendation: "Remove 'noindex' from the robots meta tag if this page should be searchable.",
    })
  }

  // 2. ON-PAGE SEO CHECKS
  let onPageScore = 100

  // Title tag
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)
  const titleText = titleMatch ? titleMatch[1].trim() : null

  if (!titleText) {
    onPageScore -= 30
    issues.push({
      category: "CONTENT",
      severity: "CRITICAL",
      title: "Missing <title> tag",
      explanation: "The title tag is one of the most important on-page SEO signals for search rankings.",
      affectedUrl: url,
      recommendation: "Add a unique, descriptive <title> tag between 50-60 characters.",
    })
  } else if (titleText.length < 30 || titleText.length > 65) {
    onPageScore -= 10
    issues.push({
      category: "CONTENT",
      severity: "WARNING",
      title: `Title tag length is sub-optimal (${titleText.length} chars)`,
      explanation: "Optimal title tags are between 50 and 60 characters to avoid truncation in search result snippets.",
      affectedUrl: url,
      recommendation: `Refine title '${titleText.slice(0, 30)}...' to be between 50 and 60 characters.`,
    })
  } else {
    issues.push({
      category: "CONTENT",
      severity: "PASSED",
      title: "Title Tag Properly Configured",
      explanation: `Title length (${titleText.length} chars): "${titleText}"`,
      affectedUrl: url,
      recommendation: "No action required.",
    })
  }

  // Meta description
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
  const descText = descMatch ? descMatch[1].trim() : null

  if (!descText) {
    onPageScore -= 25
    issues.push({
      category: "CONTENT",
      severity: "CRITICAL",
      title: "Missing meta description",
      explanation: "Meta descriptions summarize page content for searchers and directly impact click-through rates.",
      affectedUrl: url,
      recommendation: "Add a compelling meta description tag between 120 and 160 characters.",
    })
  } else if (descText.length < 70 || descText.length > 165) {
    onPageScore -= 10
    issues.push({
      category: "CONTENT",
      severity: "WARNING",
      title: `Meta description length sub-optimal (${descText.length} chars)`,
      explanation: "Ideal meta descriptions are between 120 and 160 characters for complete display in SERPs.",
      affectedUrl: url,
      recommendation: "Adjust meta description length to be between 120 and 160 characters.",
    })
  } else {
    issues.push({
      category: "CONTENT",
      severity: "PASSED",
      title: "Meta Description Present",
      explanation: `Description length (${descText.length} chars).`,
      affectedUrl: url,
      recommendation: "No action required.",
    })
  }

  // Heading tags H1 & H2
  const h1Matches = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi) || []
  const h2Matches = html.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi) || []

  if (h1Matches.length === 0) {
    onPageScore -= 20
    issues.push({
      category: "CONTENT",
      severity: "CRITICAL",
      title: "Missing H1 heading",
      explanation: "H1 headings define the main topic of the page for search engines and readers.",
      affectedUrl: url,
      recommendation: "Add exactly one descriptive <h1> heading near the top of the page content.",
    })
  } else if (h1Matches.length > 1) {
    onPageScore -= 10
    issues.push({
      category: "CONTENT",
      severity: "WARNING",
      title: `Multiple H1 headings found (${h1Matches.length})`,
      explanation: "Best practice is to use a single <h1> heading per page for clean structural hierarchy.",
      affectedUrl: url,
      recommendation: "Consolidate into a single <h1> heading and convert secondary headings to <h2>.",
    })
  } else {
    issues.push({
      category: "CONTENT",
      severity: "PASSED",
      title: "Single H1 Heading Present",
      explanation: "Page contains a single <h1> heading tag.",
      affectedUrl: url,
      recommendation: "No action required.",
    })
  }

  // Open Graph & Social Cards
  const ogTitle = /<meta\s+property=["']og:title["'][^>]*>/i.test(html)
  const ogDesc = /<meta\s+property=["']og:description["'][^>]*>/i.test(html)
  const ogImage = /<meta\s+property=["']og:image["'][^>]*>/i.test(html)

  if (!ogTitle || !ogDesc || !ogImage) {
    onPageScore -= 10
    issues.push({
      category: "CONTENT",
      severity: "WARNING",
      title: "Incomplete Open Graph meta tags",
      explanation: "Open Graph tags control how your page looks when shared on social media and Slack.",
      affectedUrl: url,
      recommendation: "Add og:title, og:description, and og:image tags to your head section.",
    })
  } else {
    issues.push({
      category: "CONTENT",
      severity: "PASSED",
      title: "Open Graph Tags Present",
      explanation: "og:title, og:description, and og:image are configured.",
      affectedUrl: url,
      recommendation: "No action required.",
    })
  }

  // Images & Alt attributes
  const imgTags = html.match(/<img\b[^>]*>/gi) || []
  let imagesMissingAlt = 0
  imgTags.forEach((img) => {
    if (!/alt=["']([^"']+)["']/i.test(img)) {
      imagesMissingAlt++
    }
  })

  if (imgTags.length > 0 && imagesMissingAlt > 0) {
    onPageScore -= Math.min(imagesMissingAlt * 3, 15)
    issues.push({
      category: "CONTENT",
      severity: "WARNING",
      title: `${imagesMissingAlt} image(s) missing alt text`,
      explanation: "Alt text provides accessibility for screen readers and signals context to image search engines.",
      affectedUrl: url,
      recommendation: "Add descriptive alt attributes to all meaningful <img> elements.",
    })
  }

  // Links: Internal & External
  const linkMatches = html.match(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi) || []
  let internalLinks = 0
  let externalLinks = 0

  linkMatches.forEach((link) => {
    const hrefMatch = link.match(/href=["']([^"']+)["']/i)
    if (hrefMatch) {
      const href = hrefMatch[1]
      if (href.startsWith("http://") || href.startsWith("https://")) {
        if (href.includes(finalUrl.replace(/https?:\/\//, ""))) {
          internalLinks++
        } else {
          externalLinks++
        }
      } else if (href.startsWith("/") || !href.includes(":")) {
        internalLinks++
      }
    }
  })

  // 3. CONTENT QUALITY & WORD COUNT
  let contentScore = 100
  const plainText = cleanHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
  const wordCount = plainText.split(/\s+/).filter(Boolean).length

  if (wordCount < 300) {
    contentScore -= 30
    issues.push({
      category: "CONTENT",
      severity: "CRITICAL",
      title: `Thin content detected (${wordCount} words)`,
      explanation: "Search engines favor comprehensive, in-depth content. Pages under 300 words often struggle to rank.",
      affectedUrl: url,
      recommendation: "Expand page content to at least 500-1000 words providing thorough information.",
    })
  } else {
    issues.push({
      category: "CONTENT",
      severity: "PASSED",
      title: `Substantial Word Count (${wordCount} words)`,
      explanation: `Page content length is adequate for indexing (${wordCount} words).`,
      affectedUrl: url,
      recommendation: "No action required.",
    })
  }

  // 4. STRUCTURED DATA & SCHEMA.ORG
  let structuredDataScore = 100
  const schemaTypes: string[] = []

  const jsonLdMatches = html.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || []

  jsonLdMatches.forEach((script) => {
    const contentMatch = script.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i)
    if (contentMatch) {
      try {
        const json = JSON.parse(contentMatch[1])
        const extractType = (obj: any) => {
          if (obj?.["@type"]) {
            if (Array.isArray(obj["@type"])) schemaTypes.push(...obj["@type"])
            else schemaTypes.push(String(obj["@type"]))
          }
        }
        if (Array.isArray(json)) json.forEach(extractType)
        else extractType(json)
      } catch {
        // Invalid JSON-LD syntax
      }
    }
  })

  const uniqueSchemas = Array.from(new Set(schemaTypes))

  if (uniqueSchemas.length === 0) {
    structuredDataScore -= 40
    issues.push({
      category: "STRUCTURED_DATA",
      severity: "WARNING",
      title: "No Schema.org / JSON-LD structured data detected",
      explanation: "Structured data is critical for Answer Engine Optimization (AEO), rich snippets, and AI citations.",
      affectedUrl: url,
      recommendation: "Implement JSON-LD structured data (e.g. Organization, Product, FAQPage, or Article).",
    })
  } else {
    issues.push({
      category: "STRUCTURED_DATA",
      severity: "PASSED",
      title: `Structured Data Present (${uniqueSchemas.join(", ")})`,
      explanation: `Detected Schema.org types: ${uniqueSchemas.join(", ")}`,
      affectedUrl: url,
      recommendation: "No action required.",
    })
  }

  // 5. PERFORMANCE SIGNALS
  let performanceScore = 100
  const pageSizeKb = Math.round(contentLengthBytes / 1024)

  if (responseTimeMs > 2000) {
    performanceScore -= 30
    issues.push({
      category: "PERFORMANCE",
      severity: "CRITICAL",
      title: `Slow server response time (${responseTimeMs}ms)`,
      explanation: "Server response time exceeds recommended 2000ms threshold, degrading Core Web Vitals.",
      affectedUrl: url,
      recommendation: "Optimize server backend, enable HTTP caching, or deploy behind a CDN.",
    })
  } else if (responseTimeMs > 800) {
    performanceScore -= 15
    issues.push({
      category: "PERFORMANCE",
      severity: "WARNING",
      title: `Moderate server latency (${responseTimeMs}ms)`,
      explanation: "Server response time is acceptable but could be improved for optimal mobile performance.",
      affectedUrl: url,
      recommendation: "Consider server caching and optimizing database queries.",
    })
  } else {
    issues.push({
      category: "PERFORMANCE",
      severity: "PASSED",
      title: `Fast Response Time (${responseTimeMs}ms)`,
      explanation: "Server responded quickly.",
      affectedUrl: url,
      recommendation: "No action required.",
    })
  }

  if (pageSizeKb > 1500) {
    performanceScore -= 15
    issues.push({
      category: "PERFORMANCE",
      severity: "WARNING",
      title: `Large HTML payload size (${pageSizeKb}KB)`,
      explanation: "Page payload exceeds 1.5MB, which slows down initial page download on mobile networks.",
      affectedUrl: url,
      recommendation: "Enable GZIP/Brotli compression and remove inline code.",
    })
  }

  // Clamp category scores 0-100
  const tScore = Math.max(0, Math.min(100, technicalScore))
  const oScore = Math.max(0, Math.min(100, onPageScore))
  const cScore = Math.max(0, Math.min(100, contentScore))
  const sScore = Math.max(0, Math.min(100, structuredDataScore))
  const pScore = Math.max(0, Math.min(100, performanceScore))

  // Calculate weighted overall score
  const overallScore = Math.round(
    tScore * 0.30 +
    oScore * 0.30 +
    cScore * 0.20 +
    sScore * 0.10 +
    pScore * 0.10
  )

  const criticalCount = issues.filter((i) => i.severity === "CRITICAL").length
  const warningCount = issues.filter((i) => i.severity === "WARNING").length
  const passedCount = issues.filter((i) => i.severity === "PASSED").length

  return {
    url: finalUrl,
    overallScore,
    categoryScores: {
      technical: tScore,
      onPage: oScore,
      content: cScore,
      structuredData: sScore,
      performance: pScore,
    },
    summary: {
      totalChecks: issues.length,
      passedCount,
      warningCount,
      criticalCount,
      responseTimeMs,
      pageSizeKb,
      wordCount,
      title: titleText,
      description: descText,
      h1Count: h1Matches.length,
      h2Count: h2Matches.length,
      imagesCount: imgTags.length,
      imagesMissingAlt,
      internalLinks,
      externalLinks,
      schemaTypes: uniqueSchemas,
    },
    issues,
  }
}