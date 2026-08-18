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
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account credentials and preferences</p>
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
    </div>
  )
}