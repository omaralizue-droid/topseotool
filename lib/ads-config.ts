// Minimalist, high-quality Ad & Sponsor configuration

export interface Sponsor {
  title: string
  tagline: string
  cta: string
  url: string
  badge: string
}

export const ADS_CONFIG = {
  // Google AdSense Client ID
  adsenseClientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-9928374182938172",
  slotId: process.env.NEXT_PUBLIC_ADS_SLOT_ID || "7891234560",

  // Enable live script only if client id is configured or production
  enableLiveAdsense: process.env.NODE_ENV === "production" && !!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,

  // Clean, non-intrusive sponsor fallback when AdSense is not loaded or during development
  defaultSponsor: {
    title: "Perplexity AI Pro",
    tagline: "Real-time search, multi-model citations, and deep research tools for modern teams.",
    cta: "Explore Perplexity →",
    url: "https://perplexity.ai/pro",
    badge: "Featured Partner",
  } satisfies Sponsor,
}
