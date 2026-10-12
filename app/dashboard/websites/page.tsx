"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Globe, Plus, Trash2, ShieldCheck, RefreshCw, X, ExternalLink } from "lucide-react"
import type { Website } from "@/lib/db/types"

export default function WebsitesPage() {
  const [websites, setWebsites] = useState<Website[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [domain, setDomain] = useState("")
  const [brandName, setBrandName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  const loadWebsites = useCallback(async () => {
    try {
      const res = await fetch("/api/websites")
      const data = await res.json()
      if (res.ok && data.ok) {
        setWebsites(data.websites)
      }
    } catch {
      /* ignore */
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    async function init() {
      try {
        const res = await fetch("/api/websites")
        const data = await res.json()
        if (!ignore && res.ok && data.ok) {
          setWebsites(data.websites)
        }
      } catch {
        /* ignore */
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }
    init()
    return () => {
      ignore = true
    }
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setActionSuccess(null)

    try {
      const res = await fetch("/api/websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, brandName }),
      })

      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to add website.")
      }

      setDomain("")
      setBrandName("")
      setIsAdding(false)
      setActionSuccess(`Website ${data.website.domain} successfully added.`)
      loadWebsites()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error adding website.")
    }
  }

  const handleDelete = async (id: string, domainName: string) => {
    if (!confirm(`Are you sure you want to remove ${domainName} from your account?`)) return

    try {
      const res = await fetch(`/api/websites/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (res.ok && data.ok) {
        setActionSuccess(`Website ${domainName} removed.`)
        loadWebsites()
      }
    } catch {
      /* ignore */
    }
  }

  const handleVerify = async (id: string) => {
    try {
      const res = await fetch(`/api/websites/${id}/verify`, { method: "POST" })
      const data = await res.json()
      if (res.ok && data.ok) {
        setActionSuccess(data.message)
        loadWebsites()
      }
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            <span>Tracked Websites</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage your domains, configure automated monitoring, and verify ownership
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Website</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-200">
          {actionSuccess}
        </div>
      )}

      {/* Add Modal */}
      {isAdding && (
        <div className="p-5 rounded-2xl bg-[#121824] border border-blue-900/60 shadow-lg space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Add New Domain</h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Domain Name <span className="text-blue-400">*</span>
              </label>
              <input
                type="text"
                required
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Brand Name
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Example Inc"
                className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs cursor-pointer shadow-xs transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Websites Table */}
      {isLoading ? (
        <div className="text-center py-16 text-neutral-500 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
          <span>Loading tracked domains...</span>
        </div>
      ) : websites.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#121824] border border-neutral-800 text-center space-y-3">
          <Globe className="w-8 h-8 text-neutral-500 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No websites tracked yet</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Add your primary website domain to unlock ongoing monitoring and verified citation audits.
          </p>
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-medium cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Domain</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-[#121824]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161f30] border-b border-neutral-800 text-neutral-400 font-semibold">
              <tr>
                <th className="py-3 px-4">Brand &amp; Domain</th>
                <th className="py-3 px-4">Ownership Status</th>
                <th className="py-3 px-4">Monitoring</th>
                <th className="py-3 px-4">Added Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {websites.map((w) => (
                <tr key={w.id} className="hover:bg-neutral-850/50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-950 border border-blue-800/70 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {w.brandName.slice(0, 1)}
                      </div>
                      <div>
                        <span>{w.brandName}</span>
                        <span className="text-[11px] font-mono text-neutral-400 block">
                          {w.domain}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {w.verified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                        <ShieldCheck className="w-3 h-3" />
                        Verified Owner
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleVerify(w.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800 hover:bg-amber-900/60 transition-colors cursor-pointer"
                        title="Click to verify domain"
                      >
                        Verify Domain &rarr;
                      </button>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-neutral-300 capitalize font-mono text-[11px]">
                    {w.monitoringFrequency}
                  </td>

                  <td className="py-3.5 px-4 text-neutral-400">
                    {new Date(w.createdAt).toLocaleDateString()}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/?domain=${encodeURIComponent(w.domain)}&brand=${encodeURIComponent(w.brandName)}`}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] transition-colors"
                      >
                        Run Scan
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(w.id, w.domain)}
                        className="p-1 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Delete website"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
