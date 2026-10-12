import { redirect } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth/session"
import {
  Sparkles,
  LayoutDashboard,
  Globe,
  FileText,
  Users,
  Clock,
  CreditCard,
  Settings,
  LogOut,
  Shield,
  ExternalLink,
} from "lucide-react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Websites", href: "/dashboard/websites", icon: Globe },
    { label: "AI Reports", href: "/dashboard/reports", icon: FileText },
    { label: "Competitors", href: "/dashboard/competitors", icon: Users },
    { label: "Scan History", href: "/dashboard/scans", icon: Clock },
    { label: "Billing & Plans", href: "/dashboard/billing", icon: CreditCard },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-[#0b0f17] text-neutral-100 flex flex-col md:flex-row font-sans selection:bg-blue-600 selection:text-white">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#101622] border-r border-neutral-800/80 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo & Brand */}
          <div className="h-16 px-6 border-b border-neutral-800/80 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold tracking-tight text-white text-base">
                TOPSEOTOOL
              </span>
            </Link>

            <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-blue-950/80 border border-blue-700/60 text-blue-400">
              {user.plan}
            </span>
          </div>

          {/* User Profile Capsule */}
          <div className="p-4 mx-3 my-3 rounded-xl bg-[#161f30] border border-neutral-800/80 flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">
                {user.name}
              </span>
              <span className="text-[11px] text-neutral-400 block truncate font-mono">
                {user.email}
              </span>
            </div>
            <div className="text-right shrink-0 ml-2">
              <span className="text-xs font-mono font-bold text-blue-400 block">
                {user.scanCredits}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-neutral-500 block">
                Credits
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/70 transition-colors"
                >
                  <Icon className="w-4 h-4 text-neutral-400" />
                  <span>{item.label}</span>
                </Link>
              )
            })}

            {/* Admin Switcher if role === admin */}
            {user.role === "admin" && (
              <div className="pt-3 mt-3 border-t border-neutral-800/80">
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-purple-300 bg-purple-950/40 border border-purple-800/60 hover:bg-purple-900/50 transition-colors"
                >
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span>Admin Console</span>
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-neutral-800/80 space-y-2">
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors"
          >
            <span>Public Tool</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </Link>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-screen bg-[#0d121c]">
        {children}
      </main>
    </div>
  )
}
