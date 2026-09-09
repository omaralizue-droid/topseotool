"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FolderKanban,
  Search,
  TrendingUp,
  Link2,
  Globe,
  FileEdit,
  Users2,
  Brain,
  Zap,
  Lightbulb,
  FileText,
  CreditCard,
  Settings,
  Plus,
  PanelLeftClose,
  PanelLeft,
  X,
  Sparkles,
  Layers,
  ShieldCheck,
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

export function AppSidebar({ collapsed, onToggle, activeProjectId, isMobileDrawer, onMobileClose }: AppSidebarProps) {
  const pathname = usePathname()

  const projectPrefix = activeProjectId ? `/projects/${activeProjectId}` : null

  const mainNav = [
    { label: "Executive Cockpit", href: projectPrefix || "/dashboard", icon: LayoutDashboard },
    { label: "Projects Hub", href: "/projects", icon: FolderKanban },
  ]

  const organicTools = [
    { label: "Keyword Explorer", href: projectPrefix ? `${projectPrefix}/keywords` : "/projects", icon: Search, badge: "New" },
    { label: "Rank Tracker", href: projectPrefix ? `${projectPrefix}/rank-tracker` : "/projects", icon: TrendingUp, badge: null },
    { label: "Backlink Intelligence", href: projectPrefix ? `${projectPrefix}/backlinks` : "/projects", icon: Link2, badge: "New" },
  ]

  const technicalTools = [
    { label: "Technical Audit", href: projectPrefix ? `${projectPrefix}/seo-audit` : "/projects", icon: Globe, badge: null },
    { label: "Content Optimizer", href: projectPrefix ? `${projectPrefix}/content-optimizer` : "/projects", icon: FileEdit, badge: "AI" },
    { label: "Competitors", href: projectPrefix ? `${projectPrefix}/competitors` : "/projects", icon: Users2, badge: null },
  ]

  const aeoTools = [
    { label: "AI Search Visibility", href: projectPrefix ? `${projectPrefix}/ai-audit` : "/projects", icon: Brain, badge: "AEO" },
    { label: "Brand Perception", href: projectPrefix ? `${projectPrefix}/ai-perception` : "/projects", icon: Zap, badge: "Live" },
    { label: "Actionable Fixes", href: projectPrefix ? `${projectPrefix}/recommendations` : "/projects", icon: Lightbulb, badge: null },
    { label: "Client Reports", href: projectPrefix ? `${projectPrefix}/reports` : "/reports", icon: FileText, badge: null },
  ]

  const bottomNav = [
    { label: "Billing & Plans", href: "/billing", icon: CreditCard },
    { label: "Settings", href: "/settings", icon: Settings },
  ]

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-200 ease-in-out",
          isMobileDrawer ? "w-[260px] h-screen" : (collapsed ? "w-[60px]" : "w-[240px]")
        )}
      >
        {/* Logo */}
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

        <ScrollArea className="flex-1 py-3 px-2">
          {/* Main Cockpit Nav */}
          <nav className="space-y-0.5">
            {mainNav.map((item) => (
              <NavItem
                key={item.label}
                {...item}
                active={isActive(item.href)}
                collapsed={collapsed && !isMobileDrawer}
              />
            ))}
          </nav>

          {/* Organic & Keywords Section */}
          {(!collapsed || isMobileDrawer) && (
            <div className="mt-4 mb-1.5 px-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                <Search className="h-3 w-3 text-brand" />
                Organic & Keywords
              </p>
            </div>
          )}
          {collapsed && !isMobileDrawer && <div className="mt-3 mb-1 mx-auto w-4 h-px bg-sidebar-border" />}
          <nav className="space-y-0.5">
            {organicTools.map((item) => (
              <NavItem
                key={item.label}
                {...item}
                active={isActive(item.href)}
                collapsed={collapsed && !isMobileDrawer}
                badge={item.badge}
              />
            ))}
          </nav>

          {/* Technical & Content Section */}
          {(!collapsed || isMobileDrawer) && (
            <div className="mt-4 mb-1.5 px-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                <Globe className="h-3 w-3 text-emerald-500" />
                Audits & Content
              </p>
            </div>
          )}
          {collapsed && !isMobileDrawer && <div className="mt-3 mb-1 mx-auto w-4 h-px bg-sidebar-border" />}
          <nav className="space-y-0.5">
            {technicalTools.map((item) => (
              <NavItem
                key={item.label}
                {...item}
                active={isActive(item.href)}
                collapsed={collapsed && !isMobileDrawer}
                badge={item.badge}
              />
            ))}
          </nav>

          {/* AEO & Delivery Section */}
          {(!collapsed || isMobileDrawer) && (
            <div className="mt-4 mb-1.5 px-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                <Brain className="h-3 w-3 text-indigo-500" />
                AEO & Reports
              </p>
            </div>
          )}
          {collapsed && !isMobileDrawer && <div className="mt-3 mb-1 mx-auto w-4 h-px bg-sidebar-border" />}
          <nav className="space-y-0.5">
            {aeoTools.map((item) => (
              <NavItem
                key={item.label}
                {...item}
                active={isActive(item.href)}
                collapsed={collapsed && !isMobileDrawer}
                badge={item.badge}
              />
            ))}
          </nav>

          {(!collapsed || isMobileDrawer) && (
            <div className="mt-4 pt-3 border-t border-sidebar-border">
              <Link
                href="/projects/new"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all duration-150 group"
              >
                <div className="w-4 h-4 rounded border border-dashed border-sidebar-border group-hover:border-brand/40 flex items-center justify-center transition-colors">
                  <Plus className="h-2.5 w-2.5" />
                </div>
                New Project
              </Link>
            </div>
          )}
        </ScrollArea>

        {/* Bottom nav */}
        <div className="px-2 py-2 space-y-0.5 border-t border-sidebar-border shrink-0">
          {bottomNav.map((item) => (
            <NavItem
              key={item.label}
              {...item}
              active={isActive(item.href)}
              collapsed={collapsed && !isMobileDrawer}
            />
          ))}
        </div>
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
        "relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-150",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-brand"
          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent font-medium"
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white/60 rounded-r-full" />
      )}
      <Icon className={cn("h-4 w-4 shrink-0", active ? "opacity-100" : "opacity-75")} />
      {!collapsed && (
        <span className="truncate flex-1 text-xs">{label}</span>
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
        <TooltipContent side="right" className="flex items-center gap-2">
          {label}
          {badge && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand text-white">{badge}</span>}
        </TooltipContent>
      </Tooltip>
    )
  }
  return item
}