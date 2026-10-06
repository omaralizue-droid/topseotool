import { GoogleGenAI } from "@google/genai"

// Thin wrapper around the Gemini SDK with timeouts and two call styles:
// structured JSON output, and free-text answers grounded in live Google Search.

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash"

let client: GoogleGenAI | null = null

export function aiEnabled(): boolean {
  return !!process.env.GEMINI_API_KEY
}

function getClient(): GoogleGenAI {
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
  return client
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s`)), ms)
    promise.then(
      (v) => (clearTimeout(timer), resolve(v)),
      (e) => (clearTimeout(timer), reject(e))
    )
  })
}

export async function generateJson<T>(
  prompt: string,
  schema: Record<string, unknown>,
  { timeoutMs = 25000, thinkingBudget = 0, temperature = 0.4 } = {}
): Promise<T> {
  const res = await withTimeout(
    getClient().models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        temperature,
        responseMimeType: "application/json",
        responseJsonSchema: schema,
        thinkingConfig: { thinkingBudget },
      },
    }),
    timeoutMs,
    "AI analysis"
  )
  const text = res.text ?? ""
  return JSON.parse(text) as T
}

export interface GroundedAnswer {
  text: string
  sources: { title: string; uri: string }[]
  searchQueries: string[]
}

export async function generateGrounded(prompt: string, { timeoutMs = 30000 } = {}): Promise<GroundedAnswer> {
  const res = await withTimeout(
    getClient().models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        temperature: 0.6,
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
    timeoutMs,
    "AI answer"
  )
  const meta = res.candidates?.[0]?.groundingMetadata
  return {
    text: res.text ?? "",
    sources: (meta?.groundingChunks ?? [])
      .map((c) => ({ title: c.web?.title ?? "", uri: c.web?.uri ?? "" }))
      .filter((s) => s.title || s.uri),
    searchQueries: meta?.webSearchQueries ?? [],
  }
}

/** Gemini errors often wrap JSON; surface a short human-readable message. */
export function describeAiError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  if (/429|RESOURCE_EXHAUSTED|quota/i.test(msg)) return "AI rate limit reached. Please try again in a minute."
  if (/API key|PERMISSION_DENIED|401|403/i.test(msg)) return "The AI service rejected the API key."
  if (/timed out/i.test(msg)) return msg
  return "The AI service returned an error."
}
