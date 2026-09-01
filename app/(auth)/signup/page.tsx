"use client"
import { useState, Suspense } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, Check } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { registerSchema, type RegisterInput } from "@/lib/validations"
import { signIn } from "next-auth/react"

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan") ?? ""
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  })

  async function onSubmit(values: RegisterInput) {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, plan }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? "Registration failed"); return }

      await signIn("credentials", { email: values.email, password: values.password, redirect: false })
      setDone(true)
      setTimeout(() => router.push("/onboarding"), 600)
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="w-full text-center">
        <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center mx-auto mb-4">
          <Check className="h-6 w-6 text-brand-foreground" />
        </div>
        <h2 className="font-semibold mb-1">Account created!</h2>
        <p className="text-sm text-muted-foreground">Redirecting to setup onboarding...</p>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Full name</FormLabel>
            <FormControl><Input placeholder="Your name" autoComplete="name" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Work email</FormLabel>
            <FormControl><Input type="email" placeholder="you@company.com" autoComplete="email" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl><Input type="password" placeholder="Min. 8 characters" autoComplete="new-password" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account & start setup
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full border-brand text-brand hover:bg-brand/10"
          onClick={() => {
            router.push("/dashboard")
          }}
        >
          ⚡ Enter Dashboard (Testing Mode)
        </Button>
      </form>
    </Form>
  )
}

export default function SignupPage() {
  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Get started free</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Create your TOPSEOTOOL account</p>
      </div>

      <Suspense fallback={<div className="text-center text-sm text-muted-foreground">Loading form...</div>}>
        <SignupForm />
      </Suspense>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="underline hover:text-foreground">Terms</Link> and{" "}
        <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
      </p>
      <div className="mt-6 text-center">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-brand hover:underline font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  )
}