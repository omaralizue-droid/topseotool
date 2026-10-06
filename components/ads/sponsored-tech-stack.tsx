"use client"

import { ExternalLink, CheckCircle2, ShieldCheck, Zap, Award } from "lucide-react"
import { ADS_CONFIG } from "@/lib/ads-config"

export function SponsoredTechStack() {
  return (
    <div className="w-full rounded-xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs flex flex-col gap-4 print:hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-3">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          <h3 className="text-xs sm:text-sm font-bold text-foreground font-mono uppercase tracking-wider">
            Verified Enterprise AI &amp; SEO Infrastructure
          </h3>
        </div>
        <span className="text-[9px] sm:text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
          Sponsored Partners &middot; FTC Disclosed
        </span>
      </div>

      <p className="text-xs text-muted-foreground font-serif leading-relaxed">
        Recommended technology stack evaluated for high-performance crawlability, generative search indexing, and sub-100ms response times.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {ADS_CONFIG.curatedSponsors.map((partner) => (
          <div
            key={partner.id}
            className="p-4 rounded-xl border border-border/70 bg-background/50 flex flex-col justify-between gap-3 hover:border-foreground/30 transition-all shadow-xs"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/60">
                  {partner.category}
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              </div>

              <h4 className="text-xs sm:text-sm font-bold text-foreground font-sans leading-tight">
                {partner.title}
              </h4>
              <p className="text-xs text-muted-foreground font-serif leading-relaxed">
                {partner.tagline}
              </p>
            </div>

            <a
              href={partner.destinationUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-muted hover:bg-foreground hover:text-background text-foreground text-xs font-mono font-semibold transition-all border border-border/80 cursor-pointer active:scale-[0.98]"
            >
              <span>{partner.ctaText}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
