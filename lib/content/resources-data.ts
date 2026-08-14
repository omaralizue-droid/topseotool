export interface EducationalResource {
  slug: string
  title: string
  description: string
  badge: string
  type: string
  updatedAt: string
  chapters: { title: string; content: string }[]
}

export const RESOURCES: EducationalResource[] = [
  {
    slug: "aeo-playbook-2026",
    title: "Answer Engine Optimization (AEO) Master Playbook (2026 Edition)",
    description: "The complete technical framework for optimizing web presence across ChatGPT, Gemini, Perplexity, and AI answers.",
    badge: "Playbook Guide",
    type: "Comprehensive Playbook",
    updatedAt: "2026-08-01",
    chapters: [
      {
        title: "Chapter 1: Understanding LLM Indexing Architecture",
        content: "Unlike traditional search crawlers that build inverted index databases of words, AI models utilize vector embeddings and Retrieval-Augmented Generation (RAG). To rank in AI answers, your content must possess direct factual alignment and high semantic density.",
      },
      {
        title: "Chapter 2: Entity Schema Foundations",
        content: "Structured JSON-LD schema acts as the authoritative knowledge bridge. Ensure your site includes Organization, Person, WebSite, and Product schemas with correct sameAs links to official social profiles and Wikipedia entries.",
      },
      {
        title: "Chapter 3: Structuring Q&A Content Blocks",
        content: "AI model retrieval algorithms search for direct answer blocks (40-60 words). Structure key landing pages with explicit FAQ headers followed by direct answers before elaborating on details.",
      },
    ],
  },
  {
    slug: "ai-search-ranking-factors",
    title: "Research Report: 15 Factors Influencing LLM Citation & Brand Mentions",
    description: "An empirical study analyzing 50,000 commercial AI prompt queries across ChatGPT, Perplexity, and Gemini.",
    badge: "Research Report",
    type: "Industry Research",
    updatedAt: "2026-07-15",
    chapters: [
      {
        title: "Key Finding 1: Third-Party Review Consistency",
        content: "Brands cited across 3+ independent review domain nodes (G2, Capterra, TechCrunch) have a 4.2x higher likelihood of being recommended by Perplexity AI for commercial buyer queries.",
      },
      {
        title: "Key Finding 2: Page Loading Speed (LCP)",
        content: "RAG indexers enforce strict timeout parameters (sub-1000ms). Web pages with LCP under 2.0s are cited 68% more frequently than pages taking over 4.0s to load.",
      },
      {
        title: "Key Finding 3: Clear Entity Formatting",
        content: "Pages using standard HTML table structures and JSON-LD schema are indexed with 94% higher accuracy compared to pages relying solely on plain paragraph text.",
      },
    ],
  },
]
