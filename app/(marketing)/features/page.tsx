import type { Metadata } from "next"
import Link from "next/link"
import { Globe, Brain, MessageSquare, Link2, Users2, Zap, Lightbulb, History, FileText, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Platform Features | TOPSEOTOOL",
  description: "Explore all core modules of TOPSEOTOOL AI Search & SEO Intelligence Platform.",
  alternates: {
    canonical: "/features",
  },
}

const MODULES = [
  { icon: Globe, label: "SEO Website Audit", desc: "Comprehensive technical crawls, page speed checks, content analysis, and automated issue classification." },
  { icon: Brain, label: "AI Search Visibility Audit", desc: "Monitor your brand presence across ChatGPT, Gemini, Perplexity, Claude, Copilot, and Grok." },
  { icon: MessageSquare, label: "AI Brand Mentions", desc: "Track every occurrence of your brand name in AI responses with real-time sentiment analysis." },
  { icon: Link2, label: "AI Citation Tracking", desc: "Identify which of your domain URLs are cited as authoritative sources by LLMs." },
  { icon: Users2, label: "Competitor Comparison", desc: "Side-by-side benchmarking of your SEO scores and AI search rankings against top competitors." },
  { icon: Zap, label: "AI Brand Perception", desc: "Deep qualitative insights into how AI models perceive your key products, brand, and authority." },
  { icon: Lightbulb, label: "SEO/AEO Recommendations", desc: "AI-generated step-by-step action plans for traditional search engines and answer engines." },
  { icon: History, label: "Historical Visibility Tracking", desc: "Long-term trend tracking of domain authority, SEO scores, and AI search presence over time." },
  { icon: FileText, label: "Automated Reports", desc: "Generate white-label PDF executive summaries and schedule automated email delivery." },
]

export default function FeaturesPage() {
  return (
    <div className="py-12 sm:py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-16">
          <Badge variant="brand" className="mb-3 sm:mb-4">Complete Intelligence Suite</Badge>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-3 sm:mb-4">
            Built for modern SEO &amp; AI search dominance
          </h1>
          <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto">
            Traditional SEO tools leave you blind in AI search. TOPSEOTOOL bridges the gap.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {MODULES.map((m) => (
            <div key={m.label} className="p-5 sm:p-6 rounded-xl border border-border bg-card space-y-3 hover:border-brand/40 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-lg bg-brand-muted flex items-center justify-center text-brand">
                <m.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base sm:text-lg">{m.label}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button size="xl" asChild className="w-full sm:w-auto">
            <Link href="/signup">Get started free <ArrowRight className="h-4 w-4 ml-2" /></Link>
          </Button>
        </div>
      </div>
    </div>
  )
}