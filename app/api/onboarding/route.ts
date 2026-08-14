import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { handleApiError } from "@/lib/errors"
import { slugify } from "@/lib/utils"
import { z } from "zod"

const onboardingSchema = z.object({
  companyName: z.string().min(2),
  websiteUrl: z.string().min(3),
  industry: z.string().min(2),
  country: z.string().min(2),
  competitors: z.array(z.string()).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const userEmail = session.user.email ?? undefined

    const body = await req.json()
    const { companyName, websiteUrl, industry, country, competitors } = onboardingSchema.parse(body)

    const domain = websiteUrl.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").trim()

    const result = await db.$transaction(async (tx) => {
      let membership = await tx.organizationMember.findFirst({
        where: { userId },
        include: { organization: true },
      })

      let org = membership?.organization

      if (!org) {
        const slug = `${slugify(companyName)}-${Math.random().toString(36).substring(2, 7)}`
        org = await tx.organization.create({
          data: {
            name: companyName,
            slug,
            billingEmail: userEmail,
          },
        })

        await tx.organizationMember.create({
          data: {
            organizationId: org.id,
            userId,
            role: "OWNER",
          },
        })

        await tx.subscription.create({
          data: {
            organizationId: org.id,
            plan: "STARTER",
            status: "ACTIVE",
          },
        })
      } else {
        await tx.organization.update({
          where: { id: org.id },
          data: { name: companyName },
        })
      }

      const project = await tx.project.create({
        data: {
          organizationId: org.id,
          name: companyName,
          description: `${industry} project based in ${country}`,
          color: "#6366f1",
        },
      })

      await tx.website.create({
        data: {
          projectId: project.id,
          domain,
          url: websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`,
          isPrimary: true,
          title: companyName,
        },
      })

      if (competitors && competitors.length > 0) {
        for (const compDomain of competitors) {
          const compClean = compDomain.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").trim()
          if (compClean) {
            await tx.competitor.create({
              data: {
                projectId: project.id,
                domain: compClean,
                name: compClean.split(".")[0]?.toUpperCase() ?? compClean,
              },
            })
          }
        }
      }

      return { orgId: org.id, projectId: project.id }
    })

    return NextResponse.json({ ok: true, data: result })
  } catch (err) {
    return handleApiError(err, "ONBOARDING")
  }
}