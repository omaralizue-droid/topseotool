"use client"

import { useEffect } from "react"
import { ExternalLink } from "lucide-react"
import { ADS_CONFIG } from "@/lib/ads-config"

interface AdBannerProps {
  className?: string
}

export function AdBanner({ className = "" }: AdBannerProps) {
  useEffect(() => {
    if (ADS_CONFIG.enableLiveAdsense && typeof window !== "undefined") {
      try {
        // @ts-ignore
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch (err) {
        // Safe catch if client adblocker is present
      }
    }
  }, [])

  const sponsor = ADS_CONFIG.defaultSponsor

  return (
    <div className={`w-full my-6 print:hidden ${className}`}>
      <div className="max-w-4xl mx-auto rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-3 sm:p-4 text-neutral-800 transition-colors hover:border-neutral-300">
        {ADS_CONFIG.enableLiveAdsense ? (
          <div className="min-h-[90px] flex items-center justify-center overflow-hidden">
            <ins
              className="adsbygoogle"
              style={{ display: "block", textAlign: "center" }}
              data-ad-layout="in-article"
              data-ad-format="auto"
              data-ad-client={ADS_CONFIG.adsenseClientId}
              data-ad-slot={ADS_CONFIG.slotId}
              data-full-width-responsive="true"
            />
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-[10px] uppercase font-mono font-semibold tracking-wider px-2 py-0.5 rounded bg-white border border-neutral-200 text-neutral-500 shrink-0">
                {sponsor.badge}
              </span>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-neutral-900 mr-2">
                  {sponsor.title}
                </span>
                <span className="text-xs text-neutral-600 hidden sm:inline">
                  — {sponsor.tagline}
                </span>
              </div>
            </div>

            <a
              href={sponsor.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs font-medium text-neutral-800 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all shrink-0 shadow-xs"
            >
              <span>{sponsor.cta}</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
