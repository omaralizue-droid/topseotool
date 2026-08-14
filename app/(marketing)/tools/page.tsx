import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Code, Globe, ArrowRight, Check } from "lucide-react"
import { FREE_TOOLS, type FreeTool } from "@/lib/content/tools-data"
import { BreadcrumbJsonLd, SoftwareApplicationJsonLd } from "@/components/seo/json-ld"

export const metadata: Metadata = {
  title: "Free SEO & AI Search Optimization Web Tools | TOPSEOTOOL",
  description: "Explore free web utilities for AI search visibility prompt testing, JSON-LD schema markup generation, and technical meta tag auditing.",
  alternates: {
    canonical: "/tools",
  },
}

const ICON_MAP: Record<string, React.ElementType> = {
  Brain,
  Code,
  Globe,
}

export default function ToolsIndexPage() {
  return (
    <div className="py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6 space-y-12 animate-fade-in">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "/" },
          { name: "Free Tools", item: "/tools" },
        ]}
      />
      <SoftwareApplicationJsonLd
        name="TOPSEOTOOL Free Utilities"
        description="Free web tools for AI search prompt testing, JSON-LD schema generation, and meta tag auditing."
      />

      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <Badge variant="brand" className="mb-1">100% Free Utilities</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Free SEO & AI Search Tools
        </h1>
        <p className="text-muted-foreground text-base">
          Professional web utilities designed for marketers, developers, and SEO specialists. No credit card required.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {FREE_TOOLS.map((tool) => {
          const IconComponent = ICON_MAP[tool.iconName] || Globe
          return (
            <Card key={tool.slug} className="flex flex-col justify-between hover:border-brand/40 transition-all hover:shadow-md bg-card">
              <CardHeader className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-brand-muted flex items-center justify-center">
                    <IconComponent className="h-5 w-5 text-brand" />
                  </div>
                  <Badge variant="outline" className="text-xs">{tool.badge}</Badge>
                </div>
                <CardTitle className="text-xl font-bold">{tool.name}</CardTitle>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {tool.description}
                </p>
              </CardHeader>

              <CardContent className="px-6 pb-6 pt-0 flex-1">
                <ul className="space-y-2 text-xs">
                  {tool.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-foreground">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="p-6 pt-0">
                <Button className="w-full" variant="brand" asChild>
                  <Link href={`/tools/${tool.slug}`}>
                    Launch Tool <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
