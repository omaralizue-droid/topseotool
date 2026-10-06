// Configuration for High-Yield Ad Monetization (Google AdSense, Carbon Ads, & Direct Sponsors)

export interface SponsorAd {
  id: string
  title: string
  tagline: string
  ctaText: string
  destinationUrl: string
  badgeText: string
  category: string
  accentColor: string
}

export const ADS_CONFIG = {
  // Replace with your Google AdSense Publisher ID (e.g., "ca-pub-1234567890123456")
  adsenseClientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-9928374182938172",

  // Ad Slot IDs from your Google AdSense dashboard
  slots: {
    topLeaderboard: process.env.NEXT_PUBLIC_ADS_SLOT_TOP || "7891234560",
    inContentMid: process.env.NEXT_PUBLIC_ADS_SLOT_MID || "8901234561",
    stickyFooter: process.env.NEXT_PUBLIC_ADS_SLOT_FOOTER || "9012345672",
    nativeSidebar: process.env.NEXT_PUBLIC_ADS_SLOT_SIDEBAR || "1234567893",
  },

  // Enable live Google AdSense tags (set to true in production with real ca-pub ID)
  enableLiveAdsense: process.env.NODE_ENV === "production" && !!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,

  // High-paying tech sponsor fallbacks (Used when ads are loading or AdSense is in review)
  curatedSponsors: [
    {
      id: "perplexity-pro",
      title: "Perplexity AI Pro for Enterprise",
      tagline: "Empower your team with real-time multi-model search, citations & file analysis.",
      ctaText: "Start Free Trial →",
      destinationUrl: "https://perplexity.ai/pro",
      badgeText: "Featured AI Partner",
      category: "Generative Search",
      accentColor: "#2563eb",
    },
    {
      id: "vercel-hosting",
      title: "Vercel Frontend Cloud",
      tagline: "Ultra-fast global edge deployments with automated Core Web Vitals optimization.",
      ctaText: "Deploy Now →",
      destinationUrl: "https://vercel.com",
      badgeText: "High-Performance Cloud",
      category: "Web Infrastructure",
      accentColor: "#000000",
    },
    {
      id: "cloudflare-edge",
      title: "Cloudflare Turnstile & CDN",
      tagline: "Protect your site from malicious scrapers while guaranteeing 100% AI bot crawl speed.",
      ctaText: "Learn More →",
      destinationUrl: "https://cloudflare.com",
      badgeText: "Security & Speed",
      category: "Enterprise CDN",
      accentColor: "#f97316",
    },
    {
      id: "semrush-toolkit",
      title: "Semrush AI Search Intelligence",
      tagline: "Track 20M+ keywords and spy on competitor generative search citations.",
      ctaText: "Claim 14-Day Pass →",
      destinationUrl: "https://semrush.com",
      badgeText: "SEO Intelligence",
      category: "Competitive Analysis",
      accentColor: "#10b981",
    },
  ] as SponsorAd[],
}
