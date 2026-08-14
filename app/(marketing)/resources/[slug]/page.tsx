import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ArrowLeft, Calendar, BookOpen, ArrowRight } from "lucide-react"
import { RESOURCES } from "@/lib/content/resources-data"
import { BreadcrumbJsonLd } from "@/components/seo/json-ld"

interface PageParams {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return RESOURCES.map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params
  const res = RESOURCES.find((r) => r.slug === slug)
  if (!res) return { title: "Resource Not Found" }

  return {
    title: `${res.title} | TOPSEOTOOL Resources`,
    description: res.description,
    alternates: {
      canonical: `/resources/${res.slug}`,
    },
    openGraph: {
      title: res.title,
      description: res.description,
      type: "article",
    },
  }
}

export default async function SingleResourcePage({ params }: PageParams) {
  const { slug } = await params
  const res = RESOURCES.find((r) => r.slug === slug)

  if (!res) {
    notFound()
  }

  return (
    <div className="py-12 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 space-y-12 animate-fade-in">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "/" },
          { name: "Resources", item: "/resources" },
          { name: res.badge, item: `/resources/${res.slug}` },
        ]}
      />

      <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
        <Link href="/resources">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to resources
        </Link>
      </Button>

      {/* Header */}
      <div className="space-y-4 border-b border-border pb-8">
        <div className="flex items-center gap-3">
          <Badge variant="brand">{res.badge}</Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> Updated {res.updatedAt}
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          {res.title}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {res.description}
        </p>
      </div>

      {/* Resource Chapters */}
      <div className="space-y-8">
        {res.chapters.map((ch, idx) => (
          <Card key={ch.title} className="p-6 md:p-8 border-border bg-card space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand text-brand-foreground text-xs font-bold flex items-center justify-center font-mono">
                {idx + 1}
              </span>
              <h2 className="text-xl font-bold tracking-tight text-foreground">{ch.title}</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed pl-8">
              {ch.content}
            </p>
          </Card>
        ))}
      </div>

      {/* Footer CTA */}
      <Card className="p-8 mt-12 bg-brand/5 border-brand/20 text-center space-y-4">
        <h3 className="text-xl font-bold">Implement these insights with TOPSEOTOOL</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Start your free audit today and automate your website&apos;s SEO technical health and LLM citation monitoring.
        </p>
        <Button size="lg" variant="brand" asChild>
          <Link href="/signup">
            Start Free Audit <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </Card>
    </div>
  )
}
