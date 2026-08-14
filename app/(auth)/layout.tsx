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
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center h-14 px-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2 font-semibold text-sm hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-brand text-brand-foreground font-bold text-xs">T</div>
          <span>TOPSEOTOOL</span>
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center p-6">
        {children}
      </div>
    </div>
  )
}