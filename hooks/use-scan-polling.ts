"use client"
import { useState, useEffect, useRef, useCallback } from "react"

export type ScanStatus = "idle" | "running" | "completed" | "failed"

export interface PublicScanResult {
  websiteUrl: string
  brandName: string
  pageContext?: { title?: string; description?: string; keywords?: string }
  metrics: {
    totalQueries: number
    mentionsCount: number
    mentionRate: number
    recommendationRate: number
    citationRate: number
    competitorRate: number
    sentimentScore: number
    overallVisibilityScore: number
    perEngineStats: Array<{
      engine: string
      mentionRate: number
      mentions: number
      total: number
      sentiment: string
    }>
  }
  results: Array<{
    query: string
    category: string
    engine: string
    response: string
    brandMentioned: boolean
    domainMentioned: boolean
    competitorMentioned: boolean
    citedUrls: string[]
    mentionPosition: number | null
    sentiment: string
    confidence: number
  }>
  engines: string[]
  queries: string[]
  scannedAt: string
}

interface UseScanPollingReturn {
  status: ScanStatus
  scanId: string | null
  result: PublicScanResult | null
  error: string | null
  elapsedSeconds: number
  startScan: (url: string) => Promise<void>
  reset: () => void
}

const POLL_INTERVAL_MS = 2000

export function useScanPolling(): UseScanPollingReturn {
  const [status, setStatus] = useState<ScanStatus>("idle")
  const [scanId, setScanId] = useState<string | null>(null)
  const [result, setResult] = useState<PublicScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const currentScanId = useRef<string | null>(null)

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startPolling = useCallback(
    (id: string) => {
      currentScanId.current = id
      setElapsedSeconds(0)

      // Elapsed time counter
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1)
      }, 1000)

      // Poll every 2 seconds
      pollingRef.current = setInterval(async () => {
        if (currentScanId.current !== id) {
          stopPolling()
          return
        }
        try {
          const res = await fetch(`/api/scan/${id}`)
          const data = await res.json()

          if (data.data?.status === "completed") {
            stopPolling()
            setResult(data.data.result)
            setStatus("completed")
          } else if (data.data?.status === "failed") {
            stopPolling()
            setError(data.data.error ?? "Scan failed")
            setStatus("failed")
          }
          // status === "running" → keep polling
        } catch (err) {
          console.error("Polling error:", err)
          // Don't stop polling on transient errors
        }
      }, POLL_INTERVAL_MS)
    },
    [stopPolling]
  )

  const startScan = useCallback(
    async (url: string) => {
      stopPolling()
      setStatus("running")
      setResult(null)
      setError(null)
      setScanId(null)
      setElapsedSeconds(0)

      try {
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        })
        const data = await res.json()

        if (!res.ok) {
          setError(data.error ?? "Failed to start scan")
          setStatus("failed")
          return
        }

        const id = data.data.scanId
        setScanId(id)
        startPolling(id)
      } catch (err: any) {
        setError(err.message ?? "Network error")
        setStatus("failed")
      }
    },
    [stopPolling, startPolling]
  )

  const reset = useCallback(() => {
    stopPolling()
    currentScanId.current = null
    setStatus("idle")
    setScanId(null)
    setResult(null)
    setError(null)
    setElapsedSeconds(0)
  }, [stopPolling])

  // Cleanup on unmount
  useEffect(() => {
    return () => stopPolling()
  }, [stopPolling])

  return { status, scanId, result, error, elapsedSeconds, startScan, reset }
}
