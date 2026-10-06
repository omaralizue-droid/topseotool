import type { Metadata } from "next"
import { AiSeoUnifiedTool } from "@/components/tools/ai-seo-unified-tool"

export const metadata: Metadata = {
  title: "AI Platforms Rank & SEO Checker — TopSEOTool",
  description:
    "Check your brand ranking across ChatGPT, Perplexity, Gemini, Claude, Copilot & Grok, plus comprehensive On-Page & Technical SEO audit.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AI Platforms Rank & SEO Checker — TopSEOTool",
    description:
      "Check your brand ranking across ChatGPT, Perplexity, Gemini, Claude, Copilot & Grok, plus comprehensive On-Page & Technical SEO audit.",
    url: "https://topseotool.net",
    siteName: "TopSEOTool",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Platforms Rank & SEO Checker — TopSEOTool",
    description:
      "Check your brand ranking across ChatGPT, Perplexity, Gemini, Claude, Copilot & Grok, plus comprehensive On-Page & Technical SEO audit.",
  },
}

export default function HomePage() {
  return <AiSeoUnifiedTool />
}