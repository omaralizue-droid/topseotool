import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-subtle opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-brand/5 rounded-full blur-3xl pointer-events-none" />
      
      <header className="relative z-10 flex items-center h-14 px-4 sm:px-6 border-b border-border glass">
        <Link href="/" className="flex items-center gap-2 font-bold text-sm hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-brand text-brand-foreground font-bold text-xs shadow-brand">T</div>
          <span className="tracking-tight">TOPSEOTOOL</span>
        </Link>
      </header>
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-sm bg-card/70 backdrop-blur-sm border border-border/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/5">
          {children}
        </div>
      </div>
    </div>
  )
}