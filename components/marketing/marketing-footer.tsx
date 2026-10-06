export function MarketingFooter() {
  return (
    <footer className="border-t border-border/80 bg-background py-8 text-xs text-muted-foreground font-mono">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 font-bold text-foreground">
          <div className="w-5 h-5 rounded border border-foreground/80 bg-foreground text-background font-serif font-black text-[10px] flex items-center justify-center">
            T
          </div>
          <span className="tracking-wider uppercase text-xs font-mono">TOPSEOTOOL</span>
          <span className="text-muted-foreground font-normal text-[11px] font-sans">
            · U.S. Generative Search &amp; SEO Intelligence Index
          </span>
        </div>

        <p className="text-[11px] text-muted-foreground font-mono">
          &copy; {new Date().getFullYear()} TOPSEOTOOL. Published in the United States of America. All Rights Reserved.
        </p>
      </div>
    </footer>
  )
}