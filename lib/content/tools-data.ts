export interface FreeTool {
  slug: string
  name: string
  headline: string
  description: string
  badge: string
  iconName: string
  features: string[]
  faqs: { question: string; answer: string }[]
  instructions: string
}

export const FREE_TOOLS: FreeTool[] = [
  {
    slug: "ai-visibility-checker",
    name: "AI Search Visibility Prompt Test",
    headline: "Test how your brand appears in AI Search Assistants",
    description: "Analyze brand positioning and recommendation score across ChatGPT, Gemini, and Perplexity.",
    badge: "Interactive Tool",
    iconName: "Brain",
    features: [
      "Test commercial query prompts across 6 major AI engines",
      "Instant entity mention detection and sentiment score",
      "Extract cited URLs and competitor recommendations",
      "Export PDF summary report",
    ],
    faqs: [
      {
        question: "How does the AI Visibility Checker work?",
        answer: "Enter your target domain and commercial search query. Our engine queries major AI models in real time to analyze whether your brand is mentioned, cited, or recommended.",
      },
      {
        question: "Is this free to use?",
        answer: "Yes! The free tool provides real-time single query tests. For automated batch monitoring and historical trend tracking, check out our TOPSEOTOOL platform plans.",
      },
    ],
    instructions: "Enter your domain and a prompt (e.g. 'What are the best SEO audit tools for SaaS?') to see how AI engines answer.",
  },
  {
    slug: "schema-generator",
    name: "JSON-LD Schema Markup Generator",
    headline: "Generate valid Organization, Product, & FAQ Structured Data",
    description: "Build clean, Google-compliant JSON-LD structured data scripts to boost search rich snippets and LLM citation accuracy.",
    badge: "Free Utility",
    iconName: "Code",
    features: [
      "Generates Organization, WebSite, Product, FAQPage, & Article schemas",
      "Built-in JSON validation and Schema.org compliance checks",
      "One-click copy to clipboard",
      "Formatted preview with code syntax highlighting",
    ],
    faqs: [
      {
        question: "Why is JSON-LD Schema important for AI SEO?",
        answer: "LLMs and search web crawlers parse structured data 3x faster than unstructured HTML text, helping search engines understand your entity relationships and product features.",
      },
      {
        question: "Where should I place the generated script?",
        answer: "Place the generated script tag inside the <head> element of your HTML or component layout.",
      },
    ],
    instructions: "Select your schema type below, fill in your business details, and copy the valid JSON-LD code into your website.",
  },
  {
    slug: "meta-tag-analyzer",
    name: "Technical Meta Tag & Open Graph Analyzer",
    headline: "Audit Meta Tags, Canonical URLs, and Social Cards",
    description: "Preview how your web page title tags, meta descriptions, OpenGraph images, and canonical tags render on Google, X/Twitter, and LinkedIn.",
    badge: "Free Auditor",
    iconName: "Globe",
    features: [
      "Calculates title and description pixel length safety margins",
      "Validates OpenGraph og:image and Twitter Card properties",
      "Verifies canonical URL match and robots indexability headers",
      "Detects missing H1 headings and structured data signals",
    ],
    faqs: [
      {
        question: "What is the recommended title tag length?",
        answer: "Title tags should ideally be between 50 and 60 characters (or under 600 pixels) to avoid truncation on Google search engine result pages.",
      },
      {
        question: "Why are OpenGraph tags critical for digital marketing?",
        answer: "OpenGraph meta tags control how your links display when shared on social media platforms, messaging apps, and AI assistant previews.",
      },
    ],
    instructions: "Paste your website URL below to inspect your title, meta description, canonical tag, and social card rendering.",
  },
]
