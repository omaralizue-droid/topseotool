"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-neutral-200/80 bg-white py-8 mt-16 text-xs text-neutral-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-neutral-900">TOPSEOTOOL</span>
          <span>&copy; {new Date().getFullYear()} &bull; AI Brand Visibility &amp; Generative Engine Optimization</span>
        </div>

        <div className="flex items-center gap-5 font-medium">
          <Link href="/privacy" className="hover:text-neutral-950 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-neutral-950 transition-colors">
            Terms of Service
          </Link>
          <span className="text-neutral-300">|</span>
          <span className="text-neutral-400 font-mono text-[11px]">
            Engineered with Gemini 2.0 &amp; Search Grounding
          </span>
        </div>
      </div>
    </footer>
  )
}
