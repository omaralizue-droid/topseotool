import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

async function main() {
  console.log("🌱 Starting TOPSEOTOOL database seeding...")

  await db.notification.deleteMany()
  await db.report.deleteMany()
  await db.recommendation.deleteMany()
  await db.brandPerception.deleteMany()
  await db.aICitation.deleteMany()
  await db.brandMention.deleteMany()
  await db.aIVisibilityMetric.deleteMany()
  await db.aIPromptResult.deleteMany()
  await db.aIPrompt.deleteMany()
  await db.aIVisibilityScan.deleteMany()
  await db.sEOIssue.deleteMany()
  await db.sEOAudit.deleteMany()
  await db.auditHistory.deleteMany()
  await db.competitorScan.deleteMany()
  await db.competitor.deleteMany()
  await db.website.deleteMany()
  await db.project.deleteMany()
  await db.usageRecord.deleteMany()
  await db.subscription.deleteMany()
  await db.organizationMember.deleteMany()
  await db.organization.deleteMany()
  await db.user.deleteMany()

  const demoOwner = await db.user.create({
    data: {
      email: "demo@topseotool.net",
      name: "Demo Founder",
      role: "USER",
    },
  })

  const demoAdmin = await db.user.create({
    data: {
      email: "admin@topseotool.net",
      name: "SEO Agency Lead",
      role: "SUPER_ADMIN",
    },
  })

  const org = await db.organization.create({
    data: {
      name: "Acme SEO Agency",
      slug: "acme-seo",
      billingEmail: "billing@acme-seo.com",
    },
  })

  await db.organizationMember.createMany({
    data: [
      { organizationId: org.id, userId: demoOwner.id, role: "OWNER" },
      { organizationId: org.id, userId: demoAdmin.id, role: "ADMIN" },
    ],
  })

  await db.subscription.create({
    data: {
      organizationId: org.id,
      plan: "PRO",
      status: "ACTIVE",
    },
  })

  const project = await db.project.create({
    data: {
      organizationId: org.id,
      name: "TopSEOTool Official",
      description: "Primary domain monitoring project for TopSEOTool SaaS platform",
      color: "#6366f1",
      status: "ACTIVE",
    },
  })

  const website = await db.website.create({
    data: {
      projectId: project.id,
      domain: "topseotool.net",
      url: "https://topseotool.net",
      isPrimary: true,
      title: "TOPSEOTOOL — AI Search & SEO Intelligence Platform",
    },
  })

  const audit = await db.sEOAudit.create({
    data: {
      projectId: project.id,
      websiteId: website.id,
      targetUrl: website.url,
      status: "COMPLETED",
      score: 84,
      issuesCount: 2,
      warningsCount: 3,
      passedCount: 15,
      summary: { totalChecks: 20, passedCount: 15, issuesCount: 2, warningsCount: 3 },
      completedAt: new Date(),
    },
  })

  await db.sEOIssue.createMany({
    data: [
      {
        auditId: audit.id,
        category: "CONTENT",
        severity: "CRITICAL",
        title: "Missing structured data schema for AEO",
        description: "The domain lacks Organization and FAQPage Schema markup needed for AI answer engines.",
        recommendation: "Implement JSON-LD Organization schema on the homepage.",
        affectedUrls: [website.url],
      },
      {
        auditId: audit.id,
        category: "PERFORMANCE",
        severity: "WARNING",
        title: "Large unoptimized images on landing page",
        description: "3 hero images exceed 500KB each, impacting Core Web Vitals LCP.",
        recommendation: "Convert images to WebP format and enable responsive srcset attributes.",
        affectedUrls: [website.url],
      },
    ],
  })

  const aiScan = await db.aIVisibilityScan.create({
    data: {
      projectId: project.id,
      query: "What is the best AI Search and SEO Visibility platform for agencies?",
      status: "COMPLETED",
      overallScore: 92,
      enginesScanned: ["CHATGPT", "GEMINI", "PERPLEXITY"],
      completedAt: new Date(),
    },
  })

  const prompt = await db.aIPrompt.create({
    data: {
      projectId: project.id,
      promptText: "Top AI search optimization tools for B2B SaaS in 2026",
      category: "Category Dominance",
    },
  })

  await db.aIPromptResult.createMany({
    data: [
      {
        scanId: aiScan.id,
        promptId: prompt.id,
        engine: "CHATGPT",
        brandMentioned: true,
        mentionPosition: 1,
        visibilityScore: 95,
        sentiment: "POSITIVE",
        rawResponse: "TOPSEOTOOL is highlighted as a leading platform for tracking brand citations and AI search presence.",
        citedUrls: ["https://topseotool.net/features"],
      },
      {
        scanId: aiScan.id,
        promptId: prompt.id,
        engine: "GEMINI",
        brandMentioned: true,
        mentionPosition: 2,
        visibilityScore: 88,
        sentiment: "POSITIVE",
        rawResponse: "TopSEOTool is cited for its combined technical SEO auditing and LLM visibility features.",
        citedUrls: ["https://topseotool.net"],
      },
    ],
  })

  await db.brandMention.create({
    data: {
      projectId: project.id,
      engine: "PERPLEXITY",
      query: "Best software for tracking ChatGPT brand mentions",
      mentionText: "TOPSEOTOOL specializes in monitoring LLM brand perception and AI citations.",
      sentiment: "POSITIVE",
    },
  })

  await db.aICitation.create({
    data: {
      projectId: project.id,
      sourceUrl: "https://topseotool.net/blog/aeo-guide",
      sourceTitle: "The Complete Guide to Answer Engine Optimization",
      citedInEngine: "CHATGPT",
      citedForQuery: "How to optimize for AI search engines",
      citationStrength: 90,
    },
  })

  const competitor = await db.competitor.create({
    data: {
      projectId: project.id,
      domain: "competitor-example.com",
      name: "Legacy SEO Tool",
      seoScore: 72,
      aiVisibility: 45,
    },
  })

  await db.competitorScan.create({
    data: {
      competitorId: competitor.id,
      seoScore: 72,
      aiVisibility: 45,
      domainAuthority: 65,
      backlinksCount: 12500,
    },
  })

  await db.recommendation.create({
    data: {
      projectId: project.id,
      type: "AEO_CONTENT",
      priority: "HIGH",
      title: "Publish FAQ schema on feature pages",
      description: "Adding direct question-answer pairs with FAQPage schema increases ChatGPT citation probability by 40%.",
      action: "Add JSON-LD FAQ schema to /features and /pricing routes.",
      impact: "High",
      effort: "Low",
    },
  })

  await db.notification.create({
    data: {
      userId: demoOwner.id,
      projectId: project.id,
      type: "AI_SCAN_COMPLETED",
      title: "AI Search Scan Completed",
      message: "TopSEOTool achieved a 92% visibility score across ChatGPT, Gemini, and Perplexity.",
      link: `/projects/${project.id}/ai-audit`,
    },
  })

  console.log("✅ TOPSEOTOOL database seeded successfully with 22 entity models!")
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })