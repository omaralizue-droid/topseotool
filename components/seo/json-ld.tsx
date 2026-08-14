import React from "react"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://topseotool.net"

export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    name: "TOPSEOTOOL",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description:
      "TOPSEOTOOL is an AI Search & SEO Intelligence platform enabling businesses to audit websites, track LLM citations, and optimize AI visibility.",
    sameAs: [
      "https://twitter.com/topseotool",
      "https://linkedin.com/company/topseotool",
      "https://github.com/topseotool",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "support@topseotool.net",
      contactType: "customer support",
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function WebSiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: "TOPSEOTOOL",
    description: "AI Search & SEO Intelligence Platform",
    publisher: {
      "@id": `${baseUrl}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/tools?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function SoftwareApplicationJsonLd({
  name = "TOPSEOTOOL Platform",
  description = "Multi-tenant B2B SaaS platform for SEO auditing and AI search engine visibility monitoring.",
  applicationCategory = "BusinessApplication",
  operatingSystem = "Web Browser",
  price = "0",
  currency = "USD",
}: {
  name?: string
  description?: string
  applicationCategory?: string
  operatingSystem?: string
  price?: string
  currency?: string
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    applicationCategory,
    operatingSystem,
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: currency,
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "128",
      reviewCount: "128",
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; item: string }[]
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item.startsWith("http") ? item.item : `${baseUrl}${item.item}`,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function ArticleJsonLd({
  title,
  description,
  url,
  publishedAt,
  updatedAt,
  authorName = "TOPSEOTOOL Research Team",
  imageUrl = `${baseUrl}/og-image.png`,
}: {
  title: string
  description: string
  url: string
  publishedAt: string
  updatedAt?: string
  authorName?: string
  imageUrl?: string
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url.startsWith("http") ? url : `${baseUrl}${url}`,
    },
    image: imageUrl,
    datePublished: publishedAt,
    dateModified: updatedAt || publishedAt,
    author: {
      "@type": "Organization",
      name: authorName,
      url: baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "TOPSEOTOOL",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function FAQJsonLd({
  faqs,
}: {
  faqs: { question: string; answer: string }[]
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
