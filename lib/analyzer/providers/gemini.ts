import { GoogleGenAI } from "@google/genai"
import type { ProviderAdapter, ProviderCheckRequest, ProviderEvidence } from "./types"

const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash"

let client: GoogleGenAI | null = null

function getClient(): GoogleGenAI | null {
  const rawKey = process.env.GEMINI_API_KEY?.trim().replace(/^["']|["']$/g, "")
  if (!rawKey || rawKey.length < 10) return null
  if (!client) {
    client = new GoogleGenAI({ apiKey: rawKey })
  }
  return client
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "")

export const geminiAdapter: ProviderAdapter = {
  id: "gemini",
  name: "Google Gemini 2.0 (Search Grounding)",

  isConfigured(): boolean {
    const rawKey = process.env.GEMINI_API_KEY?.trim().replace(/^["']|["']$/g, "")
    return Boolean(rawKey && rawKey.length > 10 && rawKey !== '""' && rawKey !== "''")
  },

  async runCheck(req: ProviderCheckRequest): Promise<ProviderEvidence> {
    const now = new Date().toISOString()
    const base: ProviderEvidence = {
      providerId: "gemini",
      providerName: "Google Gemini 2.0",
      model: MODEL,
      status: "not_configured",
      timestamp: now,
      query: req.query,
      mentioned: false,
      domainCited: false,
      citationUrls: [],
      sentiment: "n/a",
      position: null,
      brandsNamed: [],
      limitationNotice: "Google Search Grounded results reflect Gemini API response at query time; end-user chat results may vary by region and user session context.",
    }

    if (!this.isConfigured()) {
      return {
        ...base,
        status: "not_configured",
        error: "GEMINI_API_KEY environment variable is not configured.",
      }
    }

    const ai = getClient()
    if (!ai) {
      return {
        ...base,
        status: "not_configured",
        error: "Failed to initialize Gemini client.",
      }
    }

    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 25000)

      const prompt = `You are a helpful AI assistant answering a user question using Google Search grounding.
Search the web for current, factual information and provide an objective answer under 200 words.
If the question asks for products, services, or companies, name specific actual brands and providers.

User question: "${req.query}"`

      const res = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          temperature: 0.5,
          tools: [{ googleSearch: {} }],
          thinkingConfig: { thinkingBudget: 0 },
        },
      })
      clearTimeout(timer)

      const answerText = res.text ?? ""
      const meta = res.candidates?.[0]?.groundingMetadata
      const citationUrls: string[] = (meta?.groundingChunks ?? [])
        .map((c) => c.web?.uri ?? "")
        .filter((uri) => uri && uri.startsWith("http"))

      const normBrand = norm(req.brand)
      const normDomain = norm(req.domain)
      const lower = answerText.toLowerCase()

      // Brand mention detection
      const brandWords = req.brand.trim().toLowerCase().split(/\s+/)
      const brandMentioned =
        (normBrand.length >= 3 && norm(lower).includes(normBrand)) ||
        lower.includes(req.brand.toLowerCase()) ||
        lower.includes(req.domain.toLowerCase()) ||
        (brandWords.length > 1 && brandWords.every((w) => lower.includes(w)))

      // Citation detection: check if domain is among grounding chunk URLs
      const domainCited = citationUrls.some((u) => {
        try {
          const host = new URL(u).hostname.toLowerCase()
          return host === req.domain.toLowerCase() || host.endsWith(`.${req.domain.toLowerCase()}`)
        } catch {
          return false
        }
      })

      // Extract verbatim excerpt mentioning brand
      let snippet: string | undefined
      if (brandMentioned) {
        const sentences = answerText.split(/(?<=[.?!])\s+/)
        const relevant = sentences.find(
          (s) =>
            s.toLowerCase().includes(req.brand.toLowerCase()) ||
            s.toLowerCase().includes(req.domain.toLowerCase())
        )
        snippet = relevant ? relevant.trim().slice(0, 300) : answerText.slice(0, 200).trim()
      }

      // Sentiment inference
      let sentiment: ProviderEvidence["sentiment"] = "n/a"
      if (brandMentioned) {
        if (/lead|top|best|popular|recommend|reliable|premier|excellent|strong/i.test(snippet || answerText)) {
          sentiment = "positive"
        } else if (/slow|outdated|issue|problem|negative|poor|expensive/i.test(snippet || answerText)) {
          sentiment = "negative"
        } else {
          sentiment = "neutral"
        }
      }

      return {
        ...base,
        status: "completed",
        rawAnswer: answerText,
        snippet,
        mentioned: brandMentioned,
        domainCited,
        citationUrls: [...new Set(citationUrls)].slice(0, 10),
        sentiment,
        position: brandMentioned ? 1 : null,
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      const isRateLimit = /429|quota|RESOURCE_EXHAUSTED/i.test(msg)
      return {
        ...base,
        status: isRateLimit ? "rate_limited" : "failed",
        error: isRateLimit
          ? "Gemini search grounding rate limit reached (429)."
          : `Gemini execution failed: ${msg.slice(0, 150)}`,
      }
    }
  },
}
