import type { Metadata, Viewport } from "next"
import Script from "next/script"
import "./globals.css"
import { ADS_CONFIG } from "@/lib/ads-config"

function getValidBaseUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") || "https://topseotool.net"
  try {
    return new URL(raw.startsWith("http") ? raw : `https://${raw}`)
  } catch {
    return new URL("https://topseotool.net")
  }
}

const metadataBaseUrl = getValidBaseUrl()
const baseUrl = metadataBaseUrl.origin

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl,
  title: "TOPSEOTOOL — AI Search Visibility & GEO Engine",
  description:
    "See how AI answers describe your brand across ChatGPT, Perplexity, Claude, and Google AI. Crawl your site, test live AI engine queries, and get copy-paste fixes.",
  keywords: [
    "AI search visibility",
    "GEO",
    "Generative Engine Optimization",
    "AEO",
    "ChatGPT SEO",
    "Perplexity visibility",
    "llms.txt generator",
    "Schema.org generator",
    "TopSEOTool",
  ],
  authors: [{ name: "TOPSEOTOOL", url: baseUrl }],
  creator: "TOPSEOTOOL",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "TOPSEOTOOL",
    title: "TOPSEOTOOL — AI Search Visibility & GEO Engine",
    description: "Check how AI engines recommend your brand. Live crawl, real queries, instant fixes.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TOPSEOTOOL — AI Search Visibility & GEO Engine",
    description: "Check how AI engines recommend your brand. Live crawl, real queries, instant fixes.",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {ADS_CONFIG.enableLiveAdsense && (
          <Script
            id="adsbygoogle-init"
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CONFIG.adsenseClientId}`}
          />
        )}
      </head>
      <body className="antialiased min-h-screen bg-[#fafbfc] text-neutral-900 selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  )
}
