import Link from "next/link"
import { getCurrentUser } from "@/lib/auth/session"
import { listWebsitesByUserId, listScansByUserId, listCompetitorsByUserId, PLAN_DEFINITIONS } from "@/lib/db"
import {
  Globe,
  FileText,
  Users,
  Zap,
  ArrowRight,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
} from "lucide-react"

export default async function DashboardOverviewPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const websites = await listWebsitesByUserId(user.id)
  const scans = await listScansByUserId(user.id)
  const competitors = await listCompetitorsByUserId(user.id)
  const planInfo = PLAN_DEFINITIONS[user.plan] || PLAN_DEFINITIONS.free

  const recentScans = scans.slice(0, 5)

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-blue-400">
            Customer Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Welcome back, {user.name}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Track and optimize how ChatGPT, Perplexity, Claude, and Gemini recommend your brand.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/websites"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Website</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Instant Scanner</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#121824] border border-neutral-800/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs font-medium">Tracked Domains</span>
            <Globe className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">
                {websites.length}
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                / {planInfo.maxWebsites} max
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-2">
              {planInfo.name} Tier
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#121824] border border-neutral-800/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs font-medium">Total Completed Scans</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-3xl font-extrabold text-white">
              {scans.length}
            </span>
            <p className="text-[11px] text-neutral-500 mt-2">
              Lifetime analyses run
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#121824] border border-neutral-800/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs font-medium">Remaining Credits</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">
                {user.scanCredits}
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                / {planInfo.monthlyScanCredits} monthly
              </span>
            </div>
            <Link
              href="/dashboard/billing"
              className="text-[11px] text-blue-400 hover:text-blue-300 mt-2 block"
            >
              Manage Credits &rarr;
            </Link>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#121824] border border-neutral-800/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs font-medium">Competitors Monitored</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <span className="text-3xl font-extrabold text-white">
              {competitors.length}
            </span>
            <p className="text-[11px] text-neutral-500 mt-2">
              Active benchmark targets
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Websites & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tracked Websites Column (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Tracked Websites</span>
            </h2>
            <Link
              href="/dashboard/websites"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {websites.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#121824] border border-neutral-800 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">No websites added yet</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Add your company domain to track crawler readiness, Schema data, and AI mentions.
              </p>
              <Link
                href="/dashboard/websites"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Your First Website</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {websites.map((site) => (
                <div
                  key={site.id}
                  className="p-4 rounded-xl bg-[#121824] border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-950/80 border border-blue-800/60 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                      {site.brandName.slice(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">
                          {site.brandName}
                        </span>
                        <span className="text-xs font-mono text-neutral-400">
                          {site.domain}
                        </span>
                        {site.verified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/80">
                            Unverified
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-neutral-500">
                        Monitoring: {site.monitoringFrequency}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Link
                      href={`/?domain=${encodeURIComponent(site.domain)}&brand=${encodeURIComponent(site.brandName)}`}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
                    >
                      Run AI Scan
                    </Link>
                    <Link
                      href="/dashboard/reports"
                      className="px-3 py-1.5 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-xs font-medium transition-colors"
                    >
                      Reports
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Strategic Next Actions Banner */}
          <div className="p-5 rounded-2xl bg-[#162032] border border-blue-900/50 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">
                Recommended Strategic Actions
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-neutral-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Publish an <code className="text-blue-300 font-mono">/llms.txt</code> file to give ChatGPT and Perplexity verified brand facts.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Inject Schema.org Organization JSON-LD into your homepage <code className="text-blue-300 font-mono">&lt;head&gt;</code> to anchor knowledge graphs.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Review robots.txt to ensure <code className="text-blue-300 font-mono">OAI-SearchBot</code> and <code className="text-blue-300 font-mono">PerplexityBot</code> are not blocked.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Recent Scan Activity Column (1 col on lg) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Recent Scans</span>
            </h2>
            <Link
              href="/dashboard/scans"
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              All Scans
            </Link>
          </div>

          {recentScans.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#121824] border border-neutral-800 text-center space-y-2">
              <p className="text-xs text-neutral-400">No scans executed yet.</p>
              <Link
                href="/"
                className="text-xs text-blue-400 hover:underline font-medium inline-block"
              >
                Run your first scan &rarr;
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className="p-3.5 rounded-xl bg-[#121824] border border-neutral-800 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <span className="font-semibold text-xs text-white block truncate">
                      {scan.brandName}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 block truncate">
                      {scan.domain}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {new Date(scan.startedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-baseline gap-1 justify-end">
                      <span className="font-extrabold font-mono text-sm text-white">
                        {scan.overallScore}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">/100</span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-400 block">
                      {scan.tierLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
