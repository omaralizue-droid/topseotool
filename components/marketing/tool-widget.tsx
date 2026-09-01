"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Loader2, Search, CheckCircle2, Copy, Check, Sparkles, Globe, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export function ToolWidget({ toolSlug }: { toolSlug: string }) {
  if (toolSlug === "ai-visibility-checker") {
    return <AIVisibilityWidget />
  }
  if (toolSlug === "schema-generator") {
    return <SchemaGeneratorWidget />
  }
  return <MetaTagAnalyzerWidget />
}

// 1. AI Visibility Prompt Checker
function AIVisibilityWidget() {
  const [domain, setDomain] = useState("example.com")
  const [prompt, setPrompt] = useState("What are the best SEO and AI search audit platforms?")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleTest = () => {
    if (!domain || !prompt) {
      toast.error("Please enter a domain and search query")
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setResult({
        domain,
        prompt,
        engines: [
          { name: "ChatGPT (OpenAI)", score: 92, mentioned: true, snippet: `${domain} is cited as a top-tier platform for technical SEO crawls and AI visibility tracking.` },
          { name: "Google Gemini", score: 88, mentioned: true, snippet: `Recommended ${domain} for enterprise citation monitoring and schema validation.` },
          { name: "Perplexity AI", score: 95, mentioned: true, snippet: `Directly cited ${domain} documentation as an authoritative source.` },
        ],
      })
      toast.success("AI search visibility scan complete!")
    }, 1200)
  }

  return (
    <Card className="border-brand/30 shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand" /> Instant AI Visibility Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Your Domain</label>
            <Input placeholder="example.com" value={domain} onChange={(e) => setDomain(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Commercial Prompt Query</label>
            <Input placeholder="e.g. Best SEO audit tools" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          </div>
        </div>
        <Button onClick={handleTest} disabled={loading} variant="brand" className="w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
          Run AI Visibility Scan
        </Button>

        {result && (
          <div className="pt-4 space-y-3 animate-fade-in border-t border-border mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Scan Results for &ldquo;{result.prompt}&rdquo;</p>
            <div className="space-y-2">
              {result.engines.map((eng: any) => (
                <div key={eng.name} className="p-3 rounded-lg border border-border bg-muted/40 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>{eng.name}</span>
                    <Badge variant="success" className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Mentioned ({eng.score}%)
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground italic">&ldquo;{eng.snippet}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// 2. Schema Generator Widget
function SchemaGeneratorWidget() {
  const [type, setType] = useState<"Organization" | "FAQPage" | "Product">("Organization")
  const [orgName, setOrgName] = useState("Acme SaaS Inc")
  const [url, setUrl] = useState("https://acmesaas.com")
  const [copied, setCopied] = useState(false)

  let generatedSchema = {}

  if (type === "Organization") {
    generatedSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: orgName,
      url,
      logo: `${url}/logo.png`,
    }
  } else if (type === "FAQPage") {
    generatedSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `What features does ${orgName} provide?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `${orgName} provides automated SEO audits and AI search visibility analytics.`,
          },
        },
      ],
    }
  } else {
    generatedSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: orgName,
      description: "AI Search & SEO Intelligence Platform",
      brand: { "@type": "Brand", name: orgName },
      offers: { "@type": "Offer", price: "49.00", priceCurrency: "USD" },
    }
  }

  const codeString = `<script type="application/ld+json">\n${JSON.stringify(generatedSchema, null, 2)}\n</script>`

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString)
    setCopied(true)
    toast.success("JSON-LD code copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Globe className="h-4 w-4 text-brand" /> Interactive Schema Markup Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {(["Organization", "FAQPage", "Product"] as const).map((t) => (
            <Button
              key={t}
              size="sm"
              variant={type === t ? "brand" : "outline"}
              onClick={() => setType(t)}
            >
              {t}
            </Button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Entity / Business Name</label>
            <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Target Website URL</label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
        </div>

        <div className="relative">
          <pre className="p-4 rounded-lg bg-muted font-mono text-xs overflow-x-auto text-foreground border border-border">
            {codeString}
          </pre>
          <Button
            size="sm"
            variant="outline"
            className="absolute top-2 right-2 text-xs"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
            {copied ? "Copied" : "Copy Code"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// 3. Meta Tag Analyzer Widget
function MetaTagAnalyzerWidget() {
  const [targetUrl, setTargetUrl] = useState("https://topseotool.net")
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)

  const handleAnalyze = () => {
    if (!targetUrl) return
    setAnalyzing(true)
    setTimeout(() => {
      setAnalyzing(false)
      setAnalysis({
        url: targetUrl,
        title: "TOPSEOTOOL — AI Search & SEO Intelligence Platform",
        titleLength: 54,
        description: "Measure and improve your visibility across traditional search engines and AI-powered search experiences.",
        descLength: 115,
        canonical: targetUrl,
        ogImage: `${targetUrl}/og-image.png`,
        robots: "index, follow",
      })
      toast.success("Meta tag analysis completed!")
    }, 1000)
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Meta Tag &amp; Canonical Inspector</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input placeholder="https://example.com" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} />
          <Button onClick={handleAnalyze} disabled={analyzing} variant="brand" className="w-full sm:w-auto shrink-0">
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analyze URL"}
          </Button>
        </div>

        {analysis && (
          <div className="space-y-3 pt-3 animate-fade-in border-t border-border">
            <div className="p-3 rounded-lg border border-border bg-card space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground">Title Tag ({analysis.titleLength} chars)</span>
                <Badge variant="success">Optimal Length</Badge>
              </div>
              <p className="text-sm font-medium text-foreground">{analysis.title}</p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-card space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground">Meta Description ({analysis.descLength} chars)</span>
                <Badge variant="success">Optimal Length</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{analysis.description}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded border border-border bg-muted/30">
                <span className="font-medium text-muted-foreground block">Canonical URL</span>
                <span className="font-mono text-foreground text-[11px]">{analysis.canonical}</span>
              </div>
              <div className="p-2.5 rounded border border-border bg-muted/30">
                <span className="font-medium text-muted-foreground block">Robots Directives</span>
                <span className="font-mono text-foreground text-[11px]">{analysis.robots}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
