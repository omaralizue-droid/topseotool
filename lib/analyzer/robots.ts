import type { AiBot, BotStatus } from "./types"

// AI-related crawlers that decide whether a site can be read, cited, or learned from.
export const AI_BOTS: Omit<AiBot, "status">[] = [
  { id: "OAI-SearchBot", name: "OAI-SearchBot", owner: "OpenAI", purpose: "ChatGPT search results & citations" },
  { id: "ChatGPT-User", name: "ChatGPT-User", owner: "OpenAI", purpose: "Live page visits from ChatGPT" },
  { id: "GPTBot", name: "GPTBot", owner: "OpenAI", purpose: "Model training data" },
  { id: "PerplexityBot", name: "PerplexityBot", owner: "Perplexity", purpose: "Perplexity answer index" },
  { id: "ClaudeBot", name: "ClaudeBot", owner: "Anthropic", purpose: "Claude training & retrieval" },
  { id: "Claude-SearchBot", name: "Claude-SearchBot", owner: "Anthropic", purpose: "Claude web search results" },
  { id: "Googlebot", name: "Googlebot", owner: "Google", purpose: "Google Search & AI Overviews" },
  { id: "Google-Extended", name: "Google-Extended", owner: "Google", purpose: "Gemini grounding & training" },
  { id: "Bingbot", name: "Bingbot", owner: "Microsoft", purpose: "Bing index that powers Copilot" },
  { id: "Applebot-Extended", name: "Applebot-Extended", owner: "Apple", purpose: "Apple Intelligence" },
  { id: "Meta-ExternalAgent", name: "Meta-ExternalAgent", owner: "Meta", purpose: "Meta AI" },
  { id: "CCBot", name: "CCBot", owner: "Common Crawl", purpose: "Open dataset many LLMs train on" },
]

interface Group {
  agents: string[]
  rules: { type: "allow" | "disallow"; path: string }[]
}

function parseGroups(robotsTxt: string): { groups: Group[]; sitemaps: string[] } {
  const groups: Group[] = []
  const sitemaps: string[] = []
  let current: Group | null = null
  let lastWasAgent = false

  for (const rawLine of robotsTxt.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim()
    if (!line) continue
    const idx = line.indexOf(":")
    if (idx === -1) continue
    const key = line.slice(0, idx).trim().toLowerCase()
    const value = line.slice(idx + 1).trim()

    if (key === "user-agent") {
      if (!current || !lastWasAgent) {
        current = { agents: [], rules: [] }
        groups.push(current)
      }
      current.agents.push(value.toLowerCase())
      lastWasAgent = true
    } else if (key === "allow" || key === "disallow") {
      if (current) current.rules.push({ type: key, path: value })
      lastWasAgent = false
    } else if (key === "sitemap") {
      sitemaps.push(value)
    } else {
      lastWasAgent = false
    }
  }
  return { groups, sitemaps }
}

function statusForGroup(group: Group | undefined): BotStatus {
  if (!group) return "allowed"
  const disallows = group.rules.filter((r) => r.type === "disallow" && r.path !== "")
  const allowsRoot = group.rules.some((r) => r.type === "allow" && (r.path === "/" || r.path === "/*"))
  const blocksRoot = disallows.some((r) => r.path === "/" || r.path === "/*")
  if (blocksRoot && !allowsRoot) return "blocked"
  if (blocksRoot && allowsRoot) return "partial"
  // A handful of disallowed paths (e.g. /admin) is normal; many suggests meaningful restriction.
  return disallows.length > 8 ? "partial" : "allowed"
}

export function evaluateRobots(robotsTxt: string | null): { bots: AiBot[]; sitemaps: string[] } {
  if (!robotsTxt) {
    return { bots: AI_BOTS.map((b) => ({ ...b, status: "allowed" })), sitemaps: [] }
  }
  const { groups, sitemaps } = parseGroups(robotsTxt)
  const wildcard = groups.find((g) => g.agents.includes("*"))

  const bots = AI_BOTS.map((bot) => {
    const token = bot.id.toLowerCase()
    const specific = groups.find((g) => g.agents.some((a) => a !== "*" && token.startsWith(a)))
    return { ...bot, status: statusForGroup(specific ?? wildcard) }
  })
  return { bots, sitemaps }
}
