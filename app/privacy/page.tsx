import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ShieldCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy — TOPSEOTOOL",
  description: "Privacy policy and data protection commitments for TOPSEOTOOL.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-neutral-200/80 p-8 sm:p-12 shadow-xs">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to AI Visibility Tool
        </Link>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-xs uppercase font-mono font-medium tracking-wider text-neutral-400">
            Legal & Compliance
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-neutral-950 mb-3">
          Privacy Policy
        </h1>
        <p className="text-sm text-neutral-500 mb-8">
          Last updated: October 2026
        </p>

        <div className="space-y-6 text-sm text-neutral-700 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-2">1. Overview</h2>
            <p>
              TOPSEOTOOL provides public AI search visibility audits and technical SEO checks. We are committed to transparency and privacy. We do not require account registration or collect private user credentials to run public website audits.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-2">2. What Information We Process</h2>
            <p>
              When you submit a URL for analysis, our servers fetch publicly accessible HTML, robots.txt, and metadata from that website to evaluate technical readiness. We also evaluate search visibility queries using AI search grounding. We do not store private customer personal data.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-2">3. Advertising & Cookies</h2>
            <p>
              We may display third-party advertisements (such as Google AdSense). These third-party vendors use cookies to serve ads based on prior visits to this or other websites. You can opt out of personalized advertising by visiting Google Ads Settings.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-2">4. Data Security</h2>
            <p>
              All requests are transmitted over encrypted TLS connections. Our crawler implements rigorous SSRF safeguards preventing requests to private or internal network endpoints.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-2">5. Contact</h2>
            <p>
              If you have inquiries regarding our data handling or privacy practices, please contact us at support@topseotool.net.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
