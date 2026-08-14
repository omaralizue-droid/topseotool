import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check, Building2, ShoppingBag, Layers } from "lucide-react"
import { USE_CASES } from "@/lib/content/use-cases-data"
import { BreadcrumbJsonLd } from "@/components/seo/json-ld"

export const metadata: Metadata = {
  title: "SEO & AI Search Use Cases | TOPSEOTOOL",
  description: "Discover how agencies, SaaS teams, and e-commerce brands use TOPSEOTOOL for technical SEO audits and AI search engine visibility.",
  alternates: {
    canonical: "/use-cases",
  },
}

export default function UseCasesIndexPage() {
  return (
    <div className="py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6 space-y-12 animate-fade-in">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "/" },
          { name: "Use Cases", item: "/use-cases" },
        ]}
      />

      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <Badge variant="brand" className="mb-1">Solutions & Workflows</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Tailored Use Cases
        </h1>
        <p className="text-muted-foreground text-base">
          See how leading digital teams leverage TOPSEOTOOL to dominate traditional and AI-driven search experiences.
        </p>
      </div>

      {/* Use Cases Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {USE_CASES.map((uc) => (
          <Card key={uc.slug} className="flex flex-col justify-between hover:border-brand/40 transition-all hover:shadow-md bg-card">
            <CardHeader className="p-6">
              <Badge variant="brand" className="w-fit mb-3">{uc.badge}</Badge>
              <CardTitle className="text-xl font-bold leading-tight">{uc.title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {uc.description}
              </p>
            </CardHeader>

            <CardContent className="px-6 pb-6 pt-0 flex-1">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Key Advantages</p>
              <ul className="space-y-2 text-xs">
                {uc.keyBenefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="p-6 pt-0">
              <Button className="w-full" variant="outline" asChild>
                <Link href={`/use-cases/${uc.slug}`}>
                  Explore Workflow <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
