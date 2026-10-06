"use client"

import { useEffect, useState } from "react"
import { ExternalLink } from "lucide-react"
import { ADS_CONFIG } from "@/lib/ads-config"

interface AdSlotProps {
  position: "top-leaderboard" | "in-content" | "sidebar"
  slotId?: string
  className?: string
}

export function AdSlot({ position, slotId, className = "" }: AdSlotProps) {
  const [adLoaded, setAdLoaded] = useState(false)
  const sponsor = ADS_CONFIG.curatedSponsors[
    position === "top-leaderboard" ? 0 : position === "in-content" ? 1 : 2
  ] || ADS_CONFIG.curatedSponsors[0]

  useEffect(() => {
    // If Google AdSense is enabled in production, push to adsbygoogle
    if (ADS_CONFIG.enableLiveAdsense && typeof window !== "undefined") {
      try {
        // @ts-ignore
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
        setAdLoaded(true)
      } catch (err) {
        console.warn("AdSense push failed or blocked by client:", err)
      }
    }
  }, [])

  return (
    <div className={`w-full flex flex-col items-center my-2.5 print:hidden ${className}`}>
      {/* Ad Container Box */}
      <div className="w-full max-w-4xl rounded-lg border border-border/60 bg-card/40 p-2.5 sm:p-3 shadow-2xs relative overflow-hidden transition-all hover:border-foreground/30">
        {ADS_CONFIG.enableLiveAdsense ? (
          /* Live Google AdSense Container */
          <div className="w-full min-h-[80px] flex items-center justify-center overflow-hidden">
            <ins
              className="adsbygoogle"
              style={{ display: "block", textAlign: "center" }}
              data-ad-layout="in-article"
              data-ad-format="auto"
              data-ad-client={ADS_CONFIG.adsenseClientId}
              data-ad-slot={slotId || ADS_CONFIG.slots.topLeaderboard}
              data-full-width-responsive="true"
            />
          </div>
        ) : (
          /* Minimalist Institutional Sponsor Unit (Carbon Ads Style) */
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/80 px-1.5 py-0.5 rounded bg-muted/60 border border-border/50 shrink-0">
                Sponsor
              </span>

              <div className="flex items-baseline gap-2 min-w-0 flex-wrap">
                <span className="text-xs font-bold text-foreground font-sans truncate">
                  {sponsor.title}
                </span>
                <span className="text-xs text-muted-foreground font-serif truncate hidden md:inline">
                  &mdash; {sponsor.tagline}
                </span>
              </div>
            </div>

            <a
              href={sponsor.destinationUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex items-center gap-1 px-3 py-1 rounded bg-muted/80 hover:bg-foreground hover:text-background text-foreground font-mono text-[11px] font-medium transition-all shrink-0 cursor-pointer border border-border/60 active:scale-[0.98]"
            >
              <span>{sponsor.ctaText}</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-70" />
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
