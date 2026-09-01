import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { BreadcrumbJsonLd } from "@/components/seo/json-ld"

export const metadata: Metadata = {
  title: "About Us | TOPSEOTOOL",
  description: "Learn about TOPSEOTOOL and our mission to modernize search intelligence for the era of AI answer engines.",
  alternates: {
    canonical: "/about",
  },
}

export default function AboutPage() {
  return (
    <div className="py-12 sm:py-20 md:py-28 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-8 sm:mb-12">
        <Badge variant="brand" className="mb-3 sm:mb-4">Our Mission</Badge>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-3 sm:mb-4">
          Redefining Search Intelligence
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
          We help companies transition from traditional search optimization to AI-first answer engine optimization (AEO).
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-5 text-sm sm:text-base text-muted-foreground leading-relaxed">
        <p>
          Search is undergoing its biggest transformation in 25 years. As millions of users shift from standard keyword queries to generative AI assistants like ChatGPT, Perplexity, Gemini, and Claude, traditional SEO metrics are no longer sufficient.
        </p>
        <p>
          TOPSEOTOOL was built to give marketers, agencies, and SaaS teams complete visibility across both Google/Bing and AI search models. Our platform continuously audits your website, probes generative AI search models, tracks brand citations, and generates actionable recommendation plans.
        </p>
      </div>

      <div className="mt-10 sm:mt-12 text-center">
        <Button size="lg" asChild className="w-full sm:w-auto">
          <Link href="/signup">Start analyzing your site</Link>
        </Button>
      </div>
    </div>
  )
}