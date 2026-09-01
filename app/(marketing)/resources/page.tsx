import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, FileText, Calendar } from "lucide-react"
import { RESOURCES } from "@/lib/content/resources-data"
import { BreadcrumbJsonLd } from "@/components/seo/json-ld"

export const metadata: Metadata = {
  title: "Educational Resources & Research Playbooks | TOPSEOTOOL",
  description: "Free technical playbooks, empirical research reports, and guides on Answer Engine Optimization (AEO) and structured data.",
  alternates: {
    canonical: "/resources",
  },
}

export default function ResourcesIndexPage() {
  return (
    <div className="py-12 sm:py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-12 animate-fade-in">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "/" },
          { name: "Resources", item: "/resources" },
        ]}
      />

      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <Badge variant="brand" className="mb-1">Knowledge Hub</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Resource Center &amp; Research
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          In-depth technical guides, empirical AI ranking factor studies, and actionable optimization playbooks.
        </p>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {RESOURCES.map((res) => (
          <Card key={res.slug} className="flex flex-col justify-between hover:border-brand/40 transition-all hover:shadow-md bg-card">
            <CardHeader className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="brand">{res.badge}</Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Updated {res.updatedAt}
                </span>
              </div>
              <CardTitle className="text-xl font-bold leading-tight">{res.title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {res.description}
              </p>
            </CardHeader>

            <CardContent className="px-6 pb-6 pt-0 flex-1">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Chapters Included</p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {res.chapters.map((ch) => (
                  <li key={ch.title} className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-brand shrink-0" />
                    <span className="truncate">{ch.title}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="p-6 pt-0">
              <Button className="w-full" variant="brand" asChild>
                <Link href={`/resources/${res.slug}`}>
                  Read Playbook <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
