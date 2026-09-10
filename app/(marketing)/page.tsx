import type { Metadata } from "next"
import { InteractiveHomeView } from "@/components/marketing/interactive-home-view"

export const metadata: Metadata = {
  title: "The SEO Intelligence Platform Built for Serious Growth | TOPSEOTOOL",
  description:
    "Audit websites, discover profitable keywords, track rankings, analyze competitors and optimize content from one powerful SEO platform.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "The SEO Intelligence Platform Built for Serious Growth | TOPSEOTOOL",
    description:
      "Audit websites, discover profitable keywords, track rankings, analyze competitors and optimize content from one powerful SEO platform.",
    url: "https://topseotool.net",
    siteName: "TOPSEOTOOL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The SEO Intelligence Platform Built for Serious Growth | TOPSEOTOOL",
    description:
      "Audit websites, discover profitable keywords, track rankings, analyze competitors and optimize content from one powerful SEO platform.",
  },
}

export default function HomePage() {
  return <InteractiveHomeView />
}