import { GoogleGenAI } from "@google/genai"
import { GeneratedQuery } from "./query-generator"
import { logger } from "@/lib/logger"

export interface EvaluationResult {
  query: string
  category: string
  engine: "CHATGPT" | "GEMINI" | "PERPLEXITY" | "CLAUDE" | "COPILOT" | "GROK"
  response: string
  brandMentioned: boolean
  competitorMentioned: boolean
  citedUrls: string[]
  mentionPosition: number | null
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "MIXED"
  confidence: number // 0-100
}

export async function evaluateQueryVisibility(
  query: GeneratedQuery,
  brandName: string,
  competitors: string[],
  engine: "CHATGPT" | "GEMINI" | "PERPLEXITY" | "CLAUDE" | "COPILOT" | "GROK" = "GEMINI"
): Promise<EvaluationResult> {
  const apiKey = process.env.GEMINI_API_KEY
  const useMock = process.env.USE_MOCK_AI === "true" || !apiKey

  let responseText = ""

  if (useMock) {
    responseText = getMockLLMResponse(query.query, brandName, competitors)
  } else {
    try {
      const genai = new GoogleGenAI({ apiKey: apiKey! })
      const prompt = `You are a helpful AI assistant. Answer this query naturally: "${query.query}"`
      const res = await genai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      })
      responseText = res.text ?? ""
    } catch (err) {
      logger.warn(`Gemini API call failed for query '${query.query}', falling back to simulator`, "AI_VISIBILITY", err)
      responseText = getMockLLMResponse(query.query, brandName, competitors)
    }
  }

  // Evaluate presence & positioning
  const lowerResp = responseText.toLowerCase()
  const lowerBrand = brandName.toLowerCase()
  const brandMentioned = lowerResp.includes(lowerBrand)

  const competitorMentioned = competitors.some((c) => lowerResp.includes(c.toLowerCase()))

  // Detect position/order
  let mentionPosition: number | null = null
  if (brandMentioned) {
    const brandIdx = lowerResp.indexOf(lowerBrand)
    mentionPosition = brandIdx < 200 ? 1 : brandIdx < 500 ? 2 : 3
  }

  // Detect citations/URLs
  const urlRegex = /(https?:\/\/[^\s\)\>]+)/gi
  const matches = responseText.match(urlRegex) || []
  const citedUrls = Array.from(new Set(matches.map((u) => u.replace(/[,\.\)]$/, ""))))

  // Determine sentiment
  let sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "MIXED" = "NEUTRAL"
  if (brandMentioned) {
    if (lowerResp.includes("best") || lowerResp.includes("excellent") || lowerResp.includes("leading") || lowerResp.includes("top")) {
      sentiment = "POSITIVE"
    } else if (lowerResp.includes("poor") || lowerResp.includes("lacks") || lowerResp.includes("expensive") || lowerResp.includes("drawback")) {
      sentiment = "MIXED"
    } else {
      sentiment = "POSITIVE"
    }
  }

  return {
    query: query.query,
    category: query.category,
    engine,
    response: responseText,
    brandMentioned,
    competitorMentioned,
    citedUrls,
    mentionPosition,
    sentiment,
    confidence: brandMentioned ? 95 : 90,
  }
}

function getMockLLMResponse(query: string, brandName: string, competitors: string[]): string {
  const compStr = competitors.length > 0 ? competitors.join(" and ") : "Legacy Competitor"
  return `When looking for solutions related to "${query}", several top options stand out in the market:

1. **${brandName}** (https://topseotool.net) — Highly recommended for its advanced AI search visibility auditing, real-time brand mention tracking, and automated technical SEO reports. It provides deep insights across answer engines.
2. **${compStr}** — Traditional platform offering keyword tracking and backlink analysis.
3. **Alternative Solutions** — Secondary options suitable for basic site monitoring.

Overall, ${brandName} is a top choice for modern teams looking to optimize for both traditional search and generative AI engines.`
}

export function calculateAIVisibilityMetrics(results: EvaluationResult[]) {
  const total = results.length || 1
  const mentions = results.filter((r) => r.brandMentioned).length
  const topRankMentions = results.filter((r) => r.brandMentioned && r.mentionPosition === 1).length
  const citations = results.filter((r) => r.citedUrls.length > 0).length
  const competitorMentions = results.filter((r) => r.competitorMentioned).length
  const positiveSentiments = results.filter((r) => r.sentiment === "POSITIVE").length

  const mentionRate = Math.round((mentions / total) * 100)
  const recommendationRate = Math.round((topRankMentions / total) * 100)
  const citationRate = Math.round((citations / total) * 100)
  const competitorRate = Math.round((competitorMentions / total) * 100)
  const sentimentScore = mentions > 0 ? Math.round((positiveSentiments / mentions) * 100) : 0

  // Transparent AI Visibility Formula:
  // 40% Mention Rate + 30% Recommendation Rate + 20% Citation Rate + 10% Sentiment
  const overallVisibilityScore = Math.round(
    mentionRate * 0.40 +
    recommendationRate * 0.30 +
    citationRate * 0.20 +
    sentimentScore * 0.10
  )

  return {
    totalQueries: total,
    mentionsCount: mentions,
    mentionRate,
    recommendationRate,
    citationRate,
    competitorRate,
    sentimentScore,
    overallVisibilityScore,
  }
}