import type { Metadata } from "next"

const DEFAULT_URL = process.env.NEXT_PUBLIC_APP_URL || "https://topseotool.net"
const SITE_NAME = process.env.NEXT_PUBLIC_APP_NAME || "TOPSEOTOOL"

export interface MetadataProps {
  title: string
  description: string
  canonicalUrl?: string
  image?: string
  noIndex?: boolean
  keywords?: string[]
}

/**
 * Constructs standard, search-engine-optimized Metadata for Next.js pages.
 * Includes Title, Meta Description, Canonical URLs, Open Graph, Twitter Cards,
 * and Googlebot crawler directives.
 */
export function constructMetadata({
  title,
  description,
  canonicalUrl = "/",
  image = "/og-image.png",
  noIndex = false,
  keywords = [
    "SEO tools",
    "site audit",
    "keyword research",
    "rank tracker",
    "competitor analysis",
    "backlink checker",
    "AI content optimization",
    "SERP analyzer",
    "AEO intelligence",
  ],
}: MetadataProps): Metadata {
  const fullCanonical = canonicalUrl.startsWith("http")
    ? canonicalUrl
    : `${DEFAULT_URL}${canonicalUrl.startsWith("/") ? canonicalUrl : `/${canonicalUrl}`}`

  const fullImage = image.startsWith("http")
    ? image
    : `${DEFAULT_URL}${image.startsWith("/") ? image : `/${image}`}`

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    keywords,
    alternates: {
      canonical: fullCanonical,
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: fullCanonical,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: `${title} — ${SITE_NAME}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [fullImage],
      creator: "@topseotool",
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    authors: [{ name: "TOPSEOTOOL Research Team", url: DEFAULT_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
  }
}
