import { GoogleGenAI } from "@google/genai"
import { logger } from "@/lib/logger"

export interface GeneratedQuery {
  query: string
  category:
    | "INFORMATIONAL"
    | "COMMERCIAL"
    | "TRANSACTIONAL"
    | "COMPARISON"
    | "BEST_OF"
    | "PROBLEM_SOLVING"
    | "BRAND_SPECIFIC"
    | "LOCAL_INTENT"
}

// ─────────────────────────────────────────────────────────────────────────────
// AI-powered query generation — uses Gemini to produce niche-specific queries
// ─────────────────────────────────────────────────────────────────────────────
export async function generateQueriesFromWebsite(
  websiteUrl: string,
  brandName: string,
  competitors: string[] = [],
  pageContext?: { title?: string; description?: string; keywords?: string }
): Promise<GeneratedQuery[]> {
  const apiKey = process.env.GEMINI_API_KEY
  const useMock = process.env.USE_MOCK_AI === "true" || !apiKey

  if (!useMock && apiKey) {
    try {
      const genai = new GoogleGenAI({ apiKey })
      const contextStr = pageContext
        ? `Page title: "${pageContext.title ?? "N/A"}", Meta description: "${pageContext.description ?? "N/A"}", Keywords: "${pageContext.keywords ?? "N/A"}"`
        : `Website URL: ${websiteUrl}`

      const prompt = `You are an expert at generating AI search queries to test brand visibility.

Website: ${websiteUrl}
Brand: ${brandName}
${contextStr}
Competitors: ${competitors.length > 0 ? competitors.join(", ") : "none specified"}

Generate exactly 10 realistic search queries that real users would type into AI assistants like ChatGPT, Gemini, or Perplexity when looking for products/services in this exact niche/industry.

The queries should:
1. Be natural conversational questions (not SEO keywords)
2. Cover: best-of lists, comparisons, problem-solving, informational, commercial intent
3. Be specific to the industry/niche of this website
4. Include 1-2 queries that compare "${brandName}" to competitors

Return ONLY a JSON array of objects in this exact format (no markdown, no explanation):
[{"query":"...", "category":"BEST_OF|COMMERCIAL|TRANSACTIONAL|COMPARISON|PROBLEM_SOLVING|INFORMATIONAL|BRAND_SPECIFIC|LOCAL_INTENT"}, ...]`

      const res = await genai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
        },
      })

      const rawText = res.text ?? "[]"
      const parsed = JSON.parse(rawText) as GeneratedQuery[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        logger.info(`Generated ${parsed.length} AI-powered queries for ${websiteUrl}`, "QUERY_GENERATOR")
        return parsed
      }
    } catch (err) {
      logger.warn("Gemini query generation failed, falling back to template queries", "QUERY_GENERATOR", err)
    }
  }

  // Fallback: template-based queries
  return generateCommercialQueries(brandName, "Software & Technology", "United States", competitors)
}

// ─────────────────────────────────────────────────────────────────────────────
// Template-based query generation — rich, multi-category set
// ─────────────────────────────────────────────────────────────────────────────
export function generateCommercialQueries(
  brandName: string,
  industry: string,
  country = "United States",
  competitors: string[] = []
): GeneratedQuery[] {
  const comp1 = competitors[0] || "leading competitors"
  const comp2 = competitors[1] || "alternative platforms"

  return [
    {
      category: "BEST_OF",
      query: `What are the best ${industry} tools and platforms for businesses in ${country} in 2025?`,
    },
    {
      category: "BEST_OF",
      query: `Top 10 recommended ${industry} solutions that professionals actually use`,
    },
    {
      category: "COMMERCIAL",
      query: `Which ${industry} platform should I use for my growing team?`,
    },
    {
      category: "COMMERCIAL",
      query: `Best ${industry} software with the most features and value for money`,
    },
    {
      category: "TRANSACTIONAL",
      query: `What is the top-rated ${industry} tool to buy in 2025?`,
    },
    {
      category: "COMPARISON",
      query: `How does ${brandName} compare to ${comp1} and ${comp2}?`,
    },
    {
      category: "COMPARISON",
      query: `${brandName} vs ${comp1}: which one is better for professionals?`,
    },
    {
      category: "PROBLEM_SOLVING",
      query: `How can I automate my ${industry} workflows more efficiently?`,
    },
    {
      category: "PROBLEM_SOLVING",
      query: `What tools help with ${industry} challenges for small businesses?`,
    },
    {
      category: "INFORMATIONAL",
      query: `What features should I look for when choosing a ${industry} solution?`,
    },
    {
      category: "BRAND_SPECIFIC",
      query: `What are the pros, cons, reviews, and reputation of ${brandName}?`,
    },
    {
      category: "LOCAL_INTENT",
      query: `Leading ${industry} services and software providers in ${country} for 2025`,
    },
  ]
}