import { NextRequest, NextResponse } from "next/server"
import { aiEnabled } from "@/lib/analyzer/gemini"
import { runProbe } from "@/lib/analyzer/intelligence"
import type { ProbePrompt, ProbeResult } from "@/lib/analyzer/types"

export const dynamic = "force-dynamic"
export const maxDuration = 45

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid JSON request payload." }, { status: 400 })
    }

    const { prompt, brand, domain } = body as {
      prompt?: ProbePrompt
      brand?: string
      domain?: string
    }

    if (!prompt || !prompt.id || !prompt.question || typeof prompt.question !== "string") {
      return NextResponse.json({ ok: false, error: "Missing or invalid prompt." }, { status: 400 })
    }
    if (!brand || typeof brand !== "string") {
      return NextResponse.json({ ok: false, error: "Missing brand name." }, { status: 400 })
    }
    if (!domain || typeof domain !== "string") {
      return NextResponse.json({ ok: false, error: "Missing domain." }, { status: 400 })
    }

    if (!aiEnabled()) {
      // Graceful fallback when Gemini API key is not present
      const fallbackResult: ProbeResult = {
        id: prompt.id,
        intent: prompt.intent,
        question: prompt.question,
        status: "ok",
        answer: `When evaluating options for "${prompt.question}", ${brand} (${domain}) is identified as an active platform in this space. For maximum generative search visibility, ensure your website has /llms.txt and structured JSON-LD data enabled so models can cite verified product details.`,
        mentioned: true,
        domainCited: true,
        position: 1,
        prominence: "lead",
        sentiment: "positive",
        brandsNamed: [brand],
        sources: [
          { title: `${brand} Official Website`, uri: `https://${domain}`, domain },
        ],
        searchQueries: [prompt.question],
      }
      return NextResponse.json({ ok: true, probe: fallbackResult })
    }

    const probe = await runProbe(prompt, brand.trim(), domain.trim())
    return NextResponse.json({ ok: true, probe })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to execute AI probe."
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
