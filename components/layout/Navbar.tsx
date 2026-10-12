"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Sparkles, History, CreditCard, Share2, Printer, LayoutDashboard, ShieldAlert, LogIn, User } from "lucide-react"

interface NavbarProps {
  hasResults: boolean
  savedCount: number
  onOpenHistory: () => void
  onOpenPricing: () => void
  onOpenShare: () => void
}

interface CurrentUser {
  id: string
  email: string
  name?: string
  role: "customer" | "admin"
  plan: string
}

export function Navbar({
  hasResults,
  savedCount,
  onOpenHistory,
  onOpenPricing,
  onOpenShare,
}: NavbarProps) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json()
        return null
      })
      .then((data) => {
        if (data && data.user) {
          setUser(data.user)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingUser(false))
  }, [])

  return (
    <header className="border-b border-neutral-200/80 bg-white/85 backdrop-blur-md sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
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
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-medium transition-colors cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
            <span>Pricing</span>
          </button>

          <div className="h-4 w-px bg-neutral-200 mx-1 hidden sm:block" />

          {/* User Auth Buttons */}
          {!loadingUser && (
            <>
              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors cursor-pointer shadow-xs"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                  </Link>

                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold transition-colors cursor-pointer"
                      title="Admin Panel"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Admin</span>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 font-medium transition-colors cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-medium transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>Get Started</span>
                  </Link>
                </div>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
