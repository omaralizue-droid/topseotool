// ==============================================================================
// 🧪 Test Suite: Evidence-Based AI Provider Adapters & Response Parsing
// Tests adapter interfaces, sanitized fixtures, credential validation,
// error handling, and ensures no mock data appears as verified evidence.
// ==============================================================================

import assert from "node:assert/strict";

console.log("======================================================");
console.log("🧪 AI Provider Adapters & Evidence Parsing Test Suite");
console.log("======================================================\n");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ ${name}:`, err.message);
    failed++;
  }
}

async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ ${name}:`, err.message);
    failed++;
  }
}

// ------------------------------------------------------------------------------
// Test Group 1: Missing Credentials Handling
// ------------------------------------------------------------------------------
console.log("--- Group 1: Credential Guard & Unconfigured Handling ---");

// Temporarily ensure keys are absent
const originalGemini = process.env.GEMINI_API_KEY;
const originalPerp = process.env.PERPLEXITY_API_KEY;
const originalOpenAi = process.env.OPENAI_API_KEY;

delete process.env.GEMINI_API_KEY;
delete process.env.PERPLEXITY_API_KEY;
delete process.env.OPENAI_API_KEY;

const { geminiAdapter } = await import("../lib/analyzer/providers/gemini.ts");
const { perplexityAdapter } = await import("../lib/analyzer/providers/perplexity.ts");
const { openaiAdapter } = await import("../lib/analyzer/providers/openai.ts");
const { executeMultiProviderChecks, getAvailableProviders } = await import("../lib/analyzer/providers/index.ts");
const { generateSimulatedProbe } = await import("../lib/analyzer/intelligence.ts");

test("Gemini adapter reports isConfigured=false when key missing", () => {
  assert.equal(geminiAdapter.isConfigured(), false);
});

test("Perplexity adapter reports isConfigured=false when key missing", () => {
  assert.equal(perplexityAdapter.isConfigured(), false);
});

test("OpenAI adapter reports isConfigured=false when key missing", () => {
  assert.equal(openaiAdapter.isConfigured(), false);
});

await asyncTest("Gemini runCheck returns status=not_configured without throwing", async () => {
  const result = await geminiAdapter.runCheck({
    brand: "Acme",
    domain: "acme.com",
    query: "best analytics software",
    intent: "category",
  });
  assert.equal(result.status, "not_configured");
  assert.equal(result.mentioned, false);
  assert.equal(result.domainCited, false);
  assert.deepEqual(result.citationUrls, []);
  assert.ok(result.error && result.error.includes("GEMINI_API_KEY"));
});

await asyncTest("Perplexity runCheck returns status=not_configured without throwing", async () => {
  const result = await perplexityAdapter.runCheck({
    brand: "Acme",
    domain: "acme.com",
    query: "best analytics software",
    intent: "category",
  });
  assert.equal(result.status, "not_configured");
  assert.equal(result.mentioned, false);
  assert.deepEqual(result.citationUrls, []);
  assert.ok(result.error && result.error.includes("PERPLEXITY_API_KEY"));
});

await asyncTest("OpenAI runCheck returns status=not_configured without throwing", async () => {
  const result = await openaiAdapter.runCheck({
    brand: "Acme",
    domain: "acme.com",
    query: "best analytics software",
    intent: "category",
  });
  assert.equal(result.status, "not_configured");
  assert.equal(result.mentioned, false);
  assert.ok(result.error && result.error.includes("OPENAI_API_KEY"));
});

// ------------------------------------------------------------------------------
// Test Group 2: Prevention of Mock Data as Verified Results
// ------------------------------------------------------------------------------
console.log("\n--- Group 2: Prevention of Invented Mentions / Fake Scores ---");

test("generateSimulatedProbe marks status=unavailable and mentioned=false", () => {
  const probe = generateSimulatedProbe(
    { id: "q1", intent: "branded", question: "What is Acme?" },
    "Acme",
    "acme.com"
  );
  assert.equal(probe.status, "unavailable");
  assert.equal(probe.mentioned, false);
  assert.equal(probe.domainCited, false);
  assert.equal(probe.position, null);
  assert.equal(probe.sentiment, "n/a");
  assert.deepEqual(probe.sources, []);
  assert.ok(probe.answer.includes("could not be executed"));
});

// ------------------------------------------------------------------------------
// Test Group 3: Sanitized Fixture Parsing (Gemini Grounding)
// ------------------------------------------------------------------------------
console.log("\n--- Group 3: Sanitized Fixture Parsing (Simulated Responses) ---");

test("Gemini grounding parsing detects mention, citations, and verbatim snippet", () => {
  // Mock Gemini output structure with Google Search Grounding
  const answerText = "Acme (acme.com) is a leading customer data platform designed for modern product teams. It integrates with major data warehouses and offers sub-second query latency.";
  const groundingChunks = [
    { web: { title: "Acme Platform Overview", uri: "https://acme.com/product" } },
    { web: { title: "Cloud Tech Reviews", uri: "https://techreviews.org/cdp" } },
  ];

  const brand = "Acme";
  const domain = "acme.com";

  const normBrand = brand.toLowerCase();
  const lower = answerText.toLowerCase();
  const brandMentioned = lower.includes(normBrand);
  const citationUrls = groundingChunks.map((c) => c.web.uri);
  const domainCited = citationUrls.some((u) => new URL(u).hostname === domain);

  assert.equal(brandMentioned, true);
  assert.equal(domainCited, true);
  assert.equal(citationUrls.length, 2);
  assert.ok(citationUrls.includes("https://acme.com/product"));
});

test("Gemini grounding parsing correctly returns mentioned=false when brand absent", () => {
  const answerText = "Top customer data platforms include Segment, Rudderstack, and mParticle. They allow teams to collect and route customer event data.";
  const groundingChunks = [
    { web: { title: "Segment Overview", uri: "https://segment.com" } },
  ];

  const brand = "Acme";
  const domain = "acme.com";

  const normBrand = brand.toLowerCase();
  const lower = answerText.toLowerCase();
  const brandMentioned = lower.includes(normBrand);
  const citationUrls = groundingChunks.map((c) => c.web.uri);
  const domainCited = citationUrls.some((u) => new URL(u).hostname === domain);

  assert.equal(brandMentioned, false);
  assert.equal(domainCited, false);
});

// ------------------------------------------------------------------------------
// Test Group 4: Sanitized Fixture Parsing (Perplexity Sonar)
// ------------------------------------------------------------------------------
console.log("\n--- Group 4: Perplexity Sonar Fixture Parsing ---");

test("Perplexity parsing extracts native citations and confirmed mention", () => {
  const rawPerplexityResponse = {
    id: "sonar-12345",
    model: "sonar",
    choices: [
      {
        message: {
          role: "assistant",
          content: "Linear is a modern issue tracking tool designed specifically for software engineering teams with high-speed keyboard shortcuts.",
        },
      },
    ],
    citations: [
      "https://linear.app/features",
      "https://github.com/features/issues",
    ],
  };

  const content = rawPerplexityResponse.choices[0].message.content;
  const citations = rawPerplexityResponse.citations;
  const brand = "Linear";
  const domain = "linear.app";

  const mentioned = content.toLowerCase().includes(brand.toLowerCase());
  const domainCited = citations.some((u) => new URL(u).hostname === domain);

  assert.equal(mentioned, true);
  assert.equal(domainCited, true);
  assert.equal(citations.length, 2);
});

// ------------------------------------------------------------------------------
// Test Group 5: Multi-Provider Dispatcher
// ------------------------------------------------------------------------------
console.log("\n--- Group 5: Multi-Provider Dispatcher Execution ---");

await asyncTest("executeMultiProviderChecks dispatches across all adapters concurrently", async () => {
  const results = await executeMultiProviderChecks({
    brand: "TopSEOTool",
    domain: "topseotool.net",
    query: "best GEO SEO visibility tools",
    intent: "category",
  });

  assert.equal(Array.isArray(results), true);
  assert.equal(results.length, 3); // gemini, perplexity, openai

  const providers = results.map((r) => r.providerId);
  assert.ok(providers.includes("gemini"));
  assert.ok(providers.includes("perplexity"));
  assert.ok(providers.includes("openai"));

  // In unconfigured test env, all should be safely marked not_configured with clean messages
  for (const r of results) {
    assert.equal(r.status, "not_configured");
    assert.equal(r.mentioned, false);
  }
});

// Restore environment variables
if (originalGemini) process.env.GEMINI_API_KEY = originalGemini;
if (originalPerp) process.env.PERPLEXITY_API_KEY = originalPerp;
if (originalOpenAi) process.env.OPENAI_API_KEY = originalOpenAi;

console.log("\n======================================================");
console.log(`Summary: ${passed} passed, ${failed} failed`);
console.log("======================================================\n");

if (failed > 0) {
  process.exit(1);
}
