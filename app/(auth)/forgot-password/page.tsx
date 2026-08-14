"use client"
import { useState, Suspense } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { forgotPasswordSchema, type LoginInput } from "@/lib/validations"
import { z } from "zod"

const schema = z.object({
  email: z.string().email("Invalid email address"),
})

function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  })

  async function onSubmit(values: { email: string }) {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? "Failed to request password reset"); return }
      setSent(true)
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h2 className="font-semibold text-base">Check your email</h2>
        <p className="text-sm text-muted-foreground">
          We have sent a password reset link to your email address if an account exists.
        </p>
        <Button variant="outline" size="sm" asChild className="mt-4">
          <Link href="/login"><ArrowLeft className="h-4 w-4 mr-2" />Back to login</Link>
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@company.com" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Send reset link
        </Button>
      </form>
    </Form>
  )
}

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Reset your password</h1>
        <p className="text-sm text-muted-foreground">Enter your email and we&apos;ll send you a recovery link</p>
      </div>

      <Suspense fallback={<div className="text-center text-sm text-muted-foreground">Loading...</div>}>
        <ForgotPasswordForm />
      </Suspense>

      <div className="mt-6 text-center">
        <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors">
          <ArrowLeft className="h-3 w-3" /> Back to sign in
        </Link>
      </div>
    </div>
  )
}