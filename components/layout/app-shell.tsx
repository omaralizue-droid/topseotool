"use client"
import { useState, useEffect } from "react"
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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { id: activeProjectId } = useActiveProject(pathname)

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [mobileSidebarOpen])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeProjectId={activeProjectId}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div className="relative animate-slide-in-left">
            <AppSidebar
              collapsed={false}
              onToggle={() => setMobileSidebarOpen(false)}
              activeProjectId={activeProjectId}
              isMobileDrawer
              onMobileClose={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar
          user={user}
          onMobileMenuOpen={() => setMobileSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  )
}