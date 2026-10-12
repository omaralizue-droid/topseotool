import type { ProviderAdapter, ProviderCheckRequest, ProviderEvidence } from "./types"

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini"
const API_URL = "https://api.openai.com/v1/chat/completions"

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "")

export const openaiAdapter: ProviderAdapter = {
  id: "openai",
  name: "OpenAI (GPT-4o / SearchGPT)",

  isConfigured(): boolean {
    const rawKey = process.env.OPENAI_API_KEY?.trim()
    return Boolean(rawKey && rawKey.length > 10 && rawKey !== '""' && rawKey !== "''")
  },

  async runCheck(req: ProviderCheckRequest): Promise<ProviderEvidence> {
    const now = new Date().toISOString()
    const base: ProviderEvidence = {
      providerId: "openai",
      providerName: "OpenAI ChatGPT",
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
      limitationNotice: "OpenAI API response reflects model output at query time. End-user ChatGPT conversations vary based on system instructions and chat memory.",
    }

    if (!this.isConfigured()) {
      return {
        ...base,
        status: "not_configured",
        error: "OPENAI_API_KEY environment variable is not configured.",
      }
    }

    const apiKey = process.env.OPENAI_API_KEY!.trim().replace(/^["']|["']$/g, "")

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
              content: "You are an AI assistant answering buyer queries. Name specific companies, websites, and software platforms that solve the user need. Keep answers under 200 words.",
            },
            {
              role: "user",
              content: req.query,
            },
          ],
          temperature: 0.3,
        }),
      })

      clearTimeout(timer)

      if (res.status === 429) {
        return {
          ...base,
          status: "rate_limited",
          error: "OpenAI API rate limit exceeded (429).",
        }
      }

      if (!res.ok) {
        const errText = await res.text().catch(() => "")
        return {
          ...base,
          status: "failed",
          error: `OpenAI API error HTTP ${res.status}: ${errText.slice(0, 100)}`,
        }
      }

      const data = await res.json()
      const content = data.choices?.[0]?.message?.content || ""

      const normBrand = norm(req.brand)
      const lower = content.toLowerCase()

      const brandWords = req.brand.trim().toLowerCase().split(/\s+/)
      const brandMentioned =
        (normBrand.length >= 3 && norm(lower).includes(normBrand)) ||
        lower.includes(req.brand.toLowerCase()) ||
        lower.includes(req.domain.toLowerCase()) ||
        (brandWords.length > 1 && brandWords.every((w) => lower.includes(w)))

      // Extract cited URLs if provided in text
      const urlRegex = /https?:\/\/[^\s)"]+/g
      const extractedUrls = (content.match(urlRegex) || []).filter((u: string) => !u.endsWith("."))

      const domainCited = extractedUrls.some((u: string) => {
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
        citationUrls: extractedUrls.slice(0, 5),
        sentiment,
        position: brandMentioned ? 1 : null,
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      return {
        ...base,
        status: "failed",
        error: `OpenAI connection failed: ${msg.slice(0, 150)}`,
      }
    }
  },
}
