"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2, Globe, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { createProjectSchema, type CreateProjectInput } from "@/lib/validations"

const COLORS = ["#6366f1","#8b5cf6","#06b6d4","#10b981","#f59e0b","#ef4444","#ec4899","#3b82f6"]

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState(COLORS[0])

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: "", domain: "", description: "", color: COLORS[0] },
  })

  async function onSubmit(values: CreateProjectInput) {
    setLoading(true)
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, color: selectedColor }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? "Failed to create project"); return }
      toast.success("Project created!")
      router.push(`/projects/${data.data.id}`)
    } catch {
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-xl mx-auto animate-fade-in">
      <Button variant="ghost" size="sm" asChild className="mb-4 sm:mb-6 -ml-2 text-muted-foreground">
        <Link href="/projects"><ArrowLeft className="h-4 w-4 mr-1" />Back to projects</Link>
      </Button>

      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">New project</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Add a website to start tracking its SEO and AI visibility.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Project name</FormLabel>
              <FormControl><Input placeholder="My Website" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="domain" render={({ field }) => (
            <FormItem>
              <FormLabel>Domain</FormLabel>
              <FormControl>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="example.com" className="pl-9" {...field} />
                </div>
              </FormControl>
              <FormDescription>Enter the domain without https:// (e.g. example.com)</FormDescription>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel>Description <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
              <FormControl><Textarea placeholder="Brief description of this project..." rows={3} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div>
            <p className="text-sm font-medium mb-2">Project color</p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                  style={{ background: c, outline: selectedColor === c ? `3px solid ${c}` : "none", outlineOffset: "2px" }}
                />
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Create project
          </Button>
        </form>
      </Form>
    </div>
  )
}