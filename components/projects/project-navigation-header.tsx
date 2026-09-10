"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Activity,
  Brain,
  TrendingUp,
  Search,
  Users2,
  Link2,
  ShieldCheck,
  FileEdit,
  FileText,
  Bell,
  Globe,
  Monitor,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronRight
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ProjectNavigationHeaderProps {
  projectId: string
  domain?: string
  name?: string
  country?: string
  language?: string
  searchEngine?: string
  device?: string
  keywordsCount?: number
  competitorsCount?: number
}

export function ProjectNavigationHeader({
  projectId,
  domain = "example.com",
  name = "Example Project",
  country = "United States",
  language = "English",
  searchEngine = "Google",
  device = "Desktop",
  keywordsCount = 5000,
  competitorsCount = 10,
}: ProjectNavigationHeaderProps) {
  const pathname = usePathname()

  // The 11 Dedicated Project Sections
  const tabs = [
    { label: "Overview", href: `/projects/${projectId}`, icon: LayoutDashboard },
    { label: "SEO Health", href: `/projects/${projectId}/seo-health`, icon: Activity },
    { label: "Visibility", href: `/projects/${projectId}/visibility`, icon: Brain },
    { label: "Rankings", href: `/projects/${projectId}/rankings`, icon: TrendingUp },
    { label: "Keywords", href: `/projects/${projectId}/keywords`, icon: Search },
    { label: "Competitors", href: `/projects/${projectId}/competitors`, icon: Users2 },
    { label: "Backlinks", href: `/projects/${projectId}/backlinks`, icon: Link2 },
    { label: "Site Audit", href: `/projects/${projectId}/seo-audit`, icon: ShieldCheck },
    { label: "Content", href: `/projects/${projectId}/content`, icon: FileEdit },
    { label: "Reports", href: `/projects/${projectId}/reports`, icon: FileText },
    { label: "Alerts", href: `/projects/${projectId}/alerts`, icon: Bell },
  ]

  const isTabActive = (href: string) => {
    if (href === `/projects/${projectId}`) {
      return pathname === `/projects/${projectId}`
    }
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <div className="border-b border-border/70 bg-card/60 backdrop-blur-md sticky top-14 z-20 transition-all">
      {/* Upper bar: Project Identity & Target Badges */}
      <div className="px-4 sm:px-6 md:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-xs">
            {domain[0]?.toUpperCase() ?? "P"}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href="/projects"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
              >
                Projects
              </Link>
              <ChevronRight className="h-3 w-3 text-muted-foreground/60 hidden sm:inline" />
              <h2 className="text-sm sm:text-base font-bold text-foreground truncate tracking-tight">
                {name || domain}
              </h2>
              <a
                href={`https://${domain}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted-foreground hover:text-brand transition-colors inline-flex items-center gap-0.5"
                title="Visit website"
              >
                <span className="font-mono text-[11px]">{domain}</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>

            {/* Target Parameters Badges */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 font-medium bg-muted/60 px-1.5 py-0.5 rounded border border-border/50">
                <Globe className="h-2.5 w-2.5 text-brand" /> {searchEngine} ({country})
              </span>
              <span className="inline-flex items-center gap-1 font-medium bg-muted/60 px-1.5 py-0.5 rounded border border-border/50">
                <Monitor className="h-2.5 w-2.5 text-indigo-500" /> {device}
              </span>
              <span className="inline-flex items-center gap-1 font-medium bg-muted/60 px-1.5 py-0.5 rounded border border-border/50">
                {language}
              </span>
              <span className="inline-flex items-center gap-1 font-medium bg-muted/60 px-1.5 py-0.5 rounded border border-border/50">
                {keywordsCount.toLocaleString()} Keywords
              </span>
              <span className="inline-flex items-center gap-1 font-medium bg-muted/60 px-1.5 py-0.5 rounded border border-border/50">
                {competitorsCount} Rivals
              </span>
            </div>
          </div>
        </div>

        {/* Quick Project Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-7 text-[11px] font-medium"
          >
            <Link href={`/projects/${projectId}/seo-audit`}>
              <RefreshCw className="h-3 w-3 mr-1 text-muted-foreground" /> Run Crawl
            </Link>
          </Button>

          <Button
            variant="brand"
            size="sm"
            asChild
            className="h-7 text-[11px] font-medium"
          >
            <Link href={`/projects/${projectId}/reports`}>
              <Sparkles className="h-3 w-3 mr-1" /> Export Report
            </Link>
          </Button>
        </div>
      </div>

      {/* Lower Bar: 11 Interactive Project Tabs */}
      <div className="px-4 sm:px-6 md:px-8 flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-border/40">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = isTabActive(tab.href)

          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold whitespace-nowrap border-b-2 transition-all duration-150 ${
                active
                  ? "border-brand text-brand bg-brand/[0.03]"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${active ? "text-brand" : "text-muted-foreground/70"}`} />
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
