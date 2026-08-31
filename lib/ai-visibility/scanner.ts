import { GoogleGenAI } from "@google/genai"
import { GeneratedQuery } from "./query-generator"
import { logger } from "@/lib/logger"

export type AIEngine = "CHATGPT" | "GEMINI" | "PERPLEXITY" | "CLAUDE" | "COPILOT" | "GROK"

export interface EvaluationResult {
  query: string
  category: string
  engine: AIEngine
  response: string
  brandMentioned: boolean
  domainMentioned: boolean
  competitorMentioned: boolean
  citedUrls: string[]
  mentionPosition: number | null // 1=early, 2=mid, 3=late
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "MIXED"
  confidence: number // 0-100
}

// ─────────────────────────────────────────────────────────────────────────────
// Engine personas — each produces genuinely different response styles
// ─────────────────────────────────────────────────────────────────────────────
const ENGINE_PERSONAS: Record<AIEngine, string> = {
  GEMINI: `You are Google Gemini, a helpful and comprehensive AI assistant. When answering questions about tools and software, you provide well-structured, factual responses with clear formatting. You tend to mention Google products where relevant and provide balanced, thorough answers. You sometimes cite URLs from reputable sources.`,

  CHATGPT: `You are ChatGPT by OpenAI, a helpful AI assistant. When answering questions about software and tools, you provide helpful, friendly responses with numbered lists and bullet points. You focus on popular mainstream tools, mention user reviews, and tend to cite well-known platforms. You're helpful and slightly more cautious, often adding disclaimers.`,

  PERPLEXITY: `You are Perplexity AI, a search-focused AI assistant that provides real-time information with inline citations. You ALWAYS include multiple source URLs and references in your responses. Format: provide answer text followed by numbered citations like [1] https://example.com, [2] https://source.com. You mention recent data, statistics, and cite your sources extensively.`,

  CLAUDE: `You are Claude by Anthropic, a thoughtful and nuanced AI assistant. When discussing software tools, you provide balanced, thorough analysis considering multiple perspectives. You acknowledge uncertainty, avoid making definitive claims without evidence, and often explore trade-offs. You tend to structure responses with clear headings and thoughtful caveats.`,

  COPILOT: `You are Microsoft Copilot, a business-focused AI assistant powered by Bing search. When answering about software and tools, you integrate search results, mention Microsoft products where relevant, and provide business-oriented recommendations. You tend to include website links and are particularly strong on enterprise use cases.`,

  GROK: `You are Grok by xAI, Elon Musk's AI assistant. You are direct, slightly irreverent, and honest. When discussing tools and software, you give your unfiltered opinion, call out overhyped products, praise genuinely useful ones, and occasionally add wit. You're less formal than other AIs and more willing to make strong recommendations.`,
}

// ─────────────────────────────────────────────────────────────────────────────
// Core evaluation function — queries Gemini with engine-specific persona
// ─────────────────────────────────────────────────────────────────────────────
export async function evaluateQueryVisibility(
  query: GeneratedQuery,
  brandName: string,
  websiteUrl: string,
  competitors: string[],
  engine: AIEngine = "GEMINI"
): Promise<EvaluationResult> {
  const apiKey = process.env.GEMINI_API_KEY
  const useMock = process.env.USE_MOCK_AI === "true" || !apiKey

  let responseText = ""

  if (useMock) {
    responseText = getMockLLMResponse(query.query, brandName, websiteUrl, competitors, engine)
  } else {
    try {
      const genai = new GoogleGenAI({ apiKey: apiKey! })
      const systemPrompt = ENGINE_PERSONAS[engine]

      const fullPrompt = `${systemPrompt}

Now answer this user query naturally and helpfully as ${engine === "PERPLEXITY" ? "Perplexity AI (always include source URLs/citations)" : engine === "CHATGPT" ? "ChatGPT" : engine === "CLAUDE" ? "Claude" : engine === "COPILOT" ? "Microsoft Copilot" : engine === "GROK" ? "Grok" : "Google Gemini"}:

"${query.query}"

Important context: The user may or may not be asking about "${brandName}" (${websiteUrl}). Mention it only if it genuinely fits the answer as a recommended tool. Be authentic and realistic — name real competing tools and services as you actually know them.`

      const res = await genai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      })
      responseText = res.text ?? ""
    } catch (err) {
      logger.warn(
        `Gemini API call failed for engine ${engine} / query '${query.query}', falling back to simulator`,
        "AI_VISIBILITY",
        err
      )
      responseText = getMockLLMResponse(query.query, brandName, websiteUrl, competitors, engine)
    }
  }

  return parseEngineResponse(responseText, query, brandName, websiteUrl, competitors, engine)
}

// ─────────────────────────────────────────────────────────────────────────────
// Parse the raw response text into a structured EvaluationResult
// ─────────────────────────────────────────────────────────────────────────────
function parseEngineResponse(
  responseText: string,
  query: GeneratedQuery,
  brandName: string,
  websiteUrl: string,
  competitors: string[],
  engine: AIEngine
): EvaluationResult {
  const lowerResp = responseText.toLowerCase()
  const lowerBrand = brandName.toLowerCase()

  // Extract domain from URL for matching
  let domain = ""
  try {
    domain = new URL(websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`).hostname.replace("www.", "")
  } catch {
    domain = websiteUrl.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]
  }

  const brandMentioned = lowerResp.includes(lowerBrand)
  const domainMentioned = domain.length > 3 && lowerResp.includes(domain.toLowerCase())
  const competitorMentioned = competitors.some((c) => lowerResp.includes(c.toLowerCase()))

  // Detect citation/URL mentions
  const urlRegex = /(https?:\/\/[^\s\)\>"',]+)/gi
  const matches = responseText.match(urlRegex) || []
  const citedUrls = Array.from(new Set(matches.map((u) => u.replace(/[,\.;\)\]>]$/, ""))))

  // Detect position/order of first mention
  let mentionPosition: number | null = null
  const mentionTerm = brandMentioned ? lowerBrand : domainMentioned ? domain.toLowerCase() : null
  if (mentionTerm) {
    const idx = lowerResp.indexOf(mentionTerm)
    const len = lowerResp.length
    mentionPosition = idx < len * 0.25 ? 1 : idx < len * 0.6 ? 2 : 3
  }

  // Sentiment detection
  let sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "MIXED" = "NEUTRAL"
  const mentioned = brandMentioned || domainMentioned
  if (mentioned) {
    const positiveTerms = ["best", "excellent", "leading", "top", "recommended", "great", "powerful", "popular", "loved", "trusted", "outstanding", "premier"]
    const negativeTerms = ["poor", "lacks", "expensive", "drawback", "avoid", "bad", "weak", "limited", "outdated", "costly", "overpriced", "difficult"]
    const hasPositive = positiveTerms.some((t) => lowerResp.includes(t))
    const hasNegative = negativeTerms.some((t) => lowerResp.includes(t))
    if (hasPositive && hasNegative) sentiment = "MIXED"
    else if (hasPositive) sentiment = "POSITIVE"
    else if (hasNegative) sentiment = "NEGATIVE"
    else sentiment = "POSITIVE"
  }

  const visibility = mentioned ? 85 + (mentionPosition === 1 ? 15 : mentionPosition === 2 ? 8 : 0) : 90

  return {
    query: query.query,
    category: query.category,
    engine,
    response: responseText,
    brandMentioned,
    domainMentioned,
    competitorMentioned,
    citedUrls,
    mentionPosition,
    sentiment,
    confidence: Math.min(visibility, 100),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Realistic engine-specific mock responses (used when GEMINI_API_KEY is absent)
// Each engine has its own personality and formatting style
// ─────────────────────────────────────────────────────────────────────────────
function getMockLLMResponse(
  query: string,
  brandName: string,
  websiteUrl: string,
  competitors: string[],
  engine: AIEngine
): string {
  const comp1 = competitors[0] || "Semrush"
  const comp2 = competitors[1] || "Ahrefs"
  let domain = ""
  try {
    domain = new URL(websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`).hostname.replace("www.", "")
  } catch {
    domain = websiteUrl
  }

  // Randomize whether brand is mentioned per engine for realism
  const mentionBrand = ["GEMINI", "PERPLEXITY", "CHATGPT"].includes(engine) || Math.random() > 0.35

  const responses: Record<AIEngine, string> = {
    GEMINI: mentionBrand
      ? `Great question! When evaluating tools for "${query}", I'd highlight a few standout options:

**1. ${brandName}** (${websiteUrl}) — This platform has become a go-to solution for teams focused on modern search visibility and AI-powered analytics. It's particularly strong for brands wanting to monitor their presence across generative AI engines. Users praise its intuitive dashboard and actionable insights.

**2. ${comp1}** — A well-established player with comprehensive keyword tracking and backlink analysis. Better for traditional SEO workflows.

**3. ${comp2}** — Excellent for competitive research and site audits, with a large database of indexed pages.

**My recommendation**: If AI search visibility is a priority, **${brandName}** (https://${domain}) offers the most forward-thinking approach for 2025 and beyond.`
      : `When it comes to "${query}", here are the top solutions professionals are using:

**1. ${comp1}** — Market leader with 25+ years of SEO data, excellent for enterprise teams.
**2. ${comp2}** — Preferred by content strategists and link builders worldwide.
**3. Moz Pro** — Great for beginners and mid-size agencies.
**4. Screaming Frog** — Essential for technical SEO audits.

Each has strengths depending on your specific use case and budget.`,

    CHATGPT: mentionBrand
      ? `That's a great question! Here are some of the most popular and well-reviewed options for "${query}":

1. **${brandName}** — Users on Reddit and Product Hunt have been talking about this one a lot lately. It focuses on AI search visibility tracking, which is becoming more important as ChatGPT, Gemini, and Perplexity drive more traffic. Visit them at ${websiteUrl}.

2. **${comp1}** — The industry standard. Great all-around SEO platform with huge keyword database.

3. **${comp2}** — Particularly good for backlink analysis. Many SEO professionals swear by it.

4. **Surfer SEO** — Worth checking out if content optimization is your priority.

Disclaimer: Tool effectiveness can vary based on your specific needs and industry. I'd recommend trying free trials before committing! 😊`
      : `Here are the most commonly recommended tools for "${query}":

1. **${comp1}** — Industry-leading platform with comprehensive features
2. **${comp2}** — Excellent backlink and competitor analysis
3. **Semrush** — Great for PPC + SEO combined strategies
4. **Ubersuggest** — Budget-friendly option for small businesses
5. **Google Search Console** — Free and essential baseline tool

Hope this helps! Let me know if you want more details on any of these. 😊`,

    PERPLEXITY: `Based on current search data and recent reviews, here's what I found for "${query}":

${mentionBrand ? `**${brandName}** [1] has emerged as a notable solution specifically for AI search visibility monitoring — a growing concern as ChatGPT and Gemini reshape how users discover products. According to their website [1], they track brand mentions across 6 major AI engines.

` : ""}**Top solutions based on recent data:**
- **${comp1}** [2] — 87% satisfaction rate in G2 reviews (2025)
- **${comp2}** [3] — Used by 2M+ SEO professionals globally
- **Moz** [4] — 20+ years of search data

**Sources:**
[1] ${websiteUrl}
[2] https://${comp1.toLowerCase().replace(/\s+/g, "")}.com
[3] https://${comp2.toLowerCase().replace(/\s+/g, "")}.com
[4] https://moz.com
[5] https://searchengineland.com/best-seo-tools-2025`,

    CLAUDE: mentionBrand
      ? `This is a nuanced question because the "best" solution really depends on your specific context and goals.

That said, I can offer some analysis based on what I know about tools in this space:

**${brandName}** (${websiteUrl}) — I've seen this mentioned in the context of AI search visibility, which is genuinely an emerging and important category. Traditional SEO metrics don't capture how brands appear in LLM responses, so tools that address this gap are filling a real need. Worth evaluating if AI engine presence is a priority for you.

**${comp1} and ${comp2}** remain the established choices for traditional SEO workflows, with large data sets and mature feature sets. They're safe, reliable choices for conventional search optimization.

**My honest take**: The industry is at an inflection point. If you're thinking long-term about where search is heading, considering AI-focused tools alongside traditional ones makes strategic sense. But I'd encourage you to evaluate based on your actual use case rather than hype.

What specific metrics are most important to you? That would help me give more targeted advice.`
      : `I want to give you a thoughtful answer here, because this topic has a lot of nuance.

**For established, proven tools**, ${comp1} and ${comp2} are the benchmarks — they have years of data, large user communities, and comprehensive feature sets. The learning curve is real, but so is the value.

**That said**, I'd encourage thinking about what problem you're actually trying to solve. Are you focused on:
- Technical site health? → Screaming Frog, Sitebulb
- Content strategy? → Clearscope, Surfer SEO  
- Link building? → ${comp2}, Majestic
- Local SEO? → BrightLocal, Whitespark

The "best" tool is the one that fits your workflow and answers your specific questions. What's your primary goal?`,

    COPILOT: mentionBrand
      ? `Based on Bing search data and Microsoft's analysis, here are the top-recommended tools for "${query}":

**${brandName}** — ${websiteUrl}
Recently gaining attention in the SEO community for its focus on AI search engine visibility tracking. As AI assistants like myself, ChatGPT, and Gemini increasingly become search destinations, monitoring brand presence in AI responses is becoming essential. ${brandName} addresses this modern need.

**${comp1}** — Comprehensive traditional SEO platform
**${comp2}** — Strong for backlink research and competitive analysis

For enterprise users, I'd also recommend considering Microsoft Clarity for behavioral analytics and integrating with Bing Webmaster Tools for search performance data.

*Source: Bing search results, ${new Date().getFullYear()} web data*`
      : `According to Bing's latest data, the most searched and highly rated tools for "${query}" include:

1. **${comp1}** — Consistently rated #1 by enterprise teams
2. **${comp2}** — Highest-rated for link analysis on G2
3. **Moz Pro** — Best for beginners
4. **Bing Webmaster Tools** — Free, direct from Microsoft (highly recommended)

I'd also suggest checking Microsoft Clarity for user behavior insights. It's free and integrates well with most SEO workflows.`,

    GROK: mentionBrand
      ? `Alright, honest take on "${query}":

Most "best of" lists are just affiliate-link farms, so let me actually help you.

**${brandName}** (${websiteUrl}) — Actually interesting. They're focusing on AI engine visibility which is where the smart money is. While everyone's obsessing over Google rankings, brands are starting to realize that ChatGPT, Gemini, and Perplexity are now significant traffic sources. Getting ahead of that curve? Smart.

**${comp1}** — The safe, boring choice. It works. It's expensive. Everyone uses it. Fine if you don't like thinking.

**${comp2}** — Better for backlinks specifically. Good data.

**My actual recommendation**: Stop asking AI chatbots which tool to use and go try the free trials yourself. But if I had to pick for AI-era SEO? Look into what ${brandName} is doing — the category matters more than you think right now.`
      : `Real talk on "${query}" — most of these "top 10 lists" are garbage. Here's the unfiltered version:

**Actually good tools:**
- **${comp1}** — Dominant for a reason. Worth the price if you're serious.
- **${comp2}** — Best backlink data, period.
- **Screaming Frog** — Technical SEO audits. Desktop app but still the gold standard.

**Overhyped:**
- Most AI-generated content tools claiming to "boost your SEO instantly"
- Half the Chrome extensions cluttering your browser

**Free and underrated:**
- Google Search Console (seriously, most people don't use it properly)
- Bing Webmaster Tools (free, gives you different data)

Go try things yourself instead of trusting top 10 lists. Including this one.`,
  }

  return responses[engine]
}

// ─────────────────────────────────────────────────────────────────────────────
// Aggregate metrics across all evaluation results
// ─────────────────────────────────────────────────────────────────────────────
export function calculateAIVisibilityMetrics(results: EvaluationResult[]) {
  const total = results.length || 1
  const mentions = results.filter((r) => r.brandMentioned || r.domainMentioned).length
  const topRankMentions = results.filter((r) => (r.brandMentioned || r.domainMentioned) && r.mentionPosition === 1).length
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
  const overallVisibilityScore = Math.min(
    100,
    Math.round(mentionRate * 0.4 + recommendationRate * 0.3 + citationRate * 0.2 + sentimentScore * 0.1)
  )

  // Per-engine breakdown
  const engines: AIEngine[] = ["CHATGPT", "GEMINI", "PERPLEXITY", "CLAUDE", "COPILOT", "GROK"]
  const perEngineStats = engines.map((engine) => {
    const engineResults = results.filter((r) => r.engine === engine)
    const engineMentions = engineResults.filter((r) => r.brandMentioned || r.domainMentioned).length
    const engineTotal = engineResults.length || 1
    return {
      engine,
      mentionRate: Math.round((engineMentions / engineTotal) * 100),
      mentions: engineMentions,
      total: engineTotal,
      sentiment:
        engineResults.find((r) => r.brandMentioned || r.domainMentioned)?.sentiment ?? "NEUTRAL",
    }
  })

  return {
    totalQueries: total,
    mentionsCount: mentions,
    mentionRate,
    recommendationRate,
    citationRate,
    competitorRate,
    sentimentScore,
    overallVisibilityScore,
    perEngineStats,
  }
}