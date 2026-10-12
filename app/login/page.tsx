"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sparkles, ArrowRight, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to sign in.")
      }

      router.push(data.redirectUrl || "/dashboard")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFillDemo = (type: "customer" | "admin") => {
    if (type === "admin") {
      setEmail("admin@topseotool.net")
      setPassword("AdminPassword123!")
    } else {
      setEmail("customer@topseotool.net")
      setPassword("Customer123!")
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0f17] text-neutral-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-blue-600 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            TOPSEOTOOL
          </span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Sign in to your account
        </h1>
        <p className="mt-2 text-xs text-neutral-400">
          Access your AI Brand Visibility cockpit and automated monitoring
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#121824] py-8 px-6 sm:px-10 rounded-2xl border border-neutral-800 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 flex items-start gap-2.5 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials helper */}
          <div className="mt-6 pt-5 border-t border-neutral-800/80">
            <span className="block text-[11px] font-mono text-neutral-500 uppercase tracking-wider mb-2">
              Demo Access Credentials:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleFillDemo("customer")}
                className="py-1.5 px-2.5 rounded-lg border border-neutral-700 bg-neutral-900/60 hover:bg-neutral-800 text-neutral-300 font-mono text-[11px] transition-colors text-left"
              >
                Customer: <span className="text-blue-400">customer@...</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo("admin")}
                className="py-1.5 px-2.5 rounded-lg border border-neutral-700 bg-neutral-900/60 hover:bg-neutral-800 text-neutral-300 font-mono text-[11px] transition-colors text-left"
              >
                Admin: <span className="text-purple-400">admin@...</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-neutral-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Create an account
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-[11px] text-neutral-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Encrypted with TLS &bull; Secure JWT Session</span>
        </div>
      </div>
    </div>
  )
}
