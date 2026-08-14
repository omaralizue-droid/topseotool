"use client"
import { useState } from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { TopBar } from "@/components/layout/top-bar"
import { usePathname } from "next/navigation"

interface AppShellProps {
  children: React.ReactNode
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

// Extract active project from pathname
function useActiveProject(pathname: string) {
  const match = pathname.match(/\/projects\/([^/]+)/)
  if (!match) return { id: undefined, name: undefined }
  return { id: match[1], name: undefined } // name fetched per project page
}

export function AppShell({ children, user }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const pathname = usePathname()
  const { id: activeProjectId } = useActiveProject(pathname)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeProjectId={activeProjectId}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar user={user} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}