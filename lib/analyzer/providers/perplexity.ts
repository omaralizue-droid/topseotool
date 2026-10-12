import type { ProviderAdapter, ProviderCheckRequest, ProviderEvidence } from "./types"

const MODEL = process.env.PERPLEXITY_MODEL || "sonar"
const API_URL = "https://api.perplexity.ai/chat/completions"

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "")

export const perplexityAdapter: ProviderAdapter = {
  id: "perplexity",
  name: "Perplexity AI (Sonar)",

  isConfigured(): boolean {
    const rawKey = process.env.PERPLEXITY_API_KEY?.trim()
    return Boolean(rawKey && rawKey.length > 10 && rawKey !== '""' && rawKey !== "''")
  },

  async runCheck(req: ProviderCheckRequest): Promise<ProviderEvidence> {
    const now = new Date().toISOString()
    const base: ProviderEvidence = {
      providerId: "perplexity",
      providerName: "Perplexity AI",
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
      limitationNotice: "Perplexity Sonar results represent live search-grounded citations from Perplexity API. End-user responses in Pro search may differ.",
    }

    if (!this.isConfigured()) {
      return {
        ...base,
        status: "not_configured",
        error: "PERPLEXITY_API_KEY environment variable is not configured.",
      }
    }

    const apiKey = process.env.PERPLEXITY_API_KEY!.trim().replace(/^["']|["']$/g, "")

    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 25000)

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: "system",
              content: "You are an objective search assistant. Provide factual answers with specific brand and platform recommendations when asked. Keep answers under 200 words.",
            },
            {
              role: "user",
              content: req.query,
            },
          ],
          temperature: 0.2,
        }),
      })

      clearTimeout(timer)

      if (res.status === 429) {
        return {
          ...base,
          status: "rate_limited",
          error: "Perplexity API rate limit exceeded (429).",
        }
      }

      if (!res.ok) {
        const errText = await res.text().catch(() => "")
        return {
          ...base,
          status: "failed",
          error: `Perplexity API responded with HTTP ${res.status}: ${errText.slice(0, 100)}`,
        }
      }

      const data = await res.json()
      const content = data.choices?.[0]?.message?.content || ""
      const citations: string[] = Array.isArray(data.citations)
        ? data.citations.filter((c: unknown): c is string => typeof c === "string" && c.startsWith("http"))
        : []

      const normBrand = norm(req.brand)
      const lower = content.toLowerCase()

      const brandWords = req.brand.trim().toLowerCase().split(/\s+/)
      const brandMentioned =
        (normBrand.length >= 3 && norm(lower).includes(normBrand)) ||
        lower.includes(req.brand.toLowerCase()) ||
        lower.includes(req.domain.toLowerCase()) ||
        (brandWords.length > 1 && brandWords.every((w) => lower.includes(w)))

      const domainCited = citations.some((u) => {
        try {
          const host = new URL(u).hostname.toLowerCase()
          return host === req.domain.toLowerCase() || host.endsWith(`.${req.domain.toLowerCase()}`)
        } catch {
          return false
        }
      })

      let snippet: string | undefined
      if (brandMentioned) {
        const sentences = content.split(/(?<=[.?!])\s+/)
        const relevant = sentences.find(
          (s: string) =>
            s.toLowerCase().includes(req.brand.toLowerCase()) ||
            s.toLowerCase().includes(req.domain.toLowerCase())
        )
        snippet = relevant ? relevant.trim().slice(0, 300) : content.slice(0, 200).trim()
      }

      let sentiment: ProviderEvidence["sentiment"] = "n/a"
      if (brandMentioned) {
        if (/lead|top|best|popular|recommend|reliable|premier|excellent|strong/i.test(snippet || content)) {
          sentiment = "positive"
        } else if (/slow|outdated|issue|problem|negative|poor|expensive/i.test(snippet || content)) {
          sentiment = "negative"
        } else {
          sentiment = "neutral"
        }
      }

      return {
        ...base,
        status: "completed",
        rawAnswer: content,
        snippet,
        mentioned: brandMentioned,
        domainCited,
        citationUrls: citations.slice(0, 10),
        sentiment,
        position: brandMentioned ? 1 : null,
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      return {
        ...base,
        status: "failed",
        error: `Perplexity connection failed: ${msg.slice(0, 150)}`,
      }
    }
  },
}
