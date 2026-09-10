import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProgrammaticPage } from "@/lib/seo/programmatic-seo"
import { constructMetadata } from "@/lib/seo/metadata"
import { LandingPageTemplate } from "@/components/seo/landing-page-template"

const pageData = getProgrammaticPage("seo-tools")!

export const metadata: Metadata = constructMetadata({
  title: pageData.title,
  description: pageData.metaDescription,
  canonicalUrl: pageData.path,
})

export default function SeoToolsPage() {
  if (!pageData) notFound()
  return <LandingPageTemplate data={pageData} />
}
