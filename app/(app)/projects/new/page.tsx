"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  Globe, ArrowLeft, Sparkles, Loader2, ShieldCheck,
  TrendingUp, Users, Target, Search, Smartphone, Monitor,
  Layers, CheckCircle2, ChevronRight, HelpCircle
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { createProjectSchema, type CreateProjectInput } from "@/lib/validations"
import { useEntitlements } from "@/hooks/use-entitlements"
import { UpgradePromptModal } from "@/components/billing/upgrade-prompt-modal"

const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#3b82f6"]

const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
]

const LANGUAGES = [
  "English", "Spanish", "German", "French", "Italian", "Portuguese", "Dutch", "Japanese"
]

const SEARCH_ENGINES = [
  "Google", "Google Mobile", "Bing", "DuckDuckGo", "Yahoo"
]

export default function NewProjectPage() {
  const router = useRouter()
  const { limits, planKey } = useEntitlements()
  const [loading, setLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)

  const maxProjects = limits?.projects ?? 3
  const maxKeywords = limits?.monthly_rank_tracking_limit ?? limits?.trackedKeywords ?? 5000
  const maxCompetitors = limits?.competitor_domains_limit ?? limits?.competitorsPerProject ?? 10

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      domain: "",
      description: "",
      country: "United States",
      language: "English",
      searchEngine: "Google",
      device: "Desktop",
      keywordsCount: 5000,
      competitorsCount: 10,
      seedKeywords: "",
      seedCompetitors: "",
      color: COLORS[0],
    },
  })

  // Auto-fill project name when domain changes
  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (...event: any[]) => void) => {
    const val = e.target.value
    onChange(val)
    if (!form.getValues("name") && val.includes(".")) {
      const cleanName = val.replace(/^https?:\/\//, "").replace(/\/.*$/, "").split(".")[0]
      if (cleanName) {
        form.setValue("name", cleanName.charAt(0).toUpperCase() + cleanName.slice(1))
      }
    }
  }

  async function onSubmit(values: CreateProjectInput) {
    setLoading(true)
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          color: selectedColor,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error?.includes("limit reached") || data.error?.includes("upgrade")) {
          setUpgradeModalOpen(true)
        }
        toast.error(data.error ?? "Failed to create project")
        return
      }

      toast.success("SEO Project configured successfully!")
      router.push(`/projects/${data.data.id}`)
    } catch {
      toast.error("An unexpected error occurred while provisioning the project.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2 text-muted-foreground hover:text-foreground">
        <Link href="/projects">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to projects
        </Link>
      </Button>

      {/* Header */}
      <div className="pb-4 border-b border-border/50">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="brand" className="text-[10px] font-bold py-0.5">Wizard</Badge>
          <span className="text-xs text-muted-foreground">Workspace Project Configuration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Create New SEO Project
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Configure domain target, search engine preferences, rank tracking parameters, and competitor tracking.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Card 1: Core Domain & Identity */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="py-4 px-5 border-b border-border/50 bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Globe className="h-4 w-4 text-brand" /> 1. Target Website &amp; Identity
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                The primary domain you wish to audit, track, and optimize.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Primary Domain</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="example.com"
                            className="pl-9 h-9 text-xs font-semibold font-mono"
                            {...field}
                            onChange={(e) => handleDomainChange(e, field.onChange)}
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-[11px]">Domain without https:// (e.g. example.com)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Example Store" className="h-9 text-xs font-semibold" {...field} />
                      </FormControl>
                      <FormDescription className="text-[11px]">Friendly workspace display name</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Description <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                    <FormControl>
                      <Textarea placeholder="Client website, e-commerce store, or SaaS platform..." rows={2} className="text-xs" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel className="text-xs font-semibold block mb-2">Project Accent Color</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      aria-label={`Select color ${c}`}
                      className="w-7 h-7 rounded-full transition-transform hover:scale-110 shadow-xs"
                      style={{
                        background: c,
                        outline: selectedColor === c ? `3px solid ${c}` : "none",
                        outlineOffset: "2px"
                      }}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Targeting & Search Engine Environment */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="py-4 px-5 border-b border-border/50 bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Target className="h-4 w-4 text-brand" /> 2. Search Engine &amp; Geo-Targeting
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Precise country, language, search engine, and device for daily rank tracking.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Country */}
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Target Country</FormLabel>
                      <FormControl>
                        <select
                          className="w-full h-9 px-3 rounded-md bg-muted/30 border border-border/60 text-xs font-medium text-foreground focus:outline-none"
                          {...field}
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.name}>
                              {c.flag} {c.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Language */}
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Target Language</FormLabel>
                      <FormControl>
                        <select
                          className="w-full h-9 px-3 rounded-md bg-muted/30 border border-border/60 text-xs font-medium text-foreground focus:outline-none"
                          {...field}
                        >
                          {LANGUAGES.map((l) => (
                            <option key={l} value={l}>
                              {l}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Search Engine */}
                <FormField
                  control={form.control}
                  name="searchEngine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Search Engine</FormLabel>
                      <FormControl>
                        <select
                          className="w-full h-9 px-3 rounded-md bg-muted/30 border border-border/60 text-xs font-medium text-foreground focus:outline-none"
                          {...field}
                        >
                          {SEARCH_ENGINES.map((se) => (
                            <option key={se} value={se}>
                              {se}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Device */}
                <FormField
                  control={form.control}
                  name="device"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Target Device</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => field.onChange("Desktop")}
                            className={`flex items-center justify-center gap-2 h-9 rounded-md border text-xs font-semibold transition-all ${
                              field.value === "Desktop"
                                ? "border-brand bg-brand/10 text-brand"
                                : "border-border/60 text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            <Monitor className="h-3.5 w-3.5" /> Desktop
                          </button>
                          <button
                            type="button"
                            onClick={() => field.onChange("Mobile")}
                            className={`flex items-center justify-center gap-2 h-9 rounded-md border text-xs font-semibold transition-all ${
                              field.value === "Mobile"
                                ? "border-brand bg-brand/10 text-brand"
                                : "border-border/60 text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            <Smartphone className="h-3.5 w-3.5" /> Mobile
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Keywords & Competitors Configuration */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="py-4 px-5 border-b border-border/50 bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <TrendingUp className="h-4 w-4 text-brand" /> 3. Keywords &amp; Competitor Tracking
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Set tracking capacities and paste seed keywords &amp; rival domains.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Keywords Limit */}
                <FormField
                  control={form.control}
                  name="keywordsCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold flex items-center justify-between">
                        <span>Keywords Capacity</span>
                        <span className="text-muted-foreground font-mono font-normal">Plan limit: {maxKeywords.toLocaleString()}</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          className="h-9 text-xs font-semibold font-mono"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-[11px]">e.g. 5,000 tracked keywords</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Competitors Limit */}
                <FormField
                  control={form.control}
                  name="competitorsCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold flex items-center justify-between">
                        <span>Competitors Limit</span>
                        <span className="text-muted-foreground font-mono font-normal">Plan limit: {maxCompetitors}</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          className="h-9 text-xs font-semibold font-mono"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-[11px]">e.g. 10 tracked rivals</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Seed Keywords */}
              <FormField
                control={form.control}
                name="seedKeywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Seed Keywords <span className="text-muted-foreground font-normal">(optional, one per line)</span></FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="best seo tools&#10;enterprise rank tracking&#10;backlink audit online"
                        rows={3}
                        className="text-xs font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-[11px]">Will be immediately added to daily rank tracking radar</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Seed Competitors */}
              <FormField
                control={form.control}
                name="seedCompetitors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Competitor Domains <span className="text-muted-foreground font-normal">(optional, one per line)</span></FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="competitor1.com&#10;competitor2.com&#10;rivalbrand.io"
                        rows={3}
                        className="text-xs font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-[11px]">Will be pre-configured for domain gap and overlap analysis</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-2">
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link href="/projects">Cancel</Link>
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="bg-brand hover:bg-brand/90 text-brand-foreground font-semibold text-xs px-6 h-10 shadow-md gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Provisioning Project...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Create &amp; Launch Project
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      <UpgradePromptModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        metricName="Project Creation Limit"
        currentPlanKey={planKey}
      />
    </div>
  )
}