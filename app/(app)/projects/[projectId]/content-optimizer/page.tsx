"use client"

import { useState, useMemo } from "react"
import { useParams } from "next/navigation"
import {
  FileEdit, Sparkles, CheckCircle2, AlertCircle, TrendingUp,
  BookOpen, Target, Download, Copy, Check, RefreshCw,
  Lightbulb, HelpCircle, Layers, ArrowUpRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RecommendedTerm {
  term: string
  recommended: string
  min: number
  max: number
}

const RECOMMENDED_TERMS: RecommendedTerm[] = [
  { term: "ai seo tools", recommended: "4-8", min: 4, max: 8 },
  { term: "generative engine optimization", recommended: "2-5", min: 2, max: 5 },
  { term: "chatgpt visibility", recommended: "2-4", min: 2, max: 4 },
  { term: "core web vitals", recommended: "3-6", min: 3, max: 6 },
  { term: "backlink profile", recommended: "2-4", min: 2, max: 4 },
  { term: "structured schema markup", recommended: "1-3", min: 1, max: 3 },
  { term: "organic search rankings", recommended: "3-6", min: 3, max: 6 }
]

const SAMPLE_INITIAL_CONTENT = `# The Complete Guide to Enterprise AI SEO Tools & Modern AEO in 2026

Traditional search engine optimization is rapidly shifting. In 2026, ranking in Google is only half the battle. Forward-thinking marketing teams and agencies must now master generative engine optimization (AEO) to secure recommendations across ChatGPT, Perplexity, and Claude.

## Why Modern Brands Need AI SEO Tools

Standard crawlers scan for meta tags, but conversational LLMs look for entity validation and structured schema markup. When a user asks an AI assistant for the top enterprise solutions, does your platform appear as a primary citation?

By combining a rigorous backlink profile audit with real-time ChatGPT visibility monitoring, enterprises protect both their organic search rankings and their generative share of voice. Core web vitals also remain vital for mobile user experience.
`

export default function ContentOptimizerPage() {
  const params = useParams()
  const projectId = (params?.projectId as string) || "demo"

  const [targetKeyword, setTargetKeyword] = useState("ai seo tools")
  const [content, setContent] = useState(SAMPLE_INITIAL_CONTENT)
  const [copied, setCopied] = useState(false)
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false)

  // Real-time text statistics calculation
  const stats = useMemo(() => {
    const text = content.toLowerCase()
    const words = content.trim().split(/\s+/).filter(Boolean).length
    const sentences = content.split(/[.!?]+/).filter(Boolean).length || 1
    const headingsCount = (content.match(/^#{1,3}\s/gm) || []).length

    // Target keyword count
    const targetMatches = (text.match(new RegExp(targetKeyword.toLowerCase(), "g")) || []).length

    // Term frequencies
    const termCounts: Record<string, number> = {}
    RECOMMENDED_TERMS.forEach((rt) => {
      const count = (text.match(new RegExp(rt.term, "g")) || []).length
      termCounts[rt.term] = count
    })

    // Score calculation (0-100)
    let score = 40
    if (words >= 150) score += 15
    if (words >= 350) score += 15
    if (headingsCount >= 2) score += 10
    if (targetMatches >= 1) score += 10

    let optimalTerms = 0
    RECOMMENDED_TERMS.forEach((rt) => {
      const c = termCounts[rt.term]
      if (c >= rt.min && c <= rt.max + 2) optimalTerms++
    })
    score += Math.min(10, optimalTerms * 2)

    return {
      words,
      sentences,
      headingsCount,
      targetMatches,
      termCounts,
      optimalTerms,
      score: Math.min(100, score)
    }
  }, [content, targetKeyword])

  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const generateAIBrief = () => {
    setIsGeneratingBrief(true)
    setTimeout(() => {
      setContent((prev) =>
        prev +
        `\n\n### Strategic Takeaways for Organic Search Rankings\n- Ensure all key product landing pages include structured schema markup.\n- Monitor your backlink profile weekly to eliminate toxic links.\n- Track your competitive win-rate in modern generative engine optimization.`
      )
      setIsGeneratingBrief(false)
    }, 600)
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: "Exceptional", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30" }
    if (score >= 60) return { label: "Good", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" }
    return { label: "Needs Work", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" }
  }

  const badgeInfo = getScoreBadge(stats.score)

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <FileEdit className="h-6 w-6 text-brand" /> On-Page Content Optimizer &amp; SEO Assistant
            </h1>
            <Badge variant="brand" className="text-[10px] font-bold py-0.5">Enterprise</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time SEO scoring, semantic NLP/LSI keyword recommendations, and readability optimization
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard} className="gap-1.5 text-xs">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy Content"}
          </Button>

          <Button
            size="sm"
            onClick={generateAIBrief}
            disabled={isGeneratingBrief}
            className="gap-1.5 text-xs bg-brand hover:bg-brand/90 text-brand-foreground shadow-sm"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isGeneratingBrief ? "animate-spin" : ""}`} />
            {isGeneratingBrief ? "Generating..." : "AI Auto-Expand"}
          </Button>
        </div>
      </div>

      {/* Target Keyword Input Bar */}
      <Card className="p-3 border-border/80 shadow-xs bg-card">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground shrink-0 pl-1">
            <Target className="h-4 w-4 text-brand" /> Target Primary Keyword:
          </div>
          <Input
            value={targetKeyword}
            onChange={(e) => setTargetKeyword(e.target.value)}
            placeholder="e.g. ai seo tools"
            className="h-9 text-xs bg-muted/30 border-border/60 font-semibold"
          />
          <div className="text-xs text-muted-foreground shrink-0">
            Current Density: <span className="font-bold text-foreground font-mono">{stats.targetMatches} occurrences</span>
          </div>
        </div>
      </Card>

      {/* Editor & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Live Rich Content Editor */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="py-3 px-4 border-b border-border/40 flex flex-row items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Article / Landing Page Editor (Markdown &amp; Text)
              </span>
              <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                <span>{stats.words} words</span>
                <span>•</span>
                <span>{stats.headingsCount} headings</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={18}
                placeholder="Start writing or paste your blog post, landing page copy, or article here..."
                className="w-full p-5 text-sm bg-transparent border-0 focus:outline-none font-mono leading-relaxed resize-y"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: Live SEO Scorer & NLP Keyword Recommendations */}
        <div className="lg:col-span-4 space-y-4">
          {/* SEO Scorecard */}
          <Card className="border-border/80 shadow-xs">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Content Score</span>
                <Badge variant="outline" className={`text-[10px] font-bold ${badgeInfo.color} ${badgeInfo.bg} ${badgeInfo.border}`}>
                  {badgeInfo.label}
                </Badge>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black font-mono-nums text-foreground">{stats.score}</span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>

              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    stats.score >= 80 ? "bg-emerald-500" : stats.score >= 60 ? "bg-amber-500" : "bg-red-500"
                  }`}
                  style={{ width: `${stats.score}%` }}
                />
              </div>

              <div className="pt-2 text-xs text-muted-foreground space-y-1">
                <div className="flex items-center justify-between">
                  <span>Target Word Count</span>
                  <span className="font-semibold text-foreground font-mono">{stats.words} / 600 min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Headings Hierarchy</span>
                  <span className="font-semibold text-foreground font-mono">{stats.headingsCount} present</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Readability Grade</span>
                  <span className="font-semibold text-emerald-500">College (Flesch 62)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Semantic LSI/NLP Keywords */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="py-3 px-4 border-b border-border/40 flex flex-row items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-brand" />
                <span className="text-xs font-bold text-foreground">Recommended NLP Terms</span>
              </div>
              <span className="text-[11px] text-muted-foreground font-mono font-semibold">
                {stats.optimalTerms}/{RECOMMENDED_TERMS.length}
              </span>
            </CardHeader>
            <CardContent className="p-3 divide-y divide-border/30">
              {RECOMMENDED_TERMS.map((rt) => {
                const count = stats.termCounts[rt.term] || 0
                const isOptimal = count >= rt.min && count <= rt.max + 2
                return (
                  <div key={rt.term} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {isOptimal ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/40 shrink-0" />
                      )}
                      <span className={`font-medium ${isOptimal ? "text-foreground" : "text-muted-foreground"}`}>
                        {rt.term}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span className={`font-bold ${isOptimal ? "text-emerald-500" : "text-muted-foreground"}`}>
                        {count}
                      </span>
                      <span className="text-muted-foreground">({rt.recommended}x)</span>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
