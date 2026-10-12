"use client"

import { useState } from "react"
import { FileCode2, Copy, Check, Download } from "lucide-react"
import type { AiReport, SiteSnapshot } from "@/lib/analyzer/types"

interface FixFilesTabProps {
  report: AiReport
  site: SiteSnapshot
}

type CodeTab = "llms" | "schema" | "robots" | "meta"

export function FixFilesTab({ report, site }: FixFilesTabProps) {
  const [codeTab, setCodeTab] = useState<CodeTab>("llms")
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const downloadFile = (filename: string, content: string, mime = "text/plain") => {
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const metaSnippet = `<title>${report.metaTitle}</title>\n<meta name="description" content="${report.metaDescription}" />\n<meta property="og:title" content="${report.metaTitle}" />\n<meta property="og:description" content="${report.metaDescription}" />`

  const activeSnippet =
    codeTab === "llms"
      ? report.llmsTxt
      : codeTab === "schema"
      ? report.schemaJsonLd
      : codeTab === "robots"
      ? report.robotsTxt
      : metaSnippet

  const activeFilename =
    codeTab === "llms"
      ? "llms.txt"
      : codeTab === "schema"
      ? "schema-organization.jsonld"
      : codeTab === "robots"
      ? "robots.txt"
      : "meta-tags.html"

  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-sm font-bold text-neutral-900 mb-1 flex items-center gap-2">
          <FileCode2 className="w-4 h-4 text-emerald-600" />
          <span>Pre-Engineered Fix Code (Copy &amp; Paste or Download)</span>
        </h4>
        <p className="text-xs text-neutral-500">
          Deploy these tailored standard files to ensure AI crawlers accurately understand, index, and recommend your platform.
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-1.5 border-b border-neutral-200 pb-2">
        <button
          type="button"
          onClick={() => setCodeTab("llms")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
            codeTab === "llms"
              ? "bg-neutral-900 text-white shadow-2xs"
              : "bg-neutral-100 text-neutral-600 hover:text-neutral-900"
          }`}
        >
          llms.txt
        </button>
        <button
          type="button"
          onClick={() => setCodeTab("schema")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
            codeTab === "schema"
              ? "bg-neutral-900 text-white shadow-2xs"
              : "bg-neutral-100 text-neutral-600 hover:text-neutral-900"
          }`}
        >
          Schema JSON-LD
        </button>
        <button
          type="button"
          onClick={() => setCodeTab("robots")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
            codeTab === "robots"
              ? "bg-neutral-900 text-white shadow-2xs"
              : "bg-neutral-100 text-neutral-600 hover:text-neutral-900"
          }`}
        >
          robots.txt
        </button>
        <button
          type="button"
          onClick={() => setCodeTab("meta")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
            codeTab === "meta"
              ? "bg-neutral-900 text-white shadow-2xs"
              : "bg-neutral-100 text-neutral-600 hover:text-neutral-900"
          }`}
        >
          Meta Tags
        </button>
      </div>

      {/* Code Container */}
      <div className="relative rounded-xl bg-neutral-950 p-4 text-neutral-100 font-mono text-xs overflow-x-auto shadow-inner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-neutral-800 text-[11px] text-neutral-400">
          <span>
            {codeTab === "llms"
              ? `Destination: https://${site.domain}/llms.txt (root directory)`
              : codeTab === "schema"
              ? "Destination: <head> section of homepage"
              : codeTab === "robots"
              ? `Destination: https://${site.domain}/robots.txt`
              : "Destination: <head> section of homepage"}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadFile(activeFilename, activeSnippet)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-white transition-colors cursor-pointer"
              title="Download file directly"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Download</span>
            </button>

            <button
              type="button"
              onClick={() => copyToClipboard(codeTab, activeSnippet)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-white transition-colors cursor-pointer"
            >
              {copiedKey === codeTab ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Snippet</span>
                </>
              )}
            </button>
          </div>
        </div>

        <pre className="whitespace-pre overflow-x-auto text-[11.5px] leading-relaxed text-neutral-200">
          {activeSnippet}
        </pre>
      </div>
    </div>
  )
}
