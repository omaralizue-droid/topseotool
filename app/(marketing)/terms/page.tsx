import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Terms of Service | TOPSEOTOOL",
  description: "Terms of Service and platform usage rules for TOPSEOTOOL.",
  alternates: { canonical: "/terms" },
}

export default function TermsPage() {
  return (
    <div className="py-16 md:py-24 max-w-4xl mx-auto px-4 sm:px-6 space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <Badge variant="brand">Legal & Governance</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Terms of Service</h1>
        <p className="text-xs text-muted-foreground">Last updated: August 14, 2026</p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-muted-foreground text-sm space-y-6 leading-relaxed">
        <p>
          Welcome to TOPSEOTOOL. By accessing or using our website topseotool.net and associated SaaS services, you agree to be bound by these Terms of Service.
        </p>

        <h2 className="text-lg font-bold text-foreground mt-6">1. Subscription Plans & Usage Quotas</h2>
        <p>
          TOPSEOTOOL provides tier-based subscription plans (Free, Pro, Agency, Business). Each tier includes metered monthly quotas for active projects, technical crawls, and AI assistant query prompts. Quotas reset on the 1st of each calendar month.
        </p>

        <h2 className="text-lg font-bold text-foreground mt-6">2. Acceptable Use Policy</h2>
        <p>
          You agree not to use TOPSEOTOOL to audit websites without authorization, execute malicious automated attacks, bypass network rate limits, or probe internal networks. SSRF attempts and illegal web proxying are strictly prohibited.
        </p>

        <h2 className="text-lg font-bold text-foreground mt-6">3. Cancellation & Refunds</h2>
        <p>
          You may cancel your paid subscription at any time via the billing dashboard. Your active plan will remain available until the end of the current billing period.
        </p>

        <h2 className="text-lg font-bold text-foreground mt-6">4. Contact Support</h2>
        <p>
          For billing inquiries or service support, reach out to <a href="mailto:support@topseotool.net" className="text-brand underline">support@topseotool.net</a>.
        </p>
      </div>
    </div>
  )
}
