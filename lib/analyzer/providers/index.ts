import type { ProviderAdapter, ProviderCheckRequest, ProviderEvidence, ProviderId } from "./types"
import { geminiAdapter } from "./gemini"
import { perplexityAdapter } from "./perplexity"
import { openaiAdapter } from "./openai"

export * from "./types"
export { geminiAdapter } from "./gemini"
export { perplexityAdapter } from "./perplexity"
export { openaiAdapter } from "./openai"

export const PROVIDERS: Record<ProviderId, ProviderAdapter> = {
  gemini: geminiAdapter,
  perplexity: perplexityAdapter,
  openai: openaiAdapter,
  claude: {
    id: "claude",
    name: "Anthropic Claude 3.5 Sonnet",
    isConfigured: () => Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim().length > 10),
    runCheck: async (req: ProviderCheckRequest) => ({
      providerId: "claude",
      providerName: "Anthropic Claude",
      model: "claude-3-5-sonnet",
      status: "not_configured",
      timestamp: new Date().toISOString(),
      query: req.query,
      mentioned: false,
      domainCited: false,
      citationUrls: [],
      sentiment: "n/a",
      position: null,
      error: "ANTHROPIC_API_KEY not configured.",
      limitationNotice: "Claude API access requires active Anthropic API key.",
    }),
  },
}

/** Returns status summary of all supported providers */
export function getAvailableProviders(): {
  id: ProviderId
  name: string
  configured: boolean
}[] {
  return (Object.keys(PROVIDERS) as ProviderId[]).map((id) => ({
    id,
    name: PROVIDERS[id].name,
    configured: PROVIDERS[id].isConfigured(),
  }))
}

/** Executes queries across all configured providers concurrently */
export async function executeMultiProviderChecks(
  req: ProviderCheckRequest,
  providerIds: ProviderId[] = ["gemini", "perplexity", "openai"]
): Promise<ProviderEvidence[]> {
  const promises = providerIds.map(async (id) => {
    const adapter = PROVIDERS[id]
    if (!adapter) {
      return {
        providerId: id,
        providerName: id,
        model: "unknown",
        status: "unsupported" as const,
        timestamp: new Date().toISOString(),
        query: req.query,
        mentioned: false,
        domainCited: false,
        citationUrls: [],
        sentiment: "n/a" as const,
        error: `Provider ${id} is not supported.`,
      }
    }

    try {
      return await adapter.runCheck(req)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      return {
        providerId: id,
        providerName: adapter.name,
        model: "unknown",
        status: "failed" as const,
        timestamp: new Date().toISOString(),
        query: req.query,
        mentioned: false,
        domainCited: false,
        citationUrls: [],
        sentiment: "n/a" as const,
        error: `Provider execution failed: ${msg}`,
      }
    }
  })

  return Promise.all(promises)
}
