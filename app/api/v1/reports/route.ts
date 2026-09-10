import { NextRequest, NextResponse } from "next/server"
import { authenticateV1Request, createV1Response } from "@/lib/tenant/v1-helper"
import { compileProjectReport } from "@/lib/reports/report-generator"
import { getAgencyBranding } from "@/lib/agency/branding-service"

export async function GET(req: NextRequest) {
  const { auth, response } = await authenticateV1Request(req, "reports:read")
  if (!auth) return response!

  const reportId = req.nextUrl.searchParams.get("id")
  const domain = req.nextUrl.searchParams.get("domain") || "topseotool.net"
  const agency = await getAgencyBranding(auth.verification.organizationId)

  const report = compileProjectReport(
    `${agency.companyName} SEO Report`,
    agency.companyName,
    domain,
    86,
    92,
    {
      branding: {
        agencyName: agency.companyName,
        accentColor: agency.brandColors.primary,
        whiteLabel: agency.reportBranding.hidePlatformBadge,
      }
    }
  )

  if (reportId) {
    report.id = reportId
    report.shareToken = reportId
  }

  return createV1Response(req, auth, {
    report,
    links: {
      publicWebShare: `https://${agency.customDomain.domain || "reports.topseotool.net"}/share/${report.shareToken}`,
      pdfExport: `/reports/share/${report.shareToken}?format=pdf`,
    },
  })
}

export async function POST(req: NextRequest) {
  const { auth, response } = await authenticateV1Request(req, "reports:write")
  if (!auth) return response!

  let body: any = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const {
    clientName = "Acme Corp",
    domain = "topseotool.net",
    title,
    agencyName,
    accentColor,
    customNotes,
  } = body

  const agency = await getAgencyBranding(auth.verification.organizationId)
  const effectiveAgencyName = agencyName || agency.companyName || "ABC Digital"
  const effectiveTitle = title || `${effectiveAgencyName} SEO Report`

  const compiled = compileProjectReport(
    effectiveTitle,
    effectiveAgencyName,
    domain,
    88,
    94,
    {
      branding: {
        agencyName: effectiveAgencyName,
        clientName,
        clientWebsite: `https://${domain}`,
        accentColor: accentColor || agency.brandColors.primary,
        agencyNotes: customNotes,
        whiteLabel: true,
      },
    }
  )

  return createV1Response(req, auth, {
    message: "Report successfully generated via Developer API",
    reportId: compiled.id,
    shareToken: compiled.shareToken,
    title: compiled.title,
    clientName,
    domain,
    scores: compiled.scores,
    links: {
      publicViewUrl: `/reports/share/${compiled.shareToken}`,
      pdfDirectDownload: `/reports/share/${compiled.shareToken}?print=true`,
    },
  }, 201)
}
