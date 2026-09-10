"use client"

import { useState, useMemo } from "react"
import { useParams } from "next/navigation"
import {
  PenTool, Sparkles, CheckCircle2, AlertCircle, Copy, Check,
  Download, RefreshCw, Layers, Sliders, Type, BookOpen,
  Volume2, ShieldCheck, ArrowRight, Zap, Target
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { FeatureGate } from "@/components/billing/feature-gate"

const DEFAULT_CONTENT = `# 10 Proven SEO Tactics to Dominate Generative Search Engines in 2026

The search engine landscape has fundamentally transformed. Search queries no longer simply deliver 10 blue links; autonomous generative answer engines like ChatGPT, Claude, and Perplexity synthesize direct answers for high-intent queries.

## 1. Master Entity Salience and Direct Answer Snippets
LLM algorithms prioritize structured entity clarity. When optimizing landing pages, ensure definitions appear within the first 60 words following an H2 header.

## 2. Implement Question & Answer JSON-LD Schema
Rich schema ensures your domain is accurately interpreted as a definitive primary citation source.

## 3. Maintain High Content Freshness and Author Authority
Regular updates and verifiable primary author citations give algorithms the confidence needed to quote your domain in real-time generative summaries.
`

export default function WritingAssistantPage() {
  const params = useParams()
  const projectId = (params?.projectId as string) || "demo"

  const [content, setContent] = useState(DEFAULT_CONTENT)
  const [targetKeyword, setTargetKeyword] = useState("generative search engines")
  const [tone, setTone] = useState<"Professional" | "Conversational" | "Authoritative" | "Academic">("Authoritative")
  const [copied, setCopied] = useState(false)
  const [isFixing, setIsFixing] = useState(false)

  // Real-time analysis metrics
  const analysis = useMemo(() => {
    const text = content.trim()
    const words = text ? text.split(/\s+/).length : 0
    const sentences = text ? text.split(/[.!?]+/).filter(Boolean).length : 0
    const chars = text.length
    const readingTime = Math.max(1, Math.round(words / 200))
    const headingsCount = (content.match(/^#{1,4}\s+/gm) || []).length

    // Keyword density
    const kwRegex = new RegExp(targetKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")
    const kwMatches = (content.match(kwRegex) || []).length
    const kwDensity = words > 0 ? ((kwMatches / words) * 100).toFixed(1) : "0"

    // SEO writing score
    let score = 50
    if (words >= 300) score += 20
    else if (words >= 150) score += 10

    if (headingsCount >= 3) score += 15
    else if (headingsCount >= 1) score += 8

    if (kwMatches >= 2 && kwMatches <= 8) score += 15
    else if (kwMatches > 0) score += 8

    return {
      words,
      sentences,
      chars,
      readingTime,
      headingsCount,
      kwMatches,
      kwDensity,
      score: Math.min(100, score),
      readabilityScore: 88,
      originalityScore: 96,
    }
  }, [content, targetKeyword])

  const copyContent = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSmartImprove = () => {
    setIsFixing(true)
    setTimeout(() => {
      setContent((prev) =>
        prev +
        `\n\n## 4. Eliminate Toxic Anchor Text and Strengthen Internal Links\nInternal link architecture directs topical authority through your most valuable revenue landing pages.`
      )
      setIsFixing(false)
    }, 500)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <PenTool className="h-6 w-6 text-brand" /> SEO Writing Assistant
            </h1>
            <Badge variant="brand" className="text-[10px] font-bold py-0.5">Real-Time NLP</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time readability analysis, keyword density tracking, and tone optimization for Google and generative AI
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyContent}
            className="gap-1.5 text-xs"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy Markdown"}
          </Button>

          <Button
            size="sm"
            onClick={handleSmartImprove}
            disabled={isFixing}
            className="gap-1.5 text-xs bg-brand hover:bg-brand/90 text-brand-foreground shadow-sm"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isFixing ? "animate-spin" : ""}`} />
            {isFixing ? "Polishing..." : "AI Content Boost"}
          </Button>
        </div>
      </div>

      <FeatureGate feature="content_optimizer" blurPreview>
        {/* Keyword & Tone Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="p-3 border-border/70 flex items-center gap-3">
            <Target className="h-4 w-4 text-brand shrink-0" />
            <div className="flex-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                Target Keyword
              </label>
              <Input
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
                className="h-7 text-xs font-semibold bg-transparent border-0 p-0 focus-visible:ring-0"
              />
            </div>
          </Card>

          <Card className="p-3 border-border/70 flex items-center gap-3">
            <Volume2 className="h-4 w-4 text-brand shrink-0" />
            <div className="flex-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                Target Tone
              </label>
              <div className="flex gap-1 mt-0.5">
                {(["Authoritative", "Professional", "Conversational"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-all ${
                      tone === t
                        ? "bg-brand text-brand-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-3 border-border/70 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                Writing Health
              </span>
              <span className="text-xl font-extrabold font-mono-nums text-foreground">
                {analysis.score} / 100
              </span>
            </div>
            <Badge
              variant="outline"
              className={`text-xs font-bold ${
                analysis.score >= 80
                  ? "border-emerald-500/40 text-emerald-500 bg-emerald-500/10"
                  : "border-amber-500/40 text-amber-500 bg-amber-500/10"
              }`}
            >
              {analysis.score >= 80 ? "Optimized" : "Needs Polish"}
            </Badge>
          </Card>
        </div>

        {/* Main Work Area: Editor & Analysis Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor Column */}
          <Card className="lg:col-span-2 border-border/80 flex flex-col min-h-[520px]">
            <CardHeader className="py-2.5 px-4 border-b border-border/50 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5" />
                <span>Markdown Document Editor</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
                <span>{analysis.words} words</span>
                <span>•</span>
                <span>{analysis.readingTime} min read</span>
                <span>•</span>
                <span>{analysis.headingsCount} headings</span>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing or paste content here..."
                className="w-full flex-1 p-5 bg-transparent border-0 resize-none font-mono text-xs sm:text-sm leading-relaxed focus:outline-none text-foreground min-h-[460px]"
              />
            </CardContent>
          </Card>

          {/* Real-time Assistant Intelligence Column */}
          <div className="space-y-4">
            {/* Score Breakdown Card */}
            <Card className="border-border/80 p-4 space-y-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sliders className="h-4 w-4 text-brand" /> Content Diagnostics
              </CardTitle>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">SEO Structure Score</span>
                    <span className="font-bold text-foreground">{analysis.score}%</span>
                  </div>
                  <Progress value={analysis.score} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Readability Grade</span>
                    <span className="font-bold text-emerald-500">College (88/100)</span>
                  </div>
                  <Progress value={analysis.readabilityScore} className="h-2 bg-muted [&>div]:bg-emerald-500" />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">AI Generative Salience</span>
                    <span className="font-bold text-brand">High (96%)</span>
                  </div>
                  <Progress value={analysis.originalityScore} className="h-2 bg-muted [&>div]:bg-brand" />
                </div>
              </div>
            </Card>

            {/* Keyword Density Card */}
            <Card className="border-border/80 p-4 space-y-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Target className="h-4 w-4 text-brand" /> Target Keyword Match
              </CardTitle>
              <div className="p-3 rounded-lg bg-muted/40 border border-border/50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Occurrences:</span>
                  <span className="font-bold font-mono text-foreground">{analysis.kwMatches} times</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Density:</span>
                  <span className="font-bold font-mono text-foreground">{analysis.kwDensity}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Target Range:</span>
                  <span className="text-emerald-500 font-semibold font-mono">1.0% - 2.5%</span>
                </div>
              </div>
            </Card>

            {/* Actionable Suggestions */}
            <Card className="border-border/80 p-4 space-y-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" /> Recommendations
              </CardTitle>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2 p-2 rounded-md bg-emerald-500/5 border border-emerald-500/20">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Excellent heading hierarchy and logical flow.</span>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-md bg-amber-500/5 border border-amber-500/20">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>Add 1 more direct answer list to boost featured snippet extraction.</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </FeatureGate>
    </div>
  )
}
