"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  RotateCcw,
  Activity,
  Layers,
} from "lucide-react"
import { toast } from "sonner"

export interface JobItem {
  id: string
  type: string
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED"
  progress: number
  error?: string
  result?: any
  attempts: number
  maxAttempts: number
  createdAt: string
  startedAt?: string
  completedAt?: string
}

interface JobStatusDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JobStatusDrawer({ open, onOpenChange }: JobStatusDrawerProps) {
  const [jobs, setJobs] = useState<JobItem[]>([])
  const [filter, setFilter] = useState<"ALL" | "PROCESSING" | "QUEUED" | "COMPLETED" | "FAILED">("ALL")
  const [loading, setLoading] = useState(false)
  const [retryingId, setRetryingId] = useState<string | null>(null)

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/jobs")
      if (res.ok) {
        const json = await res.json()
        setJobs(json.data || [])
      }
    } catch {
      // Non-blocking
    }
  }, [])

  useEffect(() => {
    if (open) {
      setLoading(true)
      fetchJobs().finally(() => setLoading(false))

      // Poll every 2.5 seconds while open to stream live progress
      const interval = setInterval(fetchJobs, 2500)
      return () => clearInterval(interval)
    }
  }, [open, fetchJobs])

  const handleRetry = async (jobId: string) => {
    setRetryingId(jobId)
    try {
      const res = await fetch(`/api/jobs/${jobId}/retry`, { method: "POST" })
      if (res.ok) {
        toast.success(`Job ${jobId} re-queued for processing`)
        fetchJobs()
      } else {
        toast.error("Failed to retry job")
      }
    } catch {
      toast.error("Network error while retrying job")
    } finally {
      setRetryingId(null)
    }
  }

  const handleTriggerManual = async (type: string, payload: any) => {
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, payload }),
      })
      if (res.ok) {
        toast.success(`Dispatched background job: ${type}`)
        fetchJobs()
      }
    } catch {
      toast.error("Failed to enqueue job")
    }
  }

  const filteredJobs = jobs.filter((j) => {
    if (filter === "ALL") return true
    return j.status === filter
  })

  const counts = {
    all: jobs.length,
    processing: jobs.filter((j) => j.status === "PROCESSING").length,
    queued: jobs.filter((j) => j.status === "QUEUED").length,
    completed: jobs.filter((j) => j.status === "COMPLETED").length,
    failed: jobs.filter((j) => j.status === "FAILED").length,
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto flex flex-col p-6">
        <SheetHeader className="pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-brand" />
              <SheetTitle className="text-lg font-bold">Background Job Queue</SheetTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchJobs}
              disabled={loading}
              className="h-8 px-2 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          <SheetDescription className="text-xs text-muted-foreground">
            Asynchronous execution pool for site crawls, SERP rank tracking, AI queries &amp; PDF reports.
          </SheetDescription>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 pt-3 overflow-x-auto pb-1">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${
                filter === "ALL" ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setFilter("PROCESSING")}
              className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors flex items-center gap-1 ${
                filter === "PROCESSING" ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {counts.processing > 0 && <Loader2 className="h-3 w-3 animate-spin" />}
              Processing ({counts.processing})
            </button>
            <button
              onClick={() => setFilter("QUEUED")}
              className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${
                filter === "QUEUED" ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Queued ({counts.queued})
            </button>
            <button
              onClick={() => setFilter("COMPLETED")}
              className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${
                filter === "COMPLETED" ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Completed ({counts.completed})
            </button>
            <button
              onClick={() => setFilter("FAILED")}
              className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${
                filter === "FAILED" ? "bg-rose-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Failed ({counts.failed})
            </button>
          </div>
        </SheetHeader>

        {/* Quick Trigger Buttons */}
        <div className="py-3 px-3 my-3 bg-muted/40 rounded-lg border border-border flex items-center justify-between gap-2 text-xs">
          <span className="text-muted-foreground font-medium flex items-center gap-1.5">
            <Play className="h-3.5 w-3.5 text-brand" /> Quick Actions:
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-[11px] px-2"
              onClick={() =>
                handleTriggerManual("RANK_TRACKING", {
                  projectId: "demo-project",
                  keywords: ["seo audit tool", "ai search optimization", "rank tracking software"],
                })
              }
            >
              Sync Rankings
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-[11px] px-2"
              onClick={() =>
                handleTriggerManual("SCHEDULED_AUDIT", {
                  projectId: "demo-project",
                  frequency: "WEEKLY",
                })
              }
            >
              Run Audit
            </Button>
          </div>
        </div>

        {/* Job List */}
        <div className="flex-1 space-y-3 pt-2">
          {filteredJobs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground space-y-2">
              <Layers className="h-8 w-8 mx-auto opacity-30" />
              <p className="text-sm font-medium">No {filter !== "ALL" ? filter.toLowerCase() : ""} jobs in queue</p>
              <p className="text-xs">Jobs will appear here automatically when audits or scans are executed.</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="p-3.5 rounded-lg border border-border bg-card/60 hover:bg-card transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-foreground">
                        {job.type}
                      </span>
                      {job.status === "QUEUED" && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-blue-500/30 text-blue-500 bg-blue-500/10">
                          <Clock className="h-2.5 w-2.5 mr-1" /> Queued
                        </Badge>
                      )}
                      {job.status === "PROCESSING" && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-amber-500/30 text-amber-500 bg-amber-500/10">
                          <Loader2 className="h-2.5 w-2.5 mr-1 animate-spin" /> Processing ({job.progress}%)
                        </Badge>
                      )}
                      {job.status === "COMPLETED" && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-emerald-500/30 text-emerald-500 bg-emerald-500/10">
                          <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> Completed
                        </Badge>
                      )}
                      {job.status === "FAILED" && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-rose-500/30 text-rose-500 bg-rose-500/10">
                          <AlertCircle className="h-2.5 w-2.5 mr-1" /> Failed (Try {job.attempts}/{job.maxAttempts})
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      ID: {job.id} • Created {new Date(job.createdAt).toLocaleTimeString()}
                    </p>
                  </div>

                  {job.status === "FAILED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs px-2.5 border-rose-500/30 hover:bg-rose-500/10 text-rose-600 font-semibold"
                      disabled={retryingId === job.id}
                      onClick={() => handleRetry(job.id)}
                    >
                      <RotateCcw className={`h-3 w-3 mr-1 ${retryingId === job.id ? "animate-spin" : ""}`} />
                      Retry
                    </Button>
                  )}
                </div>

                {/* Progress bar for active jobs */}
                {job.status === "PROCESSING" && (
                  <div className="space-y-1">
                    <Progress value={job.progress} className="h-1.5" />
                  </div>
                )}

                {/* Failure error message */}
                {job.status === "FAILED" && job.error && (
                  <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-600 dark:text-rose-400 font-mono">
                    {job.error}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
