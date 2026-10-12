export type ProviderId = "gemini" | "perplexity" | "openai" | "claude"

export type ProviderCheckStatus =
  | "completed"
  | "not_configured"
  | "rate_limited"
  | "failed"
  | "unsupported"

export interface ProviderCheckRequest {
  brand: string
  domain: string
  query: string
  intent: "branded" | "category" | "problem" | "comparison" | "reviews" | "alternatives"
}

export interface ProviderEvidence {
  providerId: ProviderId
  providerName: string
  model: string
  status: ProviderCheckStatus
  timestamp: string
  query: string
  rawAnswer?: string
  snippet?: string
  mentioned: boolean
  domainCited: boolean
  citationUrls: string[]
  sentiment: "positive" | "neutral" | "negative" | "mixed" | "n/a"
  position?: number | null
  brandsNamed?: string[]
  error?: string
  limitationNotice?: string
}

export interface ProviderAdapter {
  id: ProviderId
  name: string
  isConfigured(): boolean
  runCheck(req: ProviderCheckRequest): Promise<ProviderEvidence>
}
