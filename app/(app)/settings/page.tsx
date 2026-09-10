import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { BYPASS_AUTH, MOCK_SESSION } from "@/lib/mock-auth"
import { Settings, User, Key, Bell, Shield } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "Account Settings | TOPSEOTOOL" }

export default async function SettingsPage() {
  const session = BYPASS_AUTH ? MOCK_SESSION : await auth()
  if (!session?.user) redirect("/login")

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-5 sm:space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">Settings</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Manage your account credentials and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4 text-brand" /> Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input defaultValue={session.user.name ?? ""} readOnly />
          </div>
          <div className="grid gap-2">
            <Label>Email address</Label>
            <Input defaultValue={session.user.email ?? ""} readOnly />
          </div>
        </CardContent>
      </Card>

      <Card className="border-brand/30 bg-brand-muted/10">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4 text-brand" /> Agency White-Label &amp; Branding
            </CardTitle>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-brand text-brand-foreground px-2 py-0.5 rounded-md">
              Agency &amp; Enterprise
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Configure custom company name (e.g. ABC Digital), logo, brand colors, custom domain (e.g. reports.abcdigital.com), and email sender masking so clients never see TopSEOTool branding.
          </p>
          <Button size="sm" variant="brand" asChild className="h-8 text-xs gap-1.5 shadow-brand">
            <Link href="/settings/branding">
              Configure White-Label Branding →
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}