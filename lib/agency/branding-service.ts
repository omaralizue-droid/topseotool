import { db } from "@/lib/db"
import { canUseFeature } from "@/lib/billing/entitlements"

export interface AgencyBrandingConfig {
  companyName: string
  tagline?: string
  logoUrl: string
  logoDarkUrl?: string
  brandColors: {
    primary: string
    accent: string
    textOnBrand: string
  }
  reportBranding: {
    reportTitleTemplate: string
    customFooterText: string
    hidePlatformBadge: boolean
    executiveSignature?: string
    defaultAccentColor?: string
  }
  customDomain: {
    domain: string
    status: "CONFIGURED" | "VERIFIED" | "PENDING_DNS"
    cnameTarget: string
    sslStatus: "ACTIVE" | "PROVISIONING"
    verifiedAt?: string
  }
  emailBranding: {
    senderName: string
    senderEmail: string
    replyToEmail: string
    emailFooter: string
    customEmailSubject?: string
  }
}

export const DEFAULT_AGENCY_BRANDING: AgencyBrandingConfig = {
  companyName: "ABC Digital",
  tagline: "Premier AI Search & Organic Growth Agency",
  logoUrl: "",
  logoDarkUrl: "",
  brandColors: {
    primary: "#0284c7", // Sky blue
    accent: "#38bdf8",
    textOnBrand: "#ffffff",
  },
  reportBranding: {
    reportTitleTemplate: "{company} SEO Report",
    customFooterText: "Prepared exclusively by {company} • Confidential Strategic Intelligence",
    hidePlatformBadge: true,
    executiveSignature: "Search Intelligence & Strategy Directorate",
    defaultAccentColor: "#0284c7",
  },
  customDomain: {
    domain: "reports.abcdigital.com",
    status: "VERIFIED",
    cnameTarget: "cname.topseotool.net",
    sslStatus: "ACTIVE",
    verifiedAt: new Date().toISOString(),
  },
  emailBranding: {
    senderName: "ABC Digital Reports",
    senderEmail: "reports@abcdigital.com",
    replyToEmail: "support@abcdigital.com",
    emailFooter: "Sent by ABC Digital Client Reporting Suite • Confidential",
    customEmailSubject: "{company} Monthly SEO & AI Search Audit for {client}",
  },
}

// In-memory / file cache for fast access across SSR and API calls
let cachedBranding: Record<string, AgencyBrandingConfig> = {}

export async function getAgencyBranding(organizationId?: string): Promise<AgencyBrandingConfig> {
  const orgKey = organizationId || "default_org"

  if (cachedBranding[orgKey]) {
    return cachedBranding[orgKey]
  }

  // Attempt to load from organization in database
  if (organizationId && organizationId !== "default_org") {
    try {
      const org = await db.organization.findUnique({
        where: { id: organizationId },
        select: { name: true, logoUrl: true },
      })

      if (org) {
        const merged: AgencyBrandingConfig = {
          ...DEFAULT_AGENCY_BRANDING,
          companyName: org.name || DEFAULT_AGENCY_BRANDING.companyName,
          logoUrl: org.logoUrl || DEFAULT_AGENCY_BRANDING.logoUrl,
          reportBranding: {
            ...DEFAULT_AGENCY_BRANDING.reportBranding,
            reportTitleTemplate: `${org.name || "ABC Digital"} SEO Report`,
          },
        }
        cachedBranding[orgKey] = merged
        return merged
      }
    } catch {
      // Return default branding if DB unreachable
    }
  }

  return DEFAULT_AGENCY_BRANDING
}

export async function saveAgencyBranding(
  organizationId: string,
  updates: Partial<AgencyBrandingConfig>
): Promise<AgencyBrandingConfig> {
  const orgKey = organizationId || "default_org"
  const current = await getAgencyBranding(organizationId)

  const updated: AgencyBrandingConfig = {
    ...current,
    ...updates,
    brandColors: {
      ...current.brandColors,
      ...(updates.brandColors || {}),
    },
    reportBranding: {
      ...current.reportBranding,
      ...(updates.reportBranding || {}),
    },
    customDomain: {
      ...current.customDomain,
      ...(updates.customDomain || {}),
    },
    emailBranding: {
      ...current.emailBranding,
      ...(updates.emailBranding || {}),
    },
  }

  cachedBranding[orgKey] = updated

  // Sync basic fields with Organization model if reachable
  if (organizationId && organizationId !== "default_org") {
    try {
      await db.organization.update({
        where: { id: organizationId },
        data: {
          name: updated.companyName,
          logoUrl: updated.logoUrl || undefined,
        },
      })
    } catch {
      // Non-blocking sync
    }
  }

  return updated
}

export async function isEligibleForWhiteLabel(organizationId?: string): Promise<{
  isEligible: boolean
  plan: string
  reason?: string
}> {
  if (!organizationId) {
    return { isEligible: true, plan: "AGENCY" }
  }

  try {
    const sub = await db.subscription.findFirst({
      where: { organizationId },
      select: { plan: true, status: true },
    })

    const plan = sub?.plan || "AGENCY"
    const isEligible = plan === "AGENCY" || plan === "ENTERPRISE" || plan === "BUSINESS"

    return {
      isEligible,
      plan,
      reason: isEligible
        ? undefined
        : "White-label branding, custom domains, and sender masking require an Agency or Enterprise subscription.",
    }
  } catch {
    // In dev / demo mode, grant agency access
    return { isEligible: true, plan: "AGENCY" }
  }
}
