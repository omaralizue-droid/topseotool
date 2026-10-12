"use client"

import Link from "next/link"
import { Sparkles, History, CreditCard, Share2, Printer } from "lucide-react"

interface NavbarProps {
  hasResults: boolean
  savedCount: number
  onOpenHistory: () => void
  onOpenPricing: () => void
  onOpenShare: () => void
}

export function Navbar({
  hasResults,
  savedCount,
  onOpenHistory,
  onOpenPricing,
  onOpenShare,
}: NavbarProps) {
  return (
    <header className="border-b border-neutral-200/80 bg-white/85 backdrop-blur-md sticky top-0 z-30 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold tracking-tight text-neutral-900 text-base">
              TOPSEOTOOL
            </span>
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 text-[11px] font-medium text-blue-700">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            AI Visibility &amp; GEO Engine
          </span>
        </div>

        <nav className="flex items-center gap-2 sm:gap-3 text-xs font-medium text-neutral-600">
          <button
            type="button"
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 transition-colors cursor-pointer"
            title="View saved scan history"
          >
            <History className="w-3.5 h-3.5 text-neutral-500" />
            <span className="hidden sm:inline">History</span>
            {savedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-mono font-bold">
                {savedCount}
              </span>
            )}
          </button>

          {hasResults && (
            <>
              <button
                type="button"
                onClick={onOpenShare}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-neutral-500" />
                <span className="hidden sm:inline">Share</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-neutral-500" />
                <span>PDF / Print</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onOpenPricing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-medium transition-colors cursor-pointer shadow-2xs"
          >
            <CreditCard className="w-3.5 h-3.5 text-blue-400" />
            <span>Pricing</span>
          </button>
        </nav>
      </div>
    </header>
  )
}
