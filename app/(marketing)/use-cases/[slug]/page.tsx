import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ArrowLeft, Check, ArrowRight, Layers, BarChart } from "lucide-react"
import { USE_CASES } from "@/lib/content/use-cases-data"
import { BreadcrumbJsonLd } from "@/components/seo/json-ld"

interface PageParams {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return USE_CASES.map((u) => ({ slug: u.slug }))
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params
  const uc = USE_CASES.find((u) => u.slug === slug)
  if (!uc) return { title: "Use Case Not Found" }

  return {
    title: `${uc.title} | TOPSEOTOOL Solutions`,
    description: uc.description,
    alternates: {
      canonical: `/use-cases/${uc.slug}`,
    },
    openGraph: {
      title: uc.title,
      description: uc.description,
      type: "website",
    },
  }
}

export default async function SingleUseCasePage({ params }: PageParams) {
  const { slug } = await params
  const uc = USE_CASES.find((u) => u.slug === slug)

  if (!uc) {
    notFound()
  }

  return (
    <div className="py-12 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 space-y-12 animate-fade-in">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "/" },
          { name: "Use Cases", item: "/use-cases" },
          { name: uc.badge, item: `/use-cases/${uc.slug}` },
        ]}
      />

      <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
        <Link href="/use-cases">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to use cases
        </Link>
      </Button>

      {/* Header */}
      <div className="space-y-4 border-b border-border pb-8">
        <Badge variant="brand">{uc.badge}</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          {uc.title}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {uc.subtitle}
        </p>
        <p className="text-xs text-muted-foreground">
          Target Role: <span className="font-semibold text-foreground">{uc.targetAudience}</span>
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Key Advantages for {uc.badge}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {uc.keyBenefits.map((benefit) => (
            <Card key={benefit} className="p-5 border-border bg-card">
              <div className="flex items-start gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                <span className="font-medium text-foreground leading-snug">{benefit}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="space-y-4 border-t border-border pt-8">
        <h2 className="text-xl font-bold tracking-tight">Recommended Implementation Workflow</h2>
        <div className="space-y-4">
          {uc.workflowSteps.map((step) => (
            <div key={step.step} className="p-5 rounded-xl border border-border bg-muted/20 flex gap-4 items-start">
              <span className="text-2xl font-extrabold text-brand font-mono-nums shrink-0">{step.step}</span>
              <div>
                <p className="font-semibold text-base mb-1">{step.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics Tracked */}
      <div className="space-y-4 border-t border-border pt-8">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <BarChart className="h-5 w-5 text-brand" /> Core KPI Metrics Tracked
        </h2>
        <div className="flex flex-wrap gap-2">
          {uc.metricsTracked.map((metric) => (
            <Badge key={metric} variant="outline" className="text-xs py-1.5 px-3">
              {metric}
            </Badge>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <Card className="p-8 mt-12 bg-brand/5 border-brand/20 text-center space-y-4">
        <h3 className="text-xl font-bold">Ready to streamline your search & AI workflows?</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Start your free audit today and see how TOPSEOTOOL automates SEO health and LLM citation monitoring.
        </p>
        <Button size="lg" variant="brand" asChild>
          <Link href="/signup">
            Get Started Free <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </Card>
    </div>
  )
}
