export interface ContentOpportunity {
  id: string
  topic: string
  searchIntent: "INFORMATIONAL" | "COMMERCIAL" | "TRANSACTIONAL" | "COMPARISON"
  businessValue: "HIGH" | "MEDIUM" | "LOW"
  aiVisibilityOpportunity: string
  suggestedTitle: string
  questionsToAnswer: string[]
  suggestedOutline: string[]
  internalLinks: string[]
  relatedCompetitors: string[]
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
}

export interface DetailedContentBrief {
  opportunityId: string
  topic: string
  targetKeywords: string[]
  titleOptions: string[]
  metaDescription: string
  suggestedWordCount: number
  outline: Array<{ heading: string; keyPoints: string[] }>
  faqSuggestions: Array<{ question: string; answer: string }>
  schemaRecommendation: {
    type: string
    jsonLdSnippet: string
  }
}

export function generateContentOpportunities(
  brandName: string,
  domain: string,
  competitors: string[]
): ContentOpportunity[] {
  const comp = competitors[0] ?? "Competitors"

  return [
    {
      id: "opp-aeo-guide",
      topic: "Answer Engine Optimization (AEO) Strategy & LLM Citation Playbook",
      searchIntent: "INFORMATIONAL",
      businessValue: "HIGH",
      aiVisibilityOpportunity: "Captures 40%+ citation market share across Perplexity and ChatGPT for 'how to optimize for AI search'.",
      suggestedTitle: `The Complete Answer Engine Optimization (AEO) Guide for 2026`,
      questionsToAnswer: [
        "What is Answer Engine Optimization (AEO)?",
        "How do ChatGPT and Gemini choose which URLs to cite as sources?",
        "What is the difference between traditional SEO and AEO?",
      ],
      suggestedOutline: [
        "Introduction to AEO and Generative AI Search",
        "How LLMs Crawl, Index, and Extract Information",
        "Structured Data & Schema.org Requirements for AI Citations",
        "Measuring AI Search Visibility & Citation Share",
      ],
      internalLinks: [`/features`, `/pricing`],
      relatedCompetitors: [comp],
      priority: "CRITICAL",
    },
    {
      id: "opp-comparison-page",
      topic: `${brandName} vs ${comp}: Feature & AI Intelligence Comparison`,
      searchIntent: "COMPARISON",
      businessValue: "HIGH",
      aiVisibilityOpportunity: "Ensures ChatGPT and Gemini present your brand as the #1 alternative for buyer comparison queries.",
      suggestedTitle: `${brandName} vs ${comp}: 2026 SaaS Feature & Pricing Comparison`,
      questionsToAnswer: [
        `Is ${brandName} better than ${comp}?`,
        `What are the main differences between ${brandName} and ${comp}?`,
        `Which tool offers better AI brand mention tracking?`,
      ],
      suggestedOutline: [
        "Executive Summary & Quick Comparison Table",
        "Core Feature Breakdown: SEO Auditing vs AEO Tracking",
        "Pricing & Subscription Value Comparison",
        "Final Verdict: Which Tool Should You Choose?",
      ],
      internalLinks: [`/pricing`],
      relatedCompetitors: [comp],
      priority: "HIGH",
    },
  ]
}

export function generateDetailedBrief(opportunity: ContentOpportunity, brandName: string): DetailedContentBrief {
  return {
    opportunityId: opportunity.id,
    topic: opportunity.topic,
    targetKeywords: [
      opportunity.topic.toLowerCase(),
      "ai search visibility",
      "llm citation tracking",
      "answer engine optimization",
    ],
    titleOptions: [
      opportunity.suggestedTitle,
      `How to Win AI Search Citations: ${opportunity.topic}`,
      `The 2026 Guide to ${opportunity.topic} | ${brandName}`,
    ],
    metaDescription: `Discover how to optimize your site for ${opportunity.topic}. Learn actionable steps to improve AI search visibility and citation share across ChatGPT and Gemini.`,
    suggestedWordCount: 1500,
    outline: opportunity.suggestedOutline.map((heading) => ({
      heading,
      keyPoints: [
        "Provide clear, direct factual answers in the first 2 sentences.",
        "Include Schema.org JSON-LD markup to aid LLM parser extraction.",
        "Include comparison tables or numbered lists for high-density information.",
      ],
    })),
    faqSuggestions: opportunity.questionsToAnswer.map((q) => ({
      question: q,
      answer: `When optimizing for "${q}", focus on structured JSON-LD schema, direct concise answers, and high-authority source citations.`,
    })),
    schemaRecommendation: {
      type: "FAQPage & Article Schema",
      jsonLdSnippet: `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "${opportunity.questionsToAnswer[0] || "What is AEO?"}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Answer Engine Optimization (AEO) is the strategy of optimizing web content to be cited and recommended by generative AI search models like ChatGPT and Gemini."
      }
    }
  ]
}`,
    },
  }
}