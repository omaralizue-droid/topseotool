import Link from "next/link"

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 font-bold text-sm mb-3">
              <div className="w-7 h-7 rounded-md bg-brand text-brand-foreground flex items-center justify-center text-xs font-bold">T</div>
              <span>TOPSEOTOOL</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
              AI Search & SEO Intelligence Platform for modern businesses.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3">Product & Tools</p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/#features" className="hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="/tools" className="hover:text-foreground transition-colors">Free Web Tools</Link></li>
              <li><Link href="/use-cases" className="hover:text-foreground transition-colors">Use Cases</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3">Resources & Learn</p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/blog" className="hover:text-foreground transition-colors">Insights Blog</Link></li>
              <li><Link href="/resources" className="hover:text-foreground transition-colors">Resource Center</Link></li>
              <li><Link href="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact Support</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3">Account & Legal</p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link></li>
              <li><Link href="/signup" className="hover:text-foreground transition-colors">Create account</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} TOPSEOTOOL. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">TopSEOTool.net</p>
        </div>
      </div>
    </footer>
  )
}