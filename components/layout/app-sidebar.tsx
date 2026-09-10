"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FolderKanban,
  ShieldCheck,
  Search,
  TrendingUp,
  Users2,
  Link2,
  FileEdit,
  PenTool,
  Layers,
  BarChart3,
  Gauge,
  FileText,
  Bell,
  Plug,
  KeyRound,
  Users,
  CreditCard,
  Settings,
  Palette,
  PanelLeftClose,
  PanelLeft,
  X,
  Sparkles,
  Plus,
  Terminal,
  ShieldAlert
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AppSidebarProps {
  collapsed: boolean
  onToggle: () => void
  activeProjectId?: string
  isMobileDrawer?: boolean
  onMobileClose?: () => void
}

export function AppSidebar({
  collapsed,
  onToggle,
  activeProjectId,
  isMobileDrawer,
  onMobileClose,
}: AppSidebarProps) {
  const pathname = usePathname()

  const projectPrefix = activeProjectId ? `/projects/${activeProjectId}` : null
  const defaultProjectPrefix = "/projects/demo"

  // 1. Dashboard, 2. Projects
  const coreNav = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Projects", href: "/projects", icon: FolderKanban },
  ]

  // 3. Site Audit, 4. Keyword Research, 5. Keyword Rank Tracker, 6. Competitor Analysis,
  // 7. Backlink Explorer, 8. Content Optimizer, 9. SEO Writing Assistant, 10. SERP Analyzer
  const seoSuite = [
    {
      label: "Site Audit",
      href: projectPrefix ? `${projectPrefix}/seo-audit` : `${defaultProjectPrefix}/seo-audit`,
      icon: ShieldCheck,
      badge: "CrUX"
    },
    {
      label: "Keyword Research",
      href: projectPrefix ? `${projectPrefix}/keywords` : `${defaultProjectPrefix}/keywords`,
      icon: Search,
      badge: null
    },
    {
      label: "Keyword Rank Tracker",
      href: projectPrefix ? `${projectPrefix}/rank-tracker` : `${defaultProjectPrefix}/rank-tracker`,
      icon: TrendingUp,
      badge: null
    },
    {
      label: "Competitor Analysis",
      href: projectPrefix ? `${projectPrefix}/competitors` : `${defaultProjectPrefix}/competitors`,
      icon: Users2,
      badge: null
    },
    {
      label: "Backlink Explorer",
      href: projectPrefix ? `${projectPrefix}/backlinks` : `${defaultProjectPrefix}/backlinks`,
      icon: Link2,
      badge: "DR"
    },
    {
      label: "Content Optimizer",
      href: projectPrefix ? `${projectPrefix}/content-optimizer` : `${defaultProjectPrefix}/content-optimizer`,
      icon: FileEdit,
      badge: "AI"
    },
    {
      label: "SEO Writing Assistant",
      href: projectPrefix ? `${projectPrefix}/writing-assistant` : `${defaultProjectPrefix}/writing-assistant`,
      icon: PenTool,
      badge: "NLP"
    },
    {
      label: "SERP Analyzer",
      href: projectPrefix ? `${projectPrefix}/serp-analyzer` : `${defaultProjectPrefix}/serp-analyzer`,
      icon: Layers,
      badge: null
    },
  ]

  // 11. Traffic Insights, 12. Site Performance, 13. Reports, 14. Alerts
  const performanceSuite = [
    {
      label: "Traffic Insights",
      href: projectPrefix ? `${projectPrefix}/traffic-insights` : `${defaultProjectPrefix}/traffic-insights`,
      icon: BarChart3,
      badge: null
    },
    {
      label: "Site Performance",
      href: projectPrefix ? `${projectPrefix}/site-performance` : `${defaultProjectPrefix}/site-performance`,
      icon: Gauge,
      badge: null
    },
    {
      label: "Reports",
      href: projectPrefix ? `${projectPrefix}/reports` : "/reports",
      icon: FileText,
      badge: null
    },
    {
      label: "Alerts",
      href: "/alerts",
      icon: Bell,
      badge: "Live"
    },
  ]

  // 15. Integrations, 16. API, 17. Team, 18. Billing, 19. Settings
  const settingsSuite = [
    { label: "Super Admin", href: "/admin", icon: ShieldAlert, badge: "Admin" },
    { label: "White-Label", href: "/settings/branding", icon: Palette, badge: "Agency" },
    { label: "Integrations", href: "/settings/integrations", icon: Plug, badge: null },
    { label: "Developer API", href: "/developers", icon: Terminal, badge: "v1" },
    { label: "API Settings", href: "/settings/api", icon: KeyRound, badge: null },
    { label: "Team", href: "/settings/team", icon: Users, badge: "RBAC" },
    { label: "Billing", href: "/billing", icon: CreditCard, badge: null },
    { label: "Settings", href: "/settings", icon: Settings, badge: null },
  ]

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    if (href === "/projects") return pathname === "/projects"
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-200 ease-in-out",
          isMobileDrawer ? "w-[260px] h-screen" : (collapsed ? "w-[60px]" : "w-[250px]")
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center h-14 px-3 border-b border-sidebar-border shrink-0 gap-2">
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-gradient text-white font-bold text-sm shrink-0 select-none shadow-brand">
              <Sparkles className="h-4 w-4" />
            </div>
            {(!collapsed || isMobileDrawer) && (
              <span className="font-extrabold text-sm tracking-tight truncate text-brand-gradient">
                TOPSEOTOOL
              </span>
            )}
          </Link>
          {isMobileDrawer ? (
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={onMobileClose}
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={onToggle}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {/* Navigation Stream */}
        <ScrollArea className="flex-1 py-3 px-2">
          {/* Main Group: Dashboard & Projects */}
          <nav className="space-y-0.5">
            {coreNav.map((item) => (
              <NavItem
                key={item.label}
                {...item}
                active={isActive(item.href)}
                collapsed={collapsed && !isMobileDrawer}
              />
            ))}
          </nav>

          {/* SEO & Research Suite */}
          {(!collapsed || isMobileDrawer) && (
            <div className="mt-4 mb-1.5 px-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                <Search className="h-3 w-3 text-brand" />
                SEO &amp; Research
              </p>
            </div>
          )}
          {collapsed && !isMobileDrawer && <div className="mt-3 mb-1 mx-auto w-4 h-px bg-sidebar-border" />}
          <nav className="space-y-0.5">
            {seoSuite.map((item) => (
              <NavItem
                key={item.label}
                {...item}
                active={isActive(item.href)}
                collapsed={collapsed && !isMobileDrawer}
                badge={item.badge}
              />
            ))}
          </nav>

          {/* Performance & Reports Suite */}
          {(!collapsed || isMobileDrawer) && (
            <div className="mt-4 mb-1.5 px-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                <BarChart3 className="h-3 w-3 text-emerald-500" />
                Analytics &amp; Reports
              </p>
            </div>
          )}
          {collapsed && !isMobileDrawer && <div className="mt-3 mb-1 mx-auto w-4 h-px bg-sidebar-border" />}
          <nav className="space-y-0.5">
            {performanceSuite.map((item) => (
              <NavItem
                key={item.label}
                {...item}
                active={isActive(item.href)}
                collapsed={collapsed && !isMobileDrawer}
                badge={item.badge}
              />
            ))}
          </nav>

          {/* Management & Configuration Suite */}
          {(!collapsed || isMobileDrawer) && (
            <div className="mt-4 mb-1.5 px-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                <Settings className="h-3 w-3 text-indigo-500" />
                Workspace &amp; Config
              </p>
            </div>
          )}
          {collapsed && !isMobileDrawer && <div className="mt-3 mb-1 mx-auto w-4 h-px bg-sidebar-border" />}
          <nav className="space-y-0.5">
            {settingsSuite.map((item) => (
              <NavItem
                key={item.label}
                {...item}
                active={isActive(item.href)}
                collapsed={collapsed && !isMobileDrawer}
                badge={item.badge}
              />
            ))}
          </nav>

          {/* Quick Create Project */}
          {(!collapsed || isMobileDrawer) && (
            <div className="mt-4 pt-3 border-t border-sidebar-border">
              <Link
                href="/projects"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all duration-150 group"
              >
                <div className="w-4 h-4 rounded border border-dashed border-sidebar-border group-hover:border-brand/40 flex items-center justify-center transition-colors">
                  <Plus className="h-2.5 w-2.5" />
                </div>
                New Workspace Project
              </Link>
            </div>
          )}
        </ScrollArea>
      </aside>
    </TooltipProvider>
  )
}

interface NavItemProps {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  active: boolean
  collapsed: boolean
  badge?: string | null
}

function NavItem({ label, href, icon: Icon, active, collapsed, badge }: NavItemProps) {
  const item = (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-all duration-150",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-brand"
          : "text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent font-medium"
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white/70 rounded-r-full" />
      )}
      <Icon className={cn("h-4 w-4 shrink-0", active ? "opacity-100" : "opacity-75")} />
      {!collapsed && (
        <span className="truncate flex-1">{label}</span>
      )}
      {!collapsed && badge && (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-brand/20 text-brand dark:bg-white/20 dark:text-white/90 tracking-wide shrink-0">
          {badge}
        </span>
      )}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{item}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2 text-xs">
          {label}
          {badge && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand text-white">{badge}</span>}
        </TooltipContent>
      </Tooltip>
    )
  }
  return item
}