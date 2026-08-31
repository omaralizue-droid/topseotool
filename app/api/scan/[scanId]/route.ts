import { NextRequest, NextResponse } from "next/server"

// Dynamic import to access the shared store from the parent route module
// We re-export the store from a shared module in production; for now, import directly
// NOTE: In Next.js App Router, each route is its own module — we use a shared singleton

// Shared in-memory store singleton (works within same server process)
declare global {
  // eslint-disable-next-line no-var
  var __publicScanStore: Map<
    string,
    { status: "running" | "completed" | "failed"; result?: any; error?: string; startedAt: number }
  >
}

if (!global.__publicScanStore) {
  global.__publicScanStore = new Map()
}

const publicScanStore = global.__publicScanStore

// Also wire up the route.ts store to this global
// This is imported by the POST route to ensure same reference
export { publicScanStore }

interface RouteParams {
  params: Promise<{ scanId: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { scanId } = await params

  const scan = publicScanStore.get(scanId)

  if (!scan) {
    return NextResponse.json({ error: "Scan not found or expired" }, { status: 404 })
  }

  if (scan.status === "running") {
    return NextResponse.json({ ok: true, data: { status: "running", progress: "Scanning AI engines..." } })
  }

  if (scan.status === "failed") {
    return NextResponse.json({ ok: false, data: { status: "failed", error: scan.error } })
  }

  return NextResponse.json({ ok: true, data: { status: "completed", result: scan.result } })
}
