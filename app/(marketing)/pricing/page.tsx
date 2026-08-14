"use client"
import { useState } from "react"
import Link from "next/link"
import { Check, HelpCircle, ArrowRight, Zap, Shield, Sparkles, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { PLANS, PLAN_ORDER, type PlanKey } from "@/types"

const FAQS = [
  {
    q: "How are AI queries counted?",
    a: "Every time you test a prompt across an AI assistant (such as ChatGPT, Gemini, or Perplexity), it consumes 1 AI query credit per engine scanned.",
  },
  {
    q: "Can I upgrade or downgrade at any time?",
    a: "Yes! You can switch plans at any time from your billing dashboard. When upgrading, changes take effect immediately with prorated charges.",
  },
  {
    q: "What is included in White-label Reports?",
    a: "White-label reports (available on Agency and Business plans) allow you to generate PDF executive summaries branded with your agency logo and colors.",
  },
  {
    q: "Is there a free trial for paid plans?",
    a: "You can start on our Free plan with zero risk and no credit card required. Upgrade whenever you need higher crawl volumes and AI tracking capabilities.",
  },
  {
    q: "How does API access work?",
    a: "Business tier customers get full access to our REST API and webhook events to integrate SEO scores and AI visibility metrics into internal BI dashboards.",
  },
]

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly")

  return (
    <div className="py-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-16 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <Badge variant="brand" className="mb-2">Transparent Subscription Pricing</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Invest in your brand&apos;s AI & search visibility
        </h1>
        <p className="text-base text-muted-foreground">
          Measure, monitor, and optimize your presence across traditional Google search and AI engines like ChatGPT, Gemini, and Perplexity.
        </p>

        {/* Interval toggle */}
        <div className="flex items-center justify-center gap-3 pt-6">
          <span className={`text-sm font-medium ${billingInterval === "monthly" ? "text-foreground font-semibold" : "text-muted-foreground"}`}>Monthly</span>
          <button
            type="button"
            onClick={() => setBillingInterval((v) => (v === "monthly" ? "yearly" : "monthly"))}
            className="w-12 h-6 rounded-full bg-muted p-1 transition-colors relative border border-border"
          >
            <div className={`w-4 h-4 rounded-full bg-brand transition-transform ${billingInterval === "yearly" ? "translate-x-6" : ""}`} />
          </button>
          <span className={`text-sm font-medium flex items-center gap-1.5 ${billingInterval === "yearly" ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
            Yearly
            <Badge variant="success" className="text-[10px] py-0 px-1.5">Save ~20%</Badge>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLAN_ORDER.map((key) => {
          const plan = PLANS[key]
          const isPopular = plan.badge !== undefined
          const displayPrice = billingInterval === "yearly" ? plan.yearlyPrice : plan.price

          return (
            <Card
              key={key}
              className={`flex flex-col justify-between relative transition-all ${
                isPopular ? "border-brand shadow-lg shadow-brand/10 scale-[1.02] bg-card" : "border-border bg-card/60"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-brand-foreground px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {plan.badge}
                </div>
              )}
              <CardHeader className="pt-6">
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-xs min-h-[36px] mt-1">{plan.description}</CardDescription>
                <div className="pt-4 pb-2 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold font-mono-nums">${displayPrice}</span>
                  <span className="text-xs text-muted-foreground font-medium">/month</span>
                </div>
                {billingInterval === "yearly" && plan.price > 0 && (
                  <p className="text-[11px] text-emerald-600 font-medium">Billed annually (${displayPrice * 12}/yr)</p>
                )}
              </CardHeader>
              <CardContent className="space-y-3 flex-1">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Included Quotas & Features</div>
                <ul className="space-y-2.5 text-xs">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-foreground">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-4">
                <Button className="w-full" variant={isPopular ? "brand" : "outline"} asChild>
                  <Link href={`/signup?plan=${key}`}>
                    {key === "FREE" ? "Get Started Free" : `Upgrade to ${plan.name}`}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Feature Comparison Matrix */}
      <div className="pt-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Full Plan Feature Matrix</h2>
          <p className="text-sm text-muted-foreground mt-1">Compare side-by-side quotas and features across all tiers.</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 pr-4 font-semibold text-muted-foreground">Capabilities</th>
                    {PLAN_ORDER.map((pk) => (
                      <th key={pk} className="text-center py-3 px-3 font-bold text-foreground">
                        {PLANS[pk].name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { label: "Website Projects", key: "projects" as const, format: (v: number) => (v >= 999 ? "Unlimited" : v.toString()) },
                    { label: "SEO Audits / month", key: "auditsPerMonth" as const, format: (v: number) => (v >= 999 ? "Unlimited" : v.toString()) },
                    { label: "AI Engine Queries / month", key: "aiQueriesPerMonth" as const, format: (v: number) => (v >= 9999 ? "Unlimited" : v.toLocaleString()) },
                    { label: "Competitor Benchmark Slots", key: "competitors" as const, format: (v: number) => (v >= 999 ? "Unlimited" : v.toString()) },
                    { label: "Team Seats", key: "teamSeats" as const, format: (v: number) => (v >= 999 ? "Unlimited" : v === 0 ? "Owner only" : v.toString()) },
                  ].map((row) => (
                    <tr key={row.label}>
                      <td className="py-3 pr-4 font-medium text-foreground">{row.label}</td>
                      {PLAN_ORDER.map((pk) => (
                        <td key={pk} className="text-center py-3 px-3 font-mono-nums">
                          {row.format(PLANS[pk].limits[row.key] as number)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {[
                    { label: "AI Search Visibility Audit Module", key: "aiAudits" as const },
                    { label: "PDF Report Generation", key: "reports" as const },
                    { label: "White-label Client Branding", key: "whiteLabel" as const },
                    { label: "REST API & Webhooks", key: "apiAccess" as const },
                    { label: "Priority Customer Support", key: "prioritySupport" as const },
                  ].map((row) => (
                    <tr key={row.label}>
                      <td className="py-3 pr-4 font-medium text-foreground">{row.label}</td>
                      {PLAN_ORDER.map((pk) => (
                        <td key={pk} className="text-center py-3 px-3">
                          {PLANS[pk].limits[row.key] ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="pt-8 max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>
          <p className="text-sm text-muted-foreground">Everything you need to know about billing and limits.</p>
        </div>
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <Card key={faq.q}>
              <CardHeader className="p-5">
                <CardTitle className="text-base flex items-center gap-2 font-semibold">
                  <HelpCircle className="h-4 w-4 text-brand shrink-0" />
                  {faq.q}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}