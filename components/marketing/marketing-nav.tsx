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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4 sm:gap-6">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-sm shrink-0">
          <div className="w-8 h-8 rounded-lg bg-brand text-brand-foreground flex items-center justify-center font-bold text-sm shadow-brand">T</div>
          <span className="tracking-tight">TOPSEOTOOL</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 ml-2">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/dashboard"
            className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
          >
            Sign in
          </Link>
          <Button size="sm" asChild className="hidden sm:flex">
            <Link href="/dashboard">Open Dashboard</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <span className={cn("absolute transition-all duration-200", open ? "opacity-100 rotate-0" : "opacity-0 rotate-90")}>
              <X className="h-5 w-5" />
            </span>
            <span className={cn("absolute transition-all duration-200", open ? "opacity-0 rotate-90" : "opacity-100 rotate-0")}>
              <Menu className="h-5 w-5" />
            </span>
          </Button>
        </div>
      </div>

      {/* Mobile nav — animated slide down */}
      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm animate-slide-down">
          <div className="max-w-6xl mx-auto px-4 py-3 space-y-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-accent hover:text-foreground text-muted-foreground transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-2 pb-1 border-t border-border mt-2 flex flex-col gap-2">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-accent text-muted-foreground transition-colors"
              >
                Sign in
              </Link>
              <Button asChild className="w-full">
                <Link href="/dashboard" onClick={() => setOpen(false)}>
                  Open Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}