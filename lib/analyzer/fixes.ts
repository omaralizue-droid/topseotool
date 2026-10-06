// Deterministic, copy-paste-ready fix files generated for the analyzed site.
import type { AiBot } from "./types"

export function buildLlmsTxt(input: {
  brand: string
  url: string
  summary: string
  category: string
  audience: string
  facts: string[]
}): string {
  const lines = [
    `# ${input.brand}`,
    "",
    `> ${input.summary}`,
    "",
    `${input.brand} is a ${input.category}${input.audience ? ` built for ${input.audience}` : ""}.`,
    "",
    "## Key facts",
    ...input.facts.map((f) => `- ${f}`),
    "",
    "## Key pages",
    `- [${input.brand} homepage](${input.url}): ${input.summary}`,
  ]
  return lines.join("\n")
}

export function buildSchema(input: { brand: string; url: string; description: string; category: string }): string {
  const origin = new URL(input.url).origin
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${origin}/#organization`,
        name: input.brand,
        url: origin,
        description: input.description,
        knowsAbout: input.category,
      },
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        name: input.brand,
        url: origin,
        publisher: { "@id": `${origin}/#organization` },
      },
    ],
  }
  return `<script type="application/ld+json">\n${JSON.stringify(graph, null, 2)}\n</script>`
}

export function buildRobotsTxt(bots: AiBot[], origin: string): string {
  const blocked = bots.filter((b) => b.status !== "allowed")
  const header = blocked.length
    ? `# Your robots.txt currently restricts: ${blocked.map((b) => b.name).join(", ")}\n# Add these rules so AI answer engines can read and cite your site.\n`
    : `# Your robots.txt already allows AI crawlers. Keep these rules explicit:\n`
  const rules = ["OAI-SearchBot", "ChatGPT-User", "GPTBot", "PerplexityBot", "ClaudeBot", "Claude-SearchBot", "Google-Extended", "Bingbot", "Applebot-Extended"]
    .map((ua) => `User-agent: ${ua}\nAllow: /`)
    .join("\n\n")
  return `${header}\n${rules}\n\nSitemap: ${origin}/sitemap.xml`
}

export function buildMetaTags(title: string, description: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
  ].join("\n")
}
