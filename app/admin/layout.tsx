import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { 
  ShieldAlert, LayoutDashboard, Users, CreditCard, Activity, 
  Cpu, Settings, FileText, ArrowLeft, LogOut, Lock
} from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?from=/admin');
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-200">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-rose-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">403 — Unauthorized Administrative Access</h1>
        <p className="text-slate-400 text-sm max-w-md mb-6">
          Your account (<span className="text-white font-mono">{user.email}</span>) has the <span className="text-blue-400 font-semibold">{user.role}</span> role and is not authorized to access the system administration panel.
        </p>
        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition"
          >
            Go to Customer Dashboard
          </Link>
          <Link
            href="/"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Admin Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'User Management', href: '/admin/users', icon: Users },
    { label: 'Subscriptions & Plans', href: '/admin/subscriptions', icon: CreditCard },
    { label: 'Scan & Report Jobs', href: '/admin/scans', icon: Activity },
    { label: 'AI Providers', href: '/admin/providers', icon: Cpu },
    { label: 'System Settings', href: '/admin/settings', icon: Settings },
    { label: 'Audit Logs', href: '/admin/logs', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo / Admin Badge */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-white text-base tracking-tight">TopSEOTool</span>
                <span className="block text-[10px] text-rose-400 font-semibold uppercase tracking-wider">
                  Admin Console
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition group"
                >
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-rose-400 transition" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info / Back to user dashboard */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs font-semibold text-white truncate">{user.name || user.email}</div>
            <div className="text-[11px] text-rose-400 font-mono">Role: SuperAdmin</div>
          </div>

          <div className="flex items-center justify-between gap-2 px-1 text-xs">
            <Link
              href="/dashboard"
              className="text-slate-400 hover:text-white transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Customer App
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-rose-400 hover:text-rose-300 transition flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
