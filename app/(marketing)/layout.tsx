import { MarketingFooter } from "@/components/marketing/marketing-footer"
import { OrganizationJsonLd, WebSiteJsonLd, SoftwareApplicationJsonLd } from "@/components/seo/json-ld"

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <SoftwareApplicationJsonLd />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  )
}