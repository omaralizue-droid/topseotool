"use client"
import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Free Tools", href: "/tools" },
  { label: "Use Cases", href: "/use-cases" },
  { label: "Resources", href: "/resources" },
  { label: "Blog", href: "/blog" },
  { label: "Pricing", href: "/pricing" },
]

export function MarketingNav() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-50 glass border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-sm shrink-0">
          <div className="w-8 h-8 rounded-lg bg-brand text-brand-foreground flex items-center justify-center font-bold text-sm">T</div>
          <span className="tracking-tight">TOPSEOTOOL</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 ml-2">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Link href="/dashboard" className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">Sign in</Link>
          <Button size="sm" asChild>
            <Link href="/dashboard">Open Dashboard</Link>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      {/* Mobile nav */}
      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-1">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block px-3 py-2 text-sm rounded-md hover:bg-accent">
              {l.label}
            </Link>
          ))}
          <Link href="/dashboard" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm rounded-md hover:bg-accent">Open Dashboard</Link>
        </div>
      )}
    </header>
  )
}