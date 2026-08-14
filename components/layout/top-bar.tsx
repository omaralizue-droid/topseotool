"use client"
import { useState } from "react"
import { Bell, Search, HelpCircle, Building2, ChevronDown, Check, LogOut, Settings, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

interface TopBarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  organizations?: Array<{ id: string; name: string; slug: string }>
  activeOrgId?: string
}

export function TopBar({ user, organizations = [], activeOrgId }: TopBarProps) {
  const [activeOrg, setActiveOrg] = useState(
    organizations.find((o) => o.id === activeOrgId) ?? organizations[0] ?? { id: "default", name: "My Organization", slug: "my-org" }
  )
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 gap-3 shrink-0 z-30">
      {/* Organization Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-2 px-2 text-xs font-medium hover:bg-accent border border-border/50">
            <div className="w-5 h-5 rounded bg-brand-muted text-brand flex items-center justify-center font-bold text-[10px]">
              {activeOrg.name[0]?.toUpperCase()}
            </div>
            <span className="truncate max-w-[120px] font-semibold">{activeOrg.name}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground ml-1 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Organizations</DropdownMenuLabel>
          <DropdownMenuGroup>
            {organizations.length > 0 ? (
              organizations.map((org) => (
                <DropdownMenuItem key={org.id} onClick={() => setActiveOrg(org)} className="flex items-center justify-between text-xs cursor-pointer">
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate font-medium">{org.name}</span>
                  </div>
                  {org.id === activeOrg.id && <Check className="h-3.5 w-3.5 text-brand" />}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem className="text-xs font-medium">{activeOrg.name}</DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Global Search */}
      <div className="relative flex-1 max-w-sm ml-2">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search projects, audits, mentions..."
          className="pl-8 h-8 text-xs bg-muted/40 border-border/60 focus-visible:ring-1"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Help Link */}
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" asChild>
          <Link href="/blog" title="Help & Guides">
            <HelpCircle className="h-4 w-4" />
          </Link>
        </Button>

        {/* Notifications */}
        <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground relative" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand animate-pulse" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <span className="text-[10px] text-brand bg-brand-muted px-2 py-0.5 rounded font-semibold">New</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-3 text-xs space-y-2">
              <div className="p-2 rounded bg-muted/50 border border-border/50">
                <p className="font-medium text-foreground">AI Search Scan Completed</p>
                <p className="text-muted-foreground text-[11px]">TopSEOTOOL achieved a 92% visibility score in ChatGPT.</p>
                <span className="text-[10px] text-muted-foreground mt-1 block">10 minutes ago</span>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full ml-1" aria-label="User menu">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} />
                <AvatarFallback className="text-xs bg-brand text-brand-foreground font-semibold">
                  {getInitials(user.name ?? user.email ?? "U")}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="font-medium truncate text-sm">{user.name ?? "User"}</p>
              <p className="text-xs text-muted-foreground font-normal truncate">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer text-xs">
              <Link href="/settings"><Settings className="h-3.5 w-3.5 mr-2" />Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer text-xs">
              <Link href="/billing"><CreditCard className="h-3.5 w-3.5 mr-2" />Billing</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive text-xs cursor-pointer"
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