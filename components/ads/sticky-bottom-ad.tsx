"use client"

import { useState, useEffect } from "react"
import { X, ExternalLink, Sparkles } from "lucide-react"
import { ADS_CONFIG } from "@/lib/ads-config"

export function StickyBottomAd() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // Appear smoothly after 1.5 seconds or slight scroll
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!dismissed) setVisible(true)
    }, 1500)

    const handleScroll = () => {
      if (window.scrollY > 200 && !dismissed) {
        setVisible(true)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [dismissed])

  if (!visible || dismissed) return null

  const sponsor = ADS_CONFIG.curatedSponsors[2] // Cloudflare or Vercel

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-2 sm:p-3 bg-background/95 backdrop-blur-md border-t border-border/80 shadow-lg animate-in slide-in-from-bottom duration-300 print:hidden">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <span className="hidden sm:inline-block text-[9px] font-mono uppercase tracking-widest text-muted-foreground border border-border px-1.5 py-0.5 rounded bg-muted/40">
            Ad
          </span>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-foreground font-sans truncate">
                {sponsor.title}
              </span>
              <span className="hidden md:inline-block text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                Official Partner
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground font-serif truncate hidden sm:block">
              {sponsor.tagline}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={sponsor.destinationUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center gap-1 px-3 sm:px-4 py-1.5 rounded-lg bg-foreground text-background font-mono text-xs font-semibold hover:opacity-90 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <span>{sponsor.ctaText}</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
          </a>

          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Dismiss advertisement"
            aria-label="Close ad"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
