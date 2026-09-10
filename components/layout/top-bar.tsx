"use client"

import { useState } from "react"
import {
  Bell, Search, HelpCircle, Building2, ChevronDown, Check, LogOut,
  Settings, CreditCard, Menu, Sparkles, CheckCheck, Plus,
  TrendingUp, AlertTriangle, ExternalLink, Zap, ShieldCheck,
  Globe, KeyRound, Users, FileText, Layers, BarChart3,
  PenTool, Gauge, Plug, BookOpen, MessageCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { getInitials } from "@/lib/utils"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { useEntitlements } from "@/hooks/use-entitlements"

interface TopBarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  organizations?: Array<{ id: string; name: string; slug: string }>
  activeOrgId?: string
  onMobileMenuOpen?: () => void
}

interface NotificationItem {
  id: string
  title: string
  desc: string
  time: string
  unread: boolean
  type: "success" | "warning" | "ai"
  link?: string
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "AI Search Share +8.2%",
    desc: "Perplexity & ChatGPT cited your domain for 'Best enterprise SEO tools'.",
    time: "8m ago",
    unread: true,
    type: "ai",
    link: "/projects/demo/ai-perception"
  },
  {
    id: "2",
    title: "Core Web Vitals Pass",
    desc: "LCP improved from 2.4s to 1.4s across 142 indexed URLs.",
    time: "42m ago",
    unread: true,
    type: "success",
    link: "/projects/demo/site-performance"
  },
  {
    id: "3",
    title: "Competitor Rank Shift Detected",
    desc: "Semrush lost #1 position on 8 high-intent keyword queries.",
    time: "2h ago",
    unread: false,
    type: "warning",
    link: "/projects/demo/competitors"
  }
]

// Instant search directory indexing all 19 sidebar capabilities
const ALL_TOOLS_DIRECTORY = [
  { title: "Dashboard", href: "/dashboard", desc: "Executive Cockpit & Overview", category: "Core" },
  { title: "Projects", href: "/projects", desc: "Workspace Projects Hub", category: "Core" },
  { title: "Site Audit", href: "/projects/demo/seo-audit", desc: "Technical Health & Crawl Diagnostics", category: "SEO" },
  { title: "Keyword Research", href: "/projects/demo/keywords", desc: "Global Search Volume & KD Explorer", category: "SEO" },
  { title: "Keyword Rank Tracker", href: "/projects/demo/rank-tracker", desc: "Daily Positions & SERP Radar", category: "SEO" },
  { title: "Competitor Analysis", href: "/projects/demo/competitors", desc: "Keyword Overlap & Domain Gap", category: "SEO" },
  { title: "Backlink Explorer", href: "/projects/demo/backlinks", desc: "Domain Rating & Toxic Link Audit", category: "SEO" },
  { title: "Content Optimizer", href: "/projects/demo/content-optimizer", desc: "Real-Time NLP Content Score", category: "Content" },
  { title: "SEO Writing Assistant", href: "/projects/demo/writing-assistant", desc: "Readability, Tone & Generative Salience", category: "Content" },
  { title: "SERP Analyzer", href: "/projects/demo/serp-analyzer", desc: "Top 100 Correlation & Features", category: "SEO" },
  { title: "Traffic Insights", href: "/projects/demo/traffic-insights", desc: "Organic Visits & AI Referrals", category: "Analytics" },
  { title: "Site Performance", href: "/projects/demo/site-performance", desc: "Core Web Vitals (LCP, INP, CLS)", category: "Analytics" },
  { title: "Reports", href: "/reports", desc: "Executive PDF Reports & Share Links", category: "Reports" },
  { title: "Alerts", href: "/alerts", desc: "Automated SEO & Algorithm Surveillance", category: "Surveillance" },
  { title: "Integrations", href: "/settings/integrations", desc: "GSC, GA4, Slack & BigQuery", category: "Config" },
  { title: "API", href: "/settings/api", desc: "REST v1 Credentials & Webhooks", category: "Config" },
  { title: "Team", href: "/settings/team", desc: "Workspace Members & 5-Tier RBAC", category: "Config" },
  { title: "Billing", href: "/billing", desc: "Plan Tiers, Invoices & 9 Usage Meters", category: "Config" },
  { title: "Settings", href: "/settings", desc: "Workspace Preferences & General Config", category: "Config" },
]

export function TopBar({ user, organizations = [], activeOrgId, onMobileMenuOpen }: TopBarProps) {
  const { planKey } = useEntitlements()

  const [activeOrg, setActiveOrg] = useState(
    organizations.find((o) => o.id === activeOrgId) ??
    organizations[0] ?? { id: "default", name: "TOPSEOTOOL Enterprise", slug: "topseotool-hq" }
  )
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const unreadCount = notifications.filter(n => n.unread).length

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
  }

  const filteredTools = searchQuery.trim()
    ? ALL_TOOLS_DIRECTORY.filter(
        l => l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             l.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
             l.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  return (
    <header className="h-14 border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 flex items-center px-3 sm:px-5 gap-2 sm:gap-3 shrink-0 z-30 sticky top-0 transition-colors">

      {/* Hamburger — mobile only */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 rounded-lg"
        onClick={onMobileMenuOpen}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* 1. Workspace Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-2 px-2.5 text-xs font-medium hover:bg-accent/80 border border-border/60 rounded-lg max-w-[160px] sm:max-w-none transition-all shadow-xs"
          >
            <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-brand to-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shadow-xs shrink-0">
              {activeOrg.name[0]?.toUpperCase()}
            </div>
            <span className="truncate max-w-[90px] sm:max-w-[140px] font-semibold text-foreground tracking-tight">
              {activeOrg.name}
            </span>
            <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 p-1.5 shadow-xl border-border/80 backdrop-blur-lg">
          <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1">
            Active Workspace
          </DropdownMenuLabel>
          <DropdownMenuGroup className="space-y-0.5">
            {organizations.length > 0 ? (
              organizations.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => setActiveOrg(org)}
                  className="flex items-center justify-between text-xs px-2.5 py-2 rounded-md cursor-pointer focus:bg-brand/10 focus:text-brand"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate font-medium">{org.name}</span>
                  </div>
                  {org.id === activeOrg.id && <Check className="h-3.5 w-3.5 text-brand" />}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem className="text-xs font-medium px-2.5 py-2">
                <Building2 className="h-3.5 w-3.5 text-brand mr-2" />
                {activeOrg.name}
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuItem asChild className="text-xs font-medium px-2.5 py-1.5 cursor-pointer">
            <Link href="/settings/team">
              <Plus className="h-3.5 w-3.5 mr-2 text-brand" /> Manage Workspaces &amp; Team
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 2. Global Search with instant multi-tool suggestions */}
      <div className="relative flex-1 max-w-xs sm:max-w-md ml-1 sm:ml-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools, metrics, keywords... (⌘K)"
            className="pl-8 pr-12 h-8 text-xs bg-muted/40 hover:bg-muted/60 border-border/60 focus-visible:ring-1 focus-visible:ring-brand rounded-lg transition-all"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-4 select-none items-center gap-1 rounded border border-border/60 bg-muted px-1.5 font-mono text-[9px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>

        {/* Live Search Quick Results */}
        {searchQuery.trim().length > 0 && (
          <div className="absolute top-full mt-1.5 left-0 w-full bg-popover/95 backdrop-blur-md border border-border rounded-xl shadow-2xl p-2 z-50 animate-in fade-in-0 zoom-in-95 max-h-80 overflow-y-auto">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase px-2 py-1">
              Matching Tools &amp; Pages ({filteredTools.length})
            </div>
            {filteredTools.length > 0 ? (
              filteredTools.map((tool) => (
                <Link
                  key={tool.title}
                  href={tool.href}
                  onClick={() => setSearchQuery("")}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent text-xs group transition-colors"
                >
                  <div>
                    <div className="font-semibold text-foreground group-hover:text-brand transition-colors flex items-center gap-1.5">
                      <span>{tool.title}</span>
                      <Badge variant="outline" className="text-[9px] py-0 px-1 font-normal text-muted-foreground">
                        {tool.category}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground">{tool.desc}</div>
                  </div>
                  <Zap className="h-3.5 w-3.5 text-muted-foreground group-hover:text-brand" />
                </Link>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-muted-foreground">
                No tools matching "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="ml-auto flex items-center gap-1 sm:gap-1.5">

        {/* 3. Notifications Feed */}
        <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground relative rounded-lg"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand ring-2 ring-background animate-pulse" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 shadow-2xl border-border/80 backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">Real-Time Alerts</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] text-brand bg-brand-muted px-2 py-0.5 rounded-full font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="h-3 w-3" /> Mark all read
                </button>
              )}
            </div>

            <div className="p-2 divide-y divide-border/30 max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-2.5 rounded-lg transition-colors flex items-start gap-3 ${
                    n.unread ? "bg-accent/40 hover:bg-accent/70" : "hover:bg-muted/50 opacity-80"
                  }`}
                >
                  <div className="mt-0.5">
                    {n.type === "ai" && (
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                        <Sparkles className="h-3.5 w-3.5" />
                      </div>
                    )}
                    {n.type === "success" && (
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <TrendingUp className="h-3.5 w-3.5" />
                      </div>
                    )}
                    {n.type === "warning" && (
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-semibold text-xs text-foreground truncate">{n.title}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{n.desc}</p>
                    {n.link && (
                      <Link
                        href={n.link}
                        onClick={() => setNotificationsOpen(false)}
                        className="inline-flex items-center gap-1 text-[10px] text-brand font-medium hover:underline mt-1.5"
                      >
                        Inspect details <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2 border-t border-border/60 bg-muted/20 text-center">
              <Link
                href="/alerts"
                onClick={() => setNotificationsOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground font-medium"
              >
                Manage all automated alerts →
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 4. Help Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
              aria-label="Help & Documentation"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 p-1.5 shadow-2xl border-border/80 backdrop-blur-xl">
            <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1">
              Help &amp; Resources
            </DropdownMenuLabel>
            <DropdownMenuGroup className="space-y-0.5">
              <DropdownMenuItem asChild className="cursor-pointer text-xs px-2.5 py-2 rounded-md">
                <Link href="/blog">
                  <BookOpen className="h-3.5 w-3.5 mr-2 text-brand" /> SEO Playbooks &amp; Guides
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer text-xs px-2.5 py-2 rounded-md">
                <Link href="/settings/api">
                  <KeyRound className="h-3.5 w-3.5 mr-2 text-brand" /> REST API Documentation
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs px-2.5 py-2 rounded-md flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Systems Operational
                </span>
                <span className="text-[10px] font-mono">99.99%</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer text-xs px-2.5 py-2 rounded-md">
                <Link href="/pricing#enterprise">
                  <MessageCircle className="h-3.5 w-3.5 mr-2 text-brand" /> Contact Priority Support
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* 5. User Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full ml-0.5 ring-1 ring-border/80 hover:ring-brand/50 transition-all"
              aria-label="User menu"
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? "User"} />
                <AvatarFallback className="text-xs bg-gradient-to-tr from-brand to-indigo-600 text-white font-semibold">
                  {getInitials(user?.name ?? user?.email ?? "U")}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-1.5 shadow-2xl border-border/80 backdrop-blur-xl">
            <DropdownMenuLabel className="px-2.5 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <p className="font-semibold truncate text-sm text-foreground">
                    {user?.name ?? "Executive User"}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] font-bold border-brand/40 text-brand py-0 px-1.5">
                  {planKey}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-normal truncate mt-0.5 pl-4">
                {user?.email ?? "admin@topseotool.net"}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="space-y-0.5">
              <DropdownMenuItem asChild className="cursor-pointer text-xs px-2.5 py-2 rounded-md">
                <Link href="/settings">
                  <Settings className="h-3.5 w-3.5 mr-2 text-muted-foreground" /> Workspace Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer text-xs px-2.5 py-2 rounded-md">
                <Link href="/settings/team">
                  <Users className="h-3.5 w-3.5 mr-2 text-muted-foreground" /> Team &amp; Permissions (RBAC)
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer text-xs px-2.5 py-2 rounded-md">
                <Link href="/billing">
                  <CreditCard className="h-3.5 w-3.5 mr-2 text-muted-foreground" /> Billing &amp; Usage Limits
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive text-xs cursor-pointer px-2.5 py-2 rounded-md"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-3.5 w-3.5 mr-2" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}