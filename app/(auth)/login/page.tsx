"use client"
import { useState, Suspense } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { loginSchema, type LoginInput } from "@/lib/validations"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard"
  const [loading, setLoading] = useState(false)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: LoginInput) {
    setLoading(true)
    const res = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      toast.error("Invalid email or password. Please try again.")
      return
    }
    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Forgot password?
                </Link>
              </div>
              <FormControl>
                <Input type="password" placeholder="••••••••" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
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

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to your TOPSEOTOOL account</p>
      </div>

      <Suspense fallback={<div className="text-center text-sm text-muted-foreground">Loading form...</div>}>
        <LoginForm />
      </Suspense>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-brand hover:underline font-medium">Sign up free</Link>
        </p>
      </div>
    </div>
  )
}