"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Globe, Brain, TrendingUp, Search, Link2, Users2, ShieldCheck,
  Zap, FileText, CheckCircle2, ArrowRight, ArrowUpRight, ArrowDownRight,
  Sparkles, Check, ChevronDown, ChevronUp, Code2, Terminal, Copy,
  CheckCheck, Layers, Building2, BarChart3, Clock, ShieldAlert,
  Star, ChevronRight, Play, RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgrammaticPageData } from "@/lib/seo/programmatic-seo"
import {
  OrganizationJsonLd,
  SoftwareApplicationJsonLd,
  BreadcrumbJsonLd,
  FAQJsonLd
} from "@/components/seo/json-ld"

interface LandingPageTemplateProps {
  data: ProgrammaticPageData
}

export function LandingPageTemplate({ data }: LandingPageTemplateProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [interactiveInput, setInteractiveInput] = useState("example.com")
  const [simulatedResult, setSimulatedResult] = useState(false)
  const [simulating, setSimulating] = useState(false)

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!interactiveInput) return
    setSimulating(true)
    setTimeout(() => {
      setSimulating(false)
      setSimulatedResult(true)
    }, 600)
  }

  return (
    <div className="flex flex-col w-full">
      {/* Inject Structured Data Schemas */}
      <OrganizationJsonLd />
      <SoftwareApplicationJsonLd
        name={`TOPSEOTOOL — ${data.h1}`}
        description={data.metaDescription}
      />
      <BreadcrumbJsonLd items={data.breadcrumbs} />
      <FAQJsonLd faqs={data.faqs} />

      {/* Breadcrumb Bar */}
      <div className="border-b border-border/40 bg-muted/20 py-2.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {data.breadcrumbs.map((b, idx) => (
              <div key={b.name} className="flex items-center gap-1.5">
                {idx > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/50" />}
                {idx === data.breadcrumbs.length - 1 ? (
                  <span className="font-semibold text-foreground">{b.name}</span>
                ) : (
                  <Link href={b.item} className="hover:text-foreground transition-colors">
                    {b.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <Badge variant="outline" className="text-xs px-3 py-1 font-mono">
            {data.heroBadge}
          </Badge>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-balance max-w-4xl mx-auto leading-[1.1] text-foreground">
            {data.h1}
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
            {data.subheadline}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              className="w-full sm:w-auto h-11 px-8 text-xs sm:text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm gap-2"
              asChild
            >
              <Link href="/signup">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-11 px-8 text-xs sm:text-sm font-medium border-border"
              asChild
            >
              <Link href="/dashboard">
                Explore Demo
              </Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            No credit card required • Instant automated crawl • Cancel anytime
          </p>

          {/* Interactive Simulation Widget */}
          <div className="pt-6 max-w-2xl mx-auto">
            <form onSubmit={handleSimulate} className="flex flex-col sm:flex-row gap-2 p-2 rounded-xl border border-border/80 bg-card shadow-lg">
              <input
                type="text"
                value={interactiveInput}
                onChange={(e) => setInteractiveInput(e.target.value)}
                placeholder="Enter domain or keyword (e.g. yoursite.com)..."
                aria-label="Enter domain or keyword"
                className="flex-1 h-10 px-3 rounded-lg bg-muted/40 border border-border/60 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button type="submit" size="sm" className="h-10 px-5 text-xs font-semibold shrink-0" disabled={simulating}>
                {simulating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "Run Instant Analysis"}
              </Button>
            </form>

            {simulatedResult && (
              <div className="mt-3 p-3.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-left text-xs space-y-1.5 animate-fade-in font-mono">
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>✔ Diagnostic scan ready for {interactiveInput}</span>
                  <Badge variant="success" className="text-[10px]">Score: 92/100</Badge>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Found 48 keyword ranking opportunities, 2 critical canonical issues, and verified 3 brand citations in AI search.
                </p>
                <Link href="/signup" className="text-[11px] font-bold text-primary hover:underline inline-block pt-1">
                  Create free account to view full report →
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Metrics Bar */}
      <section className="py-8 border-b border-border/40 bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.metrics.map((m) => (
              <div key={m.label} className="p-4 rounded-lg border border-border/60 bg-card text-center sm:text-left">
                <div className="flex items-baseline justify-center sm:justify-start gap-1.5">
                  <span className="text-2xl font-bold font-mono text-foreground">{m.value}</span>
                  {m.trend && <span className="text-[10px] font-semibold text-emerald-500 font-mono">{m.trend}</span>}
                </div>
                <span className="text-xs text-muted-foreground mt-0.5 block">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 sm:py-20 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Core Capabilities &amp; Architecture
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Built on production-grade asynchronous job queues for high-velocity data processing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.features.map((f) => (
              <div key={f.title} className="p-5 rounded-lg border border-border/70 bg-card space-y-2 hover:border-border transition-colors">
                <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-foreground font-bold">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-bold text-sm text-foreground">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitive Comparison Table */}
      <section className="py-16 sm:py-20 border-b border-border/40 bg-muted/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {data.comparison.title}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              See why forward-thinking companies choose TOPSEOTOOL over legacy solutions.
            </p>
          </div>

          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Feature / Capability</th>
                  <th className="py-3 px-4 text-primary font-bold">TOPSEOTOOL</th>
                  <th className="py-3 px-4">Legacy Tools (Semrush/Ahrefs)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {data.comparison.rows.map((row) => (
                  <tr key={row.feature} className="hover:bg-muted/15 transition-colors">
                    <td className="py-3 px-4 font-semibold text-foreground">{row.feature}</td>
                    <td className="py-3 px-4 font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> {row.topseotool}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{row.legacy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 sm:py-20 border-b border-border/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Direct answers about data accuracy, setup, and capabilities.
            </p>
          </div>

          <div className="divide-y divide-border/60 border-y border-border/60">
            {data.faqs.map((faq, idx) => (
              <div key={faq.question} className="py-4">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left font-semibold text-sm text-foreground hover:text-primary transition-colors"
                >
                  <span>{faq.question}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                  )}
                </button>
                {openFaq === idx && (
                  <p className="mt-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed animate-in fade-in-0 duration-150">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Conversion CTA */}
      <section className="py-16 md:py-20 bg-foreground text-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Start Optimizing with {data.h1}
          </h2>
          <p className="text-xs sm:text-sm text-background/80 max-w-xl mx-auto">
            Audit your site, uncover profitable search volume, and outrank competitors today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              className="w-full sm:w-auto h-11 px-8 text-xs sm:text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              asChild
            >
              <Link href="/signup">
                Start Free Trial <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-11 px-8 text-xs sm:text-sm font-medium border-background/20 text-foreground bg-background hover:bg-background/90"
              asChild
            >
              <Link href="/pricing">View All Pricing Plans</Link>
            </Button>
          </div>
          <p className="text-[11px] text-background/60">
            Free forever tier available • Instant setup • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  )
}
