import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { BYPASS_AUTH, MOCK_SESSION } from "@/lib/mock-auth"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = BYPASS_AUTH ? MOCK_SESSION : await auth()
  if (!session?.user) redirect("/login")

  return (
    <AppShell user={session.user}>
      {children}
    </AppShell>
  )
}