import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Privacy Policy | TOPSEOTOOL",
  description: "Privacy Policy and data protection guidelines for TOPSEOTOOL users.",
  alternates: { canonical: "/privacy" },
}

export default function PrivacyPage() {
  return (
    <div className="py-16 md:py-24 max-w-4xl mx-auto px-4 sm:px-6 space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <Badge variant="brand">Legal & Trust</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-muted-foreground">Last updated: August 14, 2026</p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-muted-foreground text-sm space-y-6 leading-relaxed">
        <p>
          At TOPSEOTOOL, accessible from topseotool.net, one of our main priorities is the privacy of our visitors and registered users. This Privacy Policy document outlines the types of information collected and how we use it.
        </p>

        <h2 className="text-lg font-bold text-foreground mt-6">1. Information We Collect</h2>
        <p>
          When you register for an account, we collect your name, email address, password hash, and organization details. When you crawl websites or test AI visibility prompts, we process target domain URLs and prompt text to calculate search scores.
        </p>

        <h2 className="text-lg font-bold text-foreground mt-6">2. How We Use Your Information</h2>
        <p>
          We use collected information to provide, operate, and maintain our SEO and AI search intelligence services, deliver automated PDF reports, process subscription payments, and communicate platform updates.
        </p>

        <h2 className="text-lg font-bold text-foreground mt-6">3. Payment & Security Data</h2>
        <p>
          Payment processing is handled via Stripe. TOPSEOTOOL does not store credit card numbers or sensitive payment details on our servers. All network transactions utilize TLS/SSL encryption.
        </p>

        <h2 className="text-lg font-bold text-foreground mt-6">4. Contact Us</h2>
        <p>
          If you have additional questions or require more information about our Privacy Policy, please contact our support team at <a href="mailto:support@topseotool.net" className="text-brand underline">support@topseotool.net</a>.
        </p>
      </div>
    </div>
  )
}
