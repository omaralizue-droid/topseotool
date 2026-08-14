import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FREE_TOOLS } from "@/lib/content/tools-data"
import { BreadcrumbJsonLd, FAQJsonLd, SoftwareApplicationJsonLd } from "@/components/seo/json-ld"
import { ArrowLeft, Check, HelpCircle } from "lucide-react"
import { ToolWidget } from "@/components/marketing/tool-widget"

interface PageParams {
  params: Promise<{ tool: string }>
}

export async function generateStaticParams() {
  return FREE_TOOLS.map((t) => ({ tool: t.slug }))
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { tool: slug } = await params
  const tool = FREE_TOOLS.find((t) => t.slug === slug)
  if (!tool) return { title: "Tool Not Found" }

  return {
    title: `${tool.name} — Free Web Tool | TOPSEOTOOL`,
    description: tool.description,
    alternates: {
      canonical: `/tools/${tool.slug}`,
    },
    openGraph: {
      title: `${tool.name} — Free Web Tool`,
      description: tool.description,
      type: "website",
    },
  }
}

export default async function FreeToolDetailPage({ params }: PageParams) {
  const { tool: slug } = await params
  const tool = FREE_TOOLS.find((t) => t.slug === slug)

  if (!tool) {
    notFound()
  }

  return (
    <div className="py-12 md:py-20 max-w-5xl mx-auto px-4 sm:px-6 space-y-12 animate-fade-in">
      <SoftwareApplicationJsonLd name={tool.name} description={tool.description} />
      <FAQJsonLd faqs={tool.faqs} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "/" },
          { name: "Tools", item: "/tools" },
          { name: tool.name, item: `/tools/${tool.slug}` },
        ]}
      />

      <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
        <Link href="/tools">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to free tools
        </Link>
      </Button>

      {/* Header */}
      <div className="space-y-3">
        <Badge variant="brand">{tool.badge}</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          {tool.headline}
        </h1>
        <p className="text-muted-foreground text-base max-w-2xl leading-relaxed">
          {tool.instructions}
        </p>
      </div>

      {/* Interactive Tool Widget Component */}
      <ToolWidget toolSlug={tool.slug} />

      {/* Features & Quotas */}
      <div className="grid sm:grid-cols-2 gap-4 border-t border-border pt-8">
        {tool.features.map((feat) => (
          <div key={feat} className="flex items-start gap-2 text-sm text-foreground">
            <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>{feat}</span>
          </div>
        ))}
      </div>

      {/* Tool FAQ */}
      <div className="border-t border-border pt-10 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {tool.faqs.map((faq) => (
            <div key={faq.question} className="p-5 rounded-xl border border-border bg-card space-y-2">
              <p className="text-sm font-semibold flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-brand shrink-0" />
                {faq.question}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
