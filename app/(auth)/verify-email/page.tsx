"use client"
import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function VerifyEmailComponent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")

  useEffect(() => {
    if (!token) { setStatus("error"); return }
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => {
        if (res.ok) setStatus("success")
        else setStatus("error")
      })
      .catch(() => setStatus("error"))
  }, [token])

  if (status === "loading") {
    return (
      <div className="text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand mx-auto" />
        <p className="text-sm text-muted-foreground">Verifying your email address...</p>
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h2 className="font-semibold text-lg">Email verified!</h2>
        <p className="text-sm text-muted-foreground">Your account email has been successfully verified.</p>
        <Button asChild className="mt-4"><Link href="/dashboard">Continue to Dashboard</Link></Button>
      </div>
    )
  }

  return (
    <div className="text-center space-y-3">
      <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
        <XCircle className="h-6 w-6" />
      </div>
      <h2 className="font-semibold text-lg">Verification failed</h2>
      <p className="text-sm text-muted-foreground">The email verification link is invalid or has expired.</p>
      <Button variant="outline" asChild className="mt-4"><Link href="/login">Back to Login</Link></Button>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-sm p-6 bg-card border border-border rounded-xl shadow-sm text-center">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
        <VerifyEmailComponent />
      </Suspense>
    </div>
  )
}