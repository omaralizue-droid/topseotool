import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export const metadata: Metadata = {
  title: "Contact Support & Sales | TOPSEOTOOL",
  description: "Get in touch with the TOPSEOTOOL team for enterprise inquiries, custom API integrations, or platform support.",
  alternates: {
    canonical: "/contact",
  },
}

export default function ContactPage() {
  return (
    <div className="py-20 md:py-28 max-w-xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-8">
        <Badge variant="brand" className="mb-3">Get in touch</Badge>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Contact TOPSEOTOOL</h1>
        <p className="text-sm text-muted-foreground">Have questions about our enterprise plans or AI search monitoring?</p>
      </div>

      <form className="space-y-4 bg-card border border-border p-6 rounded-xl shadow-sm">
        <div className="space-y-1.5">
          <Label>Your Name</Label>
          <Input placeholder="John Doe" />
        </div>
        <div className="space-y-1.5">
          <Label>Work Email</Label>
          <Input type="email" placeholder="john@example.com" />
        </div>
        <div className="space-y-1.5">
          <Label>Message</Label>
          <Textarea placeholder="How can we help you?" rows={4} />
        </div>
        <Button type="button" className="w-full">Send Message</Button>
      </form>
    </div>
  )
}