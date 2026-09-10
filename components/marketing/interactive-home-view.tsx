"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Globe, Brain, TrendingUp, Search, Link2, Users2, ShieldCheck,
  Zap, FileText, CheckCircle2, ArrowRight, ArrowUpRight, ArrowDownRight,
  Sparkles, Check, ChevronDown, ChevronUp, Code2, Terminal, Copy,
  CheckCheck, Layers, Building2, BarChart3, Clock, Lock, ShieldAlert,
  Play, Laptop, Star, FileDown, RefreshCw, Cpu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export function InteractiveHomeView() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly")
  const [activeDemoTab, setActiveDemoTab] = useState<"audit" | "keywords" | "rankings" | "ai">("audit")
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [copiedCode, setCopiedCode] = useState(false)

  const copyApiSample = () => {
    navigator.clipboard.writeText(`curl -X POST https://topseotool.net/api/v1/audit \\
  -H "Authorization: Bearer sec_live_9f83..." \\
  -H "Content-Type: application/json" \\
  -d '{"domain": "example.com", "maxPages": 500}'`)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const faqs = [
    {
      q: "How does TOPSEOTOOL differ from legacy tools like Semrush or Ahrefs?",
      a: "Unlike legacy platforms built solely for traditional 10 blue links, TOPSEOTOOL is a dual-intelligence platform. It combines enterprise technical crawl diagnostics and rank tracking with automated AI Engine Optimization (AEO) tracking across ChatGPT, Perplexity, Gemini, and Claude.",
    },
    {
      q: "How accurate is the daily rank tracking?",
      a: "Our rank tracker executes localized, browser-rendered SERP queries across Google and Bing with real mobile and desktop user agents in over 190 countries, capturing featured snippets, local packs, and position movements without IP blocks or cached approximations.",
    },
    {
      q: "Can I generate automated white-label PDF reports for my agency clients?",
      a: "Yes! Our Agency and Professional tiers allow you to fully customize reports with your agency logo, brand colors, custom notes, and scheduled automated email delivery to clients on weekly or monthly cadences.",
    },
    {
      q: "Is there an API available for custom integrations?",
      a: "Yes. We offer a full REST v1 developer API with webhooks, API key rotation, granular scopes, and high rate limits allowing you to trigger audits, pull ranking histories, and sync keyword metrics into your internal dashboards.",
    },
    {
      q: "Do I need to enter a credit card to get started?",
      a: "No. You can start completely free with no credit card required. You will instantly get access to crawl your site, research keywords, and evaluate your brand visibility.",
    },
    {
      q: "Can I cancel or change my plan anytime?",
      a: "Absolutely. You can upgrade, downgrade, or cancel your subscription at any time directly through the billing portal with zero lock-in or cancellation penalties.",
    },
  ]

  return (
    <div className="flex flex-col w-full">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. HERO SECTION */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/30 text-xs font-semibold text-foreground animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Next-Generation SEO &amp; AI Search Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance max-w-5xl mx-auto leading-[1.08] text-foreground">
            The SEO Intelligence Platform Built for Serious Growth
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto text-balance leading-relaxed">
            Audit websites, discover profitable keywords, track rankings, analyze competitors and optimize content from one powerful SEO platform.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              className="w-full sm:w-auto h-12 px-8 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm gap-2"
              asChild
            >
              <Link href="/signup">
                Start Free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-12 px-8 text-sm font-medium border-border hover:bg-accent"
              asChild
            >
              <Link href="/dashboard">
                Explore Platform
              </Link>
            </Button>
          </div>

          {/* Trust proof bar */}
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-2 flex-wrap">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Instant automated crawl
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 14-day free Pro trial
            </span>
          </div>

          {/* Interactive Hero UI Preview (High Information Density) */}
          <div className="pt-8 max-w-5xl mx-auto">
            <div className="rounded-xl border border-border/80 bg-card p-3 sm:p-5 shadow-xl text-left space-y-4">
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                  </div>
                  <span className="text-xs font-mono font-medium text-muted-foreground ml-2">
                    topseotool.net • Production Workspace Cockpit
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-500">
                  ● 200 OK • Live Sync
                </Badge>
              </div>

              {/* Quick Hero Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg border border-border/60 bg-muted/15">
                  <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">Health Score</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-bold font-mono">94</span>
                    <span className="text-[11px] font-semibold text-emerald-500 font-mono">+6 pts</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border/60 bg-muted/15">
                  <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">Tracked Terms</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-bold font-mono">142</span>
                    <span className="text-[11px] font-semibold text-emerald-500 font-mono">24 in Top 3</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border/60 bg-muted/15">
                  <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">AI Visibility</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-bold font-mono">88%</span>
                    <span className="text-[11px] font-semibold text-emerald-500 font-mono">ChatGPT / Perplexity</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border/60 bg-muted/15">
                  <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">Referring Domains</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-bold font-mono">1,420</span>
                    <span className="text-[11px] font-semibold text-muted-foreground font-mono">DA 68 avg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. TRUSTED BY SECTION */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="py-10 border-b border-border/40 bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Trusted by growth teams, agency founders &amp; modern SEO leaders
          </p>
          <div className="flex items-center justify-center gap-8 sm:gap-14 flex-wrap opacity-70 grayscale hover:grayscale-0 transition-all text-sm sm:text-base font-bold tracking-tight text-foreground font-mono">
            <span>STRIPE</span>
            <span>VERCEL</span>
            <span>SUPABASE</span>
            <span>LINEAR</span>
            <span>RAMP</span>
            <span>WEBFLOW</span>
            <span>RETOOL</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 3. SEO PLATFORM OVERVIEW */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section id="overview" className="py-16 sm:py-20 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="outline" className="text-xs">Unified Platform</Badge>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Replace 5 Fragmented Tools with One Cohesive Engine
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Stop juggling disconnected spreadsheets, crawler tools, and rank tracking scripts. TOPSEOTOOL unites technical crawls, SERP radar, backlink intelligence, and LLM search visibility under a single enterprise roof.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-lg border border-border/70 bg-card space-y-2">
              <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center text-foreground font-bold">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
              </div>
              <h3 className="font-bold text-base text-foreground">1. Technical Foundation</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Asynchronous background crawler testing 100+ SEO factors, Core Web Vitals, indexability, structured data schema, and crawl budgets.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-border/70 bg-card space-y-2">
              <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center text-foreground font-bold">
                <TrendingUp className="h-5 w-5 text-indigo-500" />
              </div>
              <h3 className="font-bold text-base text-foreground">2. SERP &amp; Keyword Radar</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Daily position movements, intent clustering, keyword difficulty, and instant drop alerts before traffic loss hits your revenue.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-border/70 bg-card space-y-2">
              <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center text-foreground font-bold">
                <Brain className="h-5 w-5 text-sky-500" />
              </div>
              <h3 className="font-bold text-base text-foreground">3. AI Engine Optimization (AEO)</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Track how generative assistants like ChatGPT, Perplexity, Gemini, and Claude mention and cite your brand for high-intent queries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 4. FEATURE GRID */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 border-b border-border/40 bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="outline" className="text-xs">Feature Spectrum</Badge>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Engineered for Speed, Precision &amp; Scale
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Everything high-velocity teams need to outrank competitors and capture search demand.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-5 rounded-lg border border-border/80 bg-card space-y-2">
              <Globe className="h-5 w-5 text-emerald-500" />
              <h4 className="font-bold text-sm text-foreground">Deep Site Crawler</h4>
              <p className="text-xs text-muted-foreground">Crawls JavaScript-rendered applications, evaluates canonical tags, headers, redirects, and broken links.</p>
            </div>

            <div className="p-5 rounded-lg border border-border/80 bg-card space-y-2">
              <Search className="h-5 w-5 text-indigo-500" />
              <h4 className="font-bold text-sm text-foreground">Keyword Intent Explorer</h4>
              <p className="text-xs text-muted-foreground">Analyze search volume, CPC, keyword difficulty, and intent groups across 200M+ keywords globally.</p>
            </div>

            <div className="p-5 rounded-lg border border-border/80 bg-card space-y-2">
              <TrendingUp className="h-5 w-5 text-amber-500" />
              <h4 className="font-bold text-sm text-foreground">Daily SERP Radar</h4>
              <p className="text-xs text-muted-foreground">Track keyword rankings daily across Google, Bing, and mobile devices with position delta alerts.</p>
            </div>

            <div className="p-5 rounded-lg border border-border/80 bg-card space-y-2">
              <Users2 className="h-5 w-5 text-sky-500" />
              <h4 className="font-bold text-sm text-foreground">Competitor Domain Gap</h4>
              <p className="text-xs text-muted-foreground">Compare keyword overlap, discover rival content gaps, and analyze competitor backlink growth.</p>
            </div>

            <div className="p-5 rounded-lg border border-border/80 bg-card space-y-2">
              <Brain className="h-5 w-5 text-violet-500" />
              <h4 className="font-bold text-sm text-foreground">AI Search Citation Tracking</h4>
              <p className="text-xs text-muted-foreground">Monitor citations in Perplexity, ChatGPT, Claude, and Gemini with sentiment confidence scores.</p>
            </div>

            <div className="p-5 rounded-lg border border-border/80 bg-card space-y-2">
              <FileText className="h-5 w-5 text-brand" />
              <h4 className="font-bold text-sm text-foreground">Automated White-Label Reports</h4>
              <p className="text-xs text-muted-foreground">Compile executive PDF reports branded with your agency colors and logo, delivered on schedule.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 5. PRODUCT SCREENSHOTS / INTERACTIVE DEMOS */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="outline" className="text-xs">Interactive Preview</Badge>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Experience the Interface
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Fast, data-dense, minimalist views designed for professional workflows.
            </p>
          </div>

          {/* Interactive Demo Tabs */}
          <div className="flex items-center justify-center gap-2 border-b border-border/40 pb-3 flex-wrap">
            {[
              { id: "audit", label: "Site Audit Diagnostics" },
              { id: "keywords", label: "Keyword Explorer" },
              { id: "rankings", label: "SERP Radar" },
              { id: "ai", label: "AI Citations" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveDemoTab(tab.id as any)}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  activeDemoTab === tab.id
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Screenshot Card Container */}
          <div className="rounded-xl border border-border/80 bg-card shadow-lg p-4 sm:p-6">
            {activeDemoTab === "audit" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <span className="font-bold text-sm text-foreground">Technical Health Audit &amp; Core Web Vitals</span>
                  <Badge variant="success">Audit Passed (Score: 94/100)</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-muted/20 border border-border/60">
                    <span className="text-muted-foreground text-[10px] uppercase">Largest Contentful Paint</span>
                    <p className="text-xl font-bold text-emerald-500 mt-1">1.2s</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20 border border-border/60">
                    <span className="text-muted-foreground text-[10px] uppercase">Interaction to Next Paint</span>
                    <p className="text-xl font-bold text-emerald-500 mt-1">42ms</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20 border border-border/60">
                    <span className="text-muted-foreground text-[10px] uppercase">Cumulative Layout Shift</span>
                    <p className="text-xl font-bold text-emerald-500 mt-1">0.01</p>
                  </div>
                </div>
              </div>
            )}

            {activeDemoTab === "keywords" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="font-bold text-sm text-foreground">High-Intent Seed Keyword Expansion</span>
                  <span className="text-xs font-mono text-muted-foreground">Cluster: Commercial (82%)</span>
                </div>
                <div className="divide-y divide-border/30 text-xs font-mono">
                  <div className="py-2 flex items-center justify-between">
                    <span>enterprise seo audit software</span>
                    <span className="text-emerald-500 font-bold">14,200 /mo • KD 42%</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span>llm search engine citation tool</span>
                    <span className="text-emerald-500 font-bold">8,900 /mo • KD 38%</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span>real-time serp position tracking api</span>
                    <span className="text-emerald-500 font-bold">11,400 /mo • KD 51%</span>
                  </div>
                </div>
              </div>
            )}

            {activeDemoTab === "rankings" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="font-bold text-sm text-foreground">Multi-Engine SERP Radar</span>
                  <span className="text-xs font-mono text-muted-foreground">Google US (Desktop &amp; Mobile)</span>
                </div>
                <div className="divide-y divide-border/30 text-xs font-mono">
                  <div className="py-2 flex items-center justify-between">
                    <span>ai seo platform</span>
                    <span className="text-emerald-500 font-bold">#2 (+4 spots)</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span>automated technical crawler</span>
                    <span className="text-emerald-500 font-bold">#1 (Featured Snippet)</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span>backlink audit tool</span>
                    <span className="text-foreground font-bold">#4 (Stable)</span>
                  </div>
                </div>
              </div>
            )}

            {activeDemoTab === "ai" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="font-bold text-sm text-foreground">Generative Engine Citations</span>
                  <span className="text-xs font-mono text-muted-foreground">Perplexity &amp; ChatGPT Search</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/15 border border-border/50 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Perplexity Search Query: "Best Technical SEO Auditing Platforms"</span>
                    <Badge variant="success" className="text-[10px]">CITED #1</Badge>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    "TOPSEOTOOL provides comprehensive Core Web Vitals checks and automated weekly crawls."
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 6. SITE AUDIT DEEP DIVE */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 border-b border-border/40 bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <Badge variant="outline" className="text-xs">Module 01</Badge>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Deep Site Audit &amp; Technical Crawler
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Uncover technical roadblocks silently killing your organic search visibility. Our asynchronous crawler parses tens of thousands of pages, evaluating canonical loops, duplicate content, 4xx/5xx response anomalies, and structured data schemas.
            </p>
            <ul className="space-y-2 text-xs text-foreground font-medium pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 100+ automated technical SEO &amp; performance checks
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Real-time Core Web Vitals scoring (LCP, INP, CLS)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Scheduled recurring weekly audits with delta alert triggers
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card space-y-3 shadow-md font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <span className="font-bold text-foreground">Crawl Diagnostics</span>
              <span className="text-emerald-500">2,480 pages audited</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>200 OK Clean Pages</span>
                <span className="text-emerald-500">2,462 (99.2%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>301/308 Redirect Chains</span>
                <span className="text-amber-500">14 pages</span>
              </div>
              <div className="flex items-center justify-between">
                <span>404 Broken Internal Links</span>
                <span className="text-red-500">4 pages</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 7. KEYWORD RESEARCH DEEP DIVE */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="order-2 lg:order-1 p-5 rounded-xl border border-border bg-card space-y-3 shadow-md font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <span className="font-bold text-foreground">Search Intent Clusters</span>
              <span className="text-brand">Global 200M+ Index</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Commercial Terms</span>
                <span className="text-foreground font-bold">54% • Avg CPC $4.20</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Informational Questions</span>
                <span className="text-foreground font-bold">32% • Avg Vol 28K</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Transactional Searches</span>
                <span className="text-emerald-500 font-bold">14% • High Conversion</span>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-4">
            <Badge variant="outline" className="text-xs">Module 02</Badge>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Keyword Research &amp; Profitable Clustering
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Find untapped, low-difficulty search queries that drive actual pipeline and paying customers. Classify keywords by search intent, historical search volume, and estimated paid cost-per-click.
            </p>
            <ul className="space-y-2 text-xs text-foreground font-medium pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Automated search intent classification (Commercial, Informational, Transactional)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Precise Keyword Difficulty (KD%) calibrated to actual Page 1 domain ratings
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> High-volume seed expansion and related question queries
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 8. RANK TRACKING DEEP DIVE */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 border-b border-border/40 bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <Badge variant="outline" className="text-xs">Module 03</Badge>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Daily Rank Tracking &amp; Drop Detection
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Track thousands of keywords across desktop and mobile devices. Our scheduler monitors positions daily, recording position jumps, drops, and SERP feature captures like Featured Snippets and People Also Ask boxes.
            </p>
            <ul className="space-y-2 text-xs text-foreground font-medium pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Automated daily background rank tracking without manual syncs
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Instant alert notification triggers when keywords drop {'>='} 3 spots
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> City-level and country-level precision across 190+ geographies
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card space-y-3 shadow-md font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <span className="font-bold text-foreground">SERP Movement Radar</span>
              <span className="text-emerald-500 font-bold">+18 Net Positions Today</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Top 3 Rankings</span>
                <span className="text-emerald-500 font-bold">24 terms (+3)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Top 10 (Page 1)</span>
                <span className="text-foreground font-bold">78 terms (+8)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Featured Snippet Wins</span>
                <span className="text-indigo-500 font-bold">12 captured</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 9. COMPETITOR ANALYSIS DEEP DIVE */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="order-2 lg:order-1 p-5 rounded-xl border border-border bg-card space-y-3 shadow-md font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <span className="font-bold text-foreground">Domain Overlap Matrix</span>
              <span className="text-muted-foreground">3 Rivals Monitored</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Competitor A (Rival A)</span>
                <span className="text-foreground font-bold">42% Keyword Gap (1,240 terms)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Competitor B (Rival B)</span>
                <span className="text-foreground font-bold">28% Keyword Gap (810 terms)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shared Backlink Prospects</span>
                <span className="text-emerald-500 font-bold">340 high-DA opportunities</span>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-4">
            <Badge variant="outline" className="text-xs">Module 04</Badge>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Competitor Intelligence &amp; Content Gap
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Deconstruct your competitors' organic playbook. Spot the exact high-converting keywords they rank for that you don't, benchmark their technical health, and identify referring domains linking to them.
            </p>
            <ul className="space-y-2 text-xs text-foreground font-medium pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Side-by-side keyword overlap and content gap matrix
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Real-time alerts when competitors gain or lose top rankings
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Shared referring domain &amp; link intersection discovery
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 10. AI CONTENT OPTIMIZATION */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 border-b border-border/40 bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <Badge variant="outline" className="text-xs">Module 05</Badge>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              AI Content Optimization &amp; AEO Engine
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Optimize content to rank on Google while earning citations inside ChatGPT, Perplexity, Claude, and Gemini. Real-time NLP scoring evaluates content depth, question answering, and structured schema integrity.
            </p>
            <ul className="space-y-2 text-xs text-foreground font-medium pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Real-time NLP readability and topical salience scores
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> `llms.txt` generator ensuring modern AI crawlers index key pages
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Citation frequency and sentiment tracking across top LLMs
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card space-y-3 shadow-md font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <span className="font-bold text-foreground">NLP Content Score</span>
              <span className="text-emerald-500 font-bold">92 / 100 (Optimal)</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Topical Keyword Density</span>
                <span className="text-emerald-500">100% Core Terms Covered</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Generative AI Citation Confidence</span>
                <span className="text-emerald-500">High (89%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Structured FAQ / Schema</span>
                <span className="text-emerald-500">Validated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 11. AGENCY FEATURES */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="outline" className="text-xs">Agency Operations</Badge>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Built for Modern Agencies &amp; Consultants
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Deliver high-value recurring reporting that justifies premium client retainers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-lg border border-border/70 bg-card space-y-2">
              <Building2 className="h-5 w-5 text-indigo-500" />
              <h4 className="font-bold text-sm text-foreground">100% White-Label Branding</h4>
              <p className="text-xs text-muted-foreground">Upload your agency logo, customize accent colors, and serve dashboards on your own custom subdomain.</p>
            </div>

            <div className="p-5 rounded-lg border border-border/70 bg-card space-y-2">
              <Clock className="h-5 w-5 text-emerald-500" />
              <h4 className="font-bold text-sm text-foreground">Automated Scheduled Reports</h4>
              <p className="text-xs text-muted-foreground">Schedule beautiful executive PDF summaries to automatically email to clients weekly or monthly.</p>
            </div>

            <div className="p-5 rounded-lg border border-border/70 bg-card space-y-2">
              <Users2 className="h-5 w-5 text-sky-500" />
              <h4 className="font-bold text-sm text-foreground">Multi-Tenant RBAC Permissions</h4>
              <p className="text-xs text-muted-foreground">Assign client stakeholders read-only access to their specific projects while keeping agency settings private.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 12. DEVELOPER API */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 border-b border-border/40 bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <Badge variant="outline" className="text-xs">Developer Platform</Badge>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Production-Grade REST API &amp; Webhooks
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Integrate technical SEO audits, keyword research, and rank tracking directly into your CMS, internal SaaS tools, or data warehouse with clean JSON REST endpoints.
            </p>
            <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
              <span>• 99.99% Uptime SLA</span>
              <span>• Scoped API Keys</span>
              <span>• Webhook Event Streams</span>
            </div>
            <Button size="sm" variant="outline" className="gap-2 text-xs border-border" asChild>
              <Link href="/developers">
                <Code2 className="h-3.5 w-3.5" /> View API Documentation
              </Link>
            </Button>
          </div>

          {/* Code snippet card */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-lg text-xs font-mono relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-border/60 text-muted-foreground">
              <span className="flex items-center gap-1.5 font-semibold text-foreground">
                <Terminal className="h-3.5 w-3.5" /> POST /api/v1/audit
              </span>
              <button
                onClick={copyApiSample}
                className="flex items-center gap-1 text-[11px] hover:text-foreground transition-colors"
              >
                {copiedCode ? <CheckCheck className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedCode ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="p-3 text-muted-foreground overflow-x-auto leading-relaxed text-[11px]">
{`curl -X POST https://topseotool.net/api/v1/audit \\
  -H "Authorization: Bearer sec_live_9f83..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "domain": "example.com",
    "maxPages": 500
  }'`}
            </pre>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 13. PRICING SECTION */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-16 sm:py-20 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="outline" className="text-xs">Transparent Plans</Badge>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Predictable Pricing That Scales With You
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              No hidden fees, no per-keyword gouging. Start free and upgrade as your organic footprint expands.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="flex items-center justify-center gap-3 pt-3">
              <span className={`text-xs font-semibold ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>
                Monthly Billing
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                aria-label="Toggle annual billing"
                className="w-12 h-6 rounded-full bg-muted border border-border/80 p-0.5 relative transition-colors"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-primary transition-transform ${
                    billingCycle === "yearly" ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
              <span className={`text-xs font-semibold flex items-center gap-1.5 ${billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"}`}>
                Annual Billing
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                  Save 20%
                </span>
              </span>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Starter */}
            <div className="p-6 rounded-xl border border-border/80 bg-card flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <span className="font-bold text-base text-foreground">Starter</span>
                <p className="text-xs text-muted-foreground">Essential toolkit for independent sites and freelance consultants.</p>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-3xl font-extrabold text-foreground">
                    ${billingCycle === "yearly" ? "24" : "29"}
                  </span>
                  <span className="text-xs text-muted-foreground">/mo</span>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                  <li className="flex items-center gap-2 text-foreground font-medium"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> 3 website projects</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> 25 audits / month</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> 100 tracked keywords</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> 250 keyword searches</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> 5 executive reports</li>
                </ul>
              </div>
              <Button variant="outline" className="w-full text-xs font-semibold" asChild>
                <Link href="/signup">Start Free Trial</Link>
              </Button>
            </div>

            {/* Pro (Highlighted) */}
            <div className="p-6 rounded-xl border-2 border-primary bg-card flex flex-col justify-between space-y-5 shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground shadow-sm">
                  Most Popular
                </span>
              </div>
              <div className="space-y-3">
                <span className="font-bold text-base text-foreground">Professional</span>
                <p className="text-xs text-muted-foreground">For growing marketing teams, SaaS, and dedicated SEO leads.</p>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-3xl font-extrabold text-foreground">
                    ${billingCycle === "yearly" ? "64" : "79"}
                  </span>
                  <span className="text-xs text-muted-foreground">/mo</span>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                  <li className="flex items-center gap-2 text-foreground font-medium"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> 10 website projects</li>
                  <li className="flex items-center gap-2 text-foreground font-medium"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> 100 audits / month</li>
                  <li className="flex items-center gap-2 text-foreground font-medium"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> 500 tracked keywords</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> AI Citation &amp; LLM tracking</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Daily rank drop alerts</li>
                </ul>
              </div>
              <Button variant="default" className="w-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <Link href="/signup">Start Pro Trial</Link>
              </Button>
            </div>

            {/* Agency */}
            <div className="p-6 rounded-xl border border-border/80 bg-card flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <span className="font-bold text-base text-foreground">Agency</span>
                <p className="text-xs text-muted-foreground">Built for client management, white-label portals, and custom reporting.</p>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-3xl font-extrabold text-foreground">
                    ${billingCycle === "yearly" ? "159" : "199"}
                  </span>
                  <span className="text-xs text-muted-foreground">/mo</span>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                  <li className="flex items-center gap-2 text-foreground font-medium"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> 30 website projects</li>
                  <li className="flex items-center gap-2 text-foreground font-medium"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> 100% White-label reports</li>
                  <li className="flex items-center gap-2 text-foreground font-medium"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> 2,000 tracked keywords</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Client access permissions</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Unlimited team members</li>
                </ul>
              </div>
              <Button variant="outline" className="w-full text-xs font-semibold" asChild>
                <Link href="/signup">Start Agency Trial</Link>
              </Button>
            </div>

            {/* Enterprise */}
            <div className="p-6 rounded-xl border border-border/80 bg-card flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <span className="font-bold text-base text-foreground">Enterprise</span>
                <p className="text-xs text-muted-foreground">Unlimited scale, dedicated crawling infrastructure, and REST API access.</p>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-3xl font-extrabold text-foreground">
                    ${billingCycle === "yearly" ? "399" : "499"}
                  </span>
                  <span className="text-xs text-muted-foreground">/mo</span>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                  <li className="flex items-center gap-2 text-foreground font-medium"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Unlimited website projects</li>
                  <li className="flex items-center gap-2 text-foreground font-medium"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Full REST API &amp; Webhooks</li>
                  <li className="flex items-center gap-2 text-foreground font-medium"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> 10,000 tracked keywords</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Dedicated account manager</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> 99.99% uptime SLA guarantee</li>
                </ul>
              </div>
              <Button variant="outline" className="w-full text-xs font-semibold" asChild>
                <Link href="/signup">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 14. TESTIMONIALS */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 border-b border-border/40 bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="outline" className="text-xs">Customer Results</Badge>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Proven by Industry Leaders
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Real results achieved by high-performing digital marketing and SEO teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-border/70 bg-card space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-foreground leading-relaxed">
                  "We consolidated our technical audits, rank tracking, and client reporting into TOPSEOTOOL. Our agency saved over $1,400 per month on fragmented licenses while delivering cleaner, branded reports to our clients."
                </p>
              </div>
              <div className="pt-2 border-t border-border/40">
                <span className="font-bold text-xs text-foreground block">Marcus Vance</span>
                <span className="text-[11px] text-muted-foreground">Founder &amp; Managing Director, Vance Digital Agency</span>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-border/70 bg-card space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-foreground leading-relaxed">
                  "The AI Citation Tracking is revolutionary. Knowing exactly when Perplexity and ChatGPT recommend our SaaS vs our competitors gave us a first-mover advantage that doubled our organic trial signups."
                </p>
              </div>
              <div className="pt-2 border-t border-border/40">
                <span className="font-bold text-xs text-foreground block">Elena Rostova</span>
                <span className="text-[11px] text-muted-foreground">VP of Growth Marketing, CloudScale SaaS</span>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-border/70 bg-card space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-foreground leading-relaxed">
                  "The scheduled crawler caught an accidental canonical loop that would have de-indexed our core landing page before it caused ranking damage. The automated background alert paid for the annual plan in 1 day."
                </p>
              </div>
              <div className="pt-2 border-t border-border/40">
                <span className="font-bold text-xs text-foreground block">David Chen</span>
                <span className="text-[11px] text-muted-foreground">Head of Organic Search, FinTech Global</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 15. FAQ ACCORDION */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 border-b border-border/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="outline" className="text-xs">FAQ</Badge>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Everything you need to know about the platform, data accuracy, and plans.
            </p>
          </div>

          <div className="divide-y divide-border/60 border-y border-border/60">
            {faqs.map((faq, idx) => (
              <div key={faq.q} className="py-4">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left font-semibold text-sm text-foreground hover:text-primary transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                  )}
                </button>
                {openFaq === idx && (
                  <p className="mt-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed animate-in fade-in-0 duration-150">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 16. FINAL CTA BANNER */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-foreground text-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-balance leading-tight">
            The SEO Intelligence Platform Built for Serious Growth
          </h2>
          <p className="text-base sm:text-lg text-background/80 max-w-2xl mx-auto text-balance">
            Audit websites, discover profitable keywords, track rankings, analyze competitors and optimize content from one powerful SEO platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              className="w-full sm:w-auto h-12 px-8 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
              asChild
            >
              <Link href="/signup">
                Start Free <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-12 px-8 text-sm font-medium border-background/20 text-foreground bg-background hover:bg-background/90"
              asChild
            >
              <Link href="/dashboard">Explore Platform</Link>
            </Button>
          </div>
          <p className="text-xs text-background/60 pt-1">
            Free forever tier available • Instant setup • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  )
}
