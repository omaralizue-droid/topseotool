import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Globe, Brain, MessageSquare, Link2, Users2, Zap,
  Lightbulb, History, FileText, ArrowRight, CheckCircle2,
  TrendingUp, Search, BarChart3
} from "lucide-react"

export const metadata: Metadata = {
  title: "AI Search & SEO Intelligence Platform | TOPSEOTOOL",
  description: "Measure and improve your visibility across traditional search engines and AI-powered search experiences.",
  alternates: {
    canonical: "/",
  },
}

const MODULES = [
  { icon: Globe,        label: "SEO Website Audit",          desc: "Deep technical and content audits with AI-powered issue detection and prioritized recommendations." },
  { icon: Brain,        label: "AI Search Visibility",        desc: "Discover how your brand appears in ChatGPT, Gemini, Perplexity, Claude, and other AI engines." },
  { icon: MessageSquare,label: "AI Brand Mentions",           desc: "Track every time an AI assistant mentions your brand — with sentiment analysis." },
  { icon: Link2,        label: "AI Citation Tracking",        desc: "Know which pages AI engines cite when recommending your products or services." },
  { icon: Users2,       label: "Competitor Comparison",       desc: "Benchmark your SEO and AI visibility against your top competitors side-by-side." },
  { icon: Zap,          label: "AI Brand Perception",         desc: "Understand how AI models describe your brand and uncover reputation gaps." },
  { icon: Lightbulb,    label: "SEO/AEO Recommendations",    desc: "AI-generated action plans tailored to improve both traditional SEO and AI engine optimization." },
  { icon: History,      label: "Historical Tracking",         desc: "Chart your visibility trends over time across all modules in one unified view." },
  { icon: FileText,     label: "Automated Reports",           desc: "Schedule and deliver polished PDF reports to clients automatically." },
]

const STATS = [
  { value: "10+", label: "AI engines monitored" },
  { value: "100+", label: "SEO audit checks" },
  { value: "Real-time", label: "Visibility tracking" },
]

const AUDIENCE = [
  "SEO professionals", "Marketing agencies", "SaaS companies",
  "Freelancers", "Enterprise marketing teams", "Small businesses"
]

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-background pt-16 pb-20 sm:pt-20 sm:pb-24 md:pt-28 md:pb-32">
        <div className="absolute inset-0 bg-grid-subtle opacity-60" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[500px] md:w-[700px] h-[300px] sm:h-[350px] md:h-[400px] bg-brand/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <Badge variant="brand" className="mb-5 sm:mb-6 text-xs px-3 py-1">
            Now tracking AI Search Visibility across 6 major AI engines
          </Badge>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-balance mb-5 sm:mb-6 leading-[1.1]">
            SEO &amp; AI Search
            <br />
            <span className="text-brand-gradient">Intelligence Platform</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-7 sm:mb-8 text-pretty px-2">
            Measure and improve your visibility across traditional search engines and
            AI-powered search experiences — from one professional platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="xl" asChild className="w-full sm:w-auto">
              <Link href="/signup">
                Start your free audit <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/pricing">View pricing</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">No credit card required for the first audit</p>

          {/* Stats */}
          <div className="mt-12 sm:mt-16 grid grid-cols-3 gap-3 sm:gap-6 max-w-sm sm:max-w-lg mx-auto">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-foreground font-mono-nums">{s.value}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules grid */}
      <section id="features" className="py-16 sm:py-20 md:py-28 bg-muted/30 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-3">Platform modules</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Everything you need to dominate<br className="hidden sm:block" />
              <span className="sm:hidden"> </span>search — traditional and AI
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base px-2">
              TOPSEOTOOL combines deep SEO auditing with AI search monitoring — the only platform built for the era of answer engines.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {MODULES.map((m, i) => (
              <div key={m.label} className="group relative bg-background border border-border rounded-xl p-4 sm:p-5 hover:border-brand/40 hover:shadow-brand transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-md bg-brand-muted flex items-center justify-center shrink-0">
                    <m.icon className="h-4 w-4 text-brand" />
                  </div>
                  <span className="font-semibold text-sm">{m.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground font-mono-nums opacity-50">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof / audience */}
      <section className="py-16 sm:py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Built for</p>
          <div className="flex flex-wrap justify-center gap-2 mb-10 sm:mb-14">
            {AUDIENCE.map((a) => (
              <Badge key={a} variant="outline" className="text-xs sm:text-sm px-2.5 sm:px-3 py-1">{a}</Badge>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: Search,    title: "Traditional SEO", desc: "Full site crawl, technical issues, on-page optimization, Core Web Vitals." },
              { icon: Brain,     title: "AI Engine SEO (AEO)", desc: "Track your brand across ChatGPT, Gemini, Perplexity, Claude and more." },
              { icon: BarChart3, title: "Competitive Intelligence", desc: "See exactly where competitors outrank you — and close the gap." },
            ].map((f) => (
              <div key={f.title} className="text-left p-5 sm:p-6 rounded-xl border border-border bg-background hover:border-brand/30 hover:shadow-sm transition-all">
                <f.icon className="h-6 w-6 text-brand mb-4" />
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-brand border-y border-brand/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center text-brand-foreground">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Ready to see where you rank in AI search?
          </h2>
          <p className="text-brand-foreground/80 mb-8 text-base sm:text-lg px-2">
            Join businesses using TOPSEOTOOL to stay visible in the age of AI-powered search.
          </p>
          <Button size="xl" variant="secondary" asChild className="w-full sm:w-auto">
            <Link href="/signup">Get started free <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </div>
  )
}