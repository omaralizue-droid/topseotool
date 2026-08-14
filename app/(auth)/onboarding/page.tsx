"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, ArrowLeft, Check, Sparkles, Building2, Globe, Briefcase, MapPin, Users2, Rocket, Loader2 } from "lucide-react"
import { toast } from "sonner"

const INDUSTRIES = [
  "SaaS / Software", "E-commerce", "Marketing Agency",
  "Financial Services", "Healthcare", "Education",
  "Real Estate", "Professional Services", "Other"
]

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia",
  "Germany", "France", "Japan", "India", "Global"
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const totalSteps = 7

  // Form state
  const [companyName, setCompanyName] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [industry, setIndustry] = useState("SaaS / Software")
  const [country, setCountry] = useState("United States")
  const [competitor1, setCompetitor1] = useState("")
  const [competitor2, setCompetitor2] = useState("")
  const [loading, setLoading] = useState(false)

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps))
  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

  async function handleFinish() {
    setLoading(true)
    try {
      const comps = [competitor1, competitor2].filter(Boolean)
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName || "My Brand",
          websiteUrl: websiteUrl || "example.com",
          industry,
          country,
          competitors: comps,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Failed to complete onboarding")
        return
      }

      toast.success("Setup complete! Welcome to TOPSEOTOOL.")
      router.push("/dashboard")
      router.refresh()
    } catch {
      toast.error("Something went wrong during setup.")
    } finally {
      setLoading(false)
    }
  }

  const progressPercent = Math.round((step / totalSteps) * 100)

  return (
    <div className="w-full max-w-lg p-6 sm:p-8 bg-card border border-border rounded-xl shadow-lg space-y-6 animate-fade-in">
      {/* Header & Progress indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold uppercase tracking-wider text-brand">Onboarding</span>
          <span>Step {step} of {totalSteps}</span>
        </div>
        <Progress value={progressPercent} className="h-1.5" />
      </div>

      {/* STEP 1: Welcome */}
      {step === 1 && (
        <div className="space-y-4 text-center py-4">
          <div className="w-14 h-14 rounded-2xl bg-brand text-brand-foreground flex items-center justify-center mx-auto text-2xl font-bold shadow-brand">
            T
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome to TOPSEOTOOL</h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Let&apos;s set up your brand and AI search tracking in under 2 minutes. We&apos;ll configure your workspace and initial monitoring targets.
          </p>
          <Button size="lg" className="w-full mt-4" onClick={nextStep}>
            Get Started <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* STEP 2: Company/Brand Name */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-brand" />
            <h2 className="text-lg font-bold">What is your company or brand name?</h2>
          </div>
          <p className="text-xs text-muted-foreground">This will be used to track brand mentions across AI engines.</p>
          <div className="space-y-1.5 pt-2">
            <Label>Company Name</Label>
            <Input
              placeholder="e.g. Acme Corp"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      )}

      {/* STEP 3: Website URL */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-brand" />
            <h2 className="text-lg font-bold">What is your primary website URL?</h2>
          </div>
          <p className="text-xs text-muted-foreground">We will use this domain for technical SEO crawls and AI citation checks.</p>
          <div className="space-y-1.5 pt-2">
            <Label>Website URL</Label>
            <Input
              placeholder="example.com or https://example.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      )}

      {/* STEP 4: Industry */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-brand" />
            <h2 className="text-lg font-bold">Select your industry</h2>
          </div>
          <p className="text-xs text-muted-foreground">Helps us tailor AI search prompt templates to your vertical.</p>
          <div className="space-y-1.5 pt-2">
            <Label>Industry</Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((ind) => (
                  <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* STEP 5: Primary Country */}
      {step === 5 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-brand" />
            <h2 className="text-lg font-bold">Primary market / country</h2>
          </div>
          <p className="text-xs text-muted-foreground">AI engine responses vary by region. Choose your target market.</p>
          <div className="space-y-1.5 pt-2">
            <Label>Primary Country</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* STEP 6: Main Competitors */}
      {step === 6 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users2 className="h-5 w-5 text-brand" />
            <h2 className="text-lg font-bold">Add main competitors (optional)</h2>
          </div>
          <p className="text-xs text-muted-foreground">We&apos;ll benchmark your SEO scores and AI visibility against them.</p>
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-xs">Competitor 1 Domain</Label>
              <Input
                placeholder="competitor1.com"
                value={competitor1}
                onChange={(e) => setCompetitor1(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Competitor 2 Domain</Label>
              <Input
                placeholder="competitor2.com"
                value={competitor2}
                onChange={(e) => setCompetitor2(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 7: Finish */}
      {step === 7 && (
        <div className="space-y-4 text-center py-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-2xl">
            <Rocket className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Setup Ready!</h2>
          <div className="text-sm text-muted-foreground space-y-1 bg-muted p-4 rounded-lg text-left font-mono-nums">
            <p><span className="font-semibold text-foreground">Brand:</span> {companyName || "My Brand"}</p>
            <p><span className="font-semibold text-foreground">Domain:</span> {websiteUrl || "example.com"}</p>
            <p><span className="font-semibold text-foreground">Market:</span> {industry} ({country})</p>
          </div>
          <Button size="lg" className="w-full mt-4" onClick={handleFinish} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
            Go to Dashboard
          </Button>
        </div>
      )}

      {/* Navigation Buttons */}
      {step > 1 && step < 7 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button variant="ghost" size="sm" onClick={prevStep}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Button size="sm" onClick={nextStep} disabled={(step === 2 && !companyName) || (step === 3 && !websiteUrl)}>
            Next <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}