"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FolderKanban,
  Globe,
  Brain,
  Users2,
  Zap,
  Lightbulb,
  FileText,
  CreditCard,
  Settings,
  Plus,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AppSidebarProps {
  collapsed: boolean
  onToggle: () => void
  activeProjectId?: string
}

export function AppSidebar({ collapsed, onToggle, activeProjectId }: AppSidebarProps) {
  const pathname = usePathname()

  const projectPrefix = activeProjectId ? `/projects/${activeProjectId}` : null

  const mainNav = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Projects", href: "/projects", icon: FolderKanban },
    { label: "SEO Audit", href: projectPrefix ? `${projectPrefix}/seo-audit` : "/projects", icon: Globe },
    { label: "AI Visibility", href: projectPrefix ? `${projectPrefix}/ai-audit` : "/projects", icon: Brain },
    { label: "Competitors", href: projectPrefix ? `${projectPrefix}/competitors` : "/projects", icon: Users2 },
    { label: "Brand Perception", href: projectPrefix ? `${projectPrefix}/ai-perception` : "/projects", icon: Zap },
    { label: "Recommendations", href: projectPrefix ? `${projectPrefix}/recommendations` : "/projects", icon: Lightbulb },
    { label: "Reports", href: projectPrefix ? `${projectPrefix}/reports` : "/reports", icon: FileText },
  ]

  const bottomNav = [
    { label: "Billing", href: "/billing", icon: CreditCard },
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
          collapsed ? "w-[60px]" : "w-[240px]"
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-14 px-3 border-b border-sidebar-border shrink-0 gap-2">
          <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand text-brand-foreground font-bold text-sm shrink-0 select-none shadow-brand">
              T
            </div>
            {!collapsed && (
              <span className="font-bold text-sm tracking-tight truncate text-sidebar-foreground">
                TOPSEOTOOL
              </span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>

        <ScrollArea className="flex-1 py-3 px-2">
          <nav className="space-y-1">
            {mainNav.map((item) => (
              <NavItem
                key={item.label}
                {...item}
                active={isActive(item.href)}
                collapsed={collapsed}
              />
            ))}
          </nav>

          {!collapsed && (
            <div className="mt-4 pt-4 border-t border-sidebar-border">
              <Link
                href="/projects/new"
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                New Project
              </Link>
            </div>
          )}
        </ScrollArea>

        {/* Bottom nav */}
        <div className="px-2 py-2 space-y-1 border-t border-sidebar-border shrink-0">
          {bottomNav.map((item) => (
            <NavItem
              key={item.label}
              {...item}
              active={isActive(item.href)}
              collapsed={collapsed}
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
}

function NavItem({ label, href, icon: Icon, active, collapsed }: NavItemProps) {
  const item = (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm"
          : "text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{item}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    )
  }
  return item
}