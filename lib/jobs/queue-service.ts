// ============================================================
// TOPSEOTOOL — Background Job Queue System
// Enables asynchronous execution of long-running SEO jobs:
// 1. Site Crawls & Deep Audits
// 2. Scheduled Daily Rank Tracking
// 3. Multi-Model AI Search Prompts
// 4. White-Label Client PDF Compilation
// ============================================================

import { logger } from "@/lib/logger"

export type JobType =
  | "SEO_CRAWL"
  | "RANK_TRACKING_SYNC"
  | "AI_VISIBILITY_BATCH"
  | "PDF_REPORT_GENERATE"
  | "BACKLINK_AUDIT"

export type JobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"

export interface JobRecord<T = any> {
  id: string
  type: JobType
  status: JobStatus
  payload: T
  result?: any
  error?: string
  progress: number // 0-100
  attempts: number
  createdAt: Date
  updatedAt: Date
}

export type JobHandler<T = any, R = any> = (
  job: JobRecord<T>,
  updateProgress: (progress: number) => Promise<void>
) => Promise<R>

class BackgroundQueueManager {
  private jobs = new Map<string, JobRecord>()
  private handlers = new Map<JobType, JobHandler>()
  private isProcessing = false

  registerHandler<T, R>(type: JobType, handler: JobHandler<T, R>) {
    this.handlers.set(type, handler)
  }

  async enqueue<T>(type: JobType, payload: T): Promise<JobRecord<T>> {
    const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const job: JobRecord<T> = {
      id,
      type,
      status: "PENDING",
      payload,
      progress: 0,
      attempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.jobs.set(id, job)
    logger.info(`Job enqueued: ${type}`, "QUEUE", { jobId: id })

    // Trigger asynchronous worker queue tick
    setTimeout(() => this.processNext(), 50)
    return job
  }

  getJob(jobId: string): JobRecord | null {
    return this.jobs.get(jobId) ?? null
  }

  getAllJobs(): JobRecord[] {
    return Array.from(this.jobs.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )
  }

  getFailedJobs(): JobRecord[] {
    return this.getAllJobs().filter((j) => j.status === "FAILED")
  }

  retryJob(jobId: string): boolean {
    const job = this.jobs.get(jobId)
    if (!job) return false
    job.status = "PENDING"
    job.error = undefined
    job.progress = 0
    job.updatedAt = new Date()
    setTimeout(() => this.processNext(), 50)
    return true
  }

  retryAllFailed(): number {
    const failed = this.getFailedJobs()
    for (const j of failed) {
      j.status = "PENDING"
      j.error = undefined
      j.progress = 0
      j.updatedAt = new Date()
    }
    if (failed.length > 0) {
      setTimeout(() => this.processNext(), 50)
    }
    return failed.length
  }

  purgeCompletedAndFailed(): void {
    for (const [id, j] of this.jobs.entries()) {
      if (j.status === "COMPLETED" || j.status === "FAILED") {
        this.jobs.delete(id)
      }
    }
  }

  private async processNext() {
    if (this.isProcessing) return

    const pending = Array.from(this.jobs.values()).find((j) => j.status === "PENDING")
    if (!pending) return

    this.isProcessing = true
    pending.status = "PROCESSING"
    pending.attempts += 1
    pending.updatedAt = new Date()

    const handler = this.handlers.get(pending.type)

    if (!handler) {
      pending.status = "FAILED"
      pending.error = `No handler registered for job type ${pending.type}`
      pending.updatedAt = new Date()
      this.isProcessing = false
      return this.processNext()
    }

    try {
      logger.info(`Processing job: ${pending.type}`, "QUEUE", { jobId: pending.id })

      const result = await handler(pending, async (pct: number) => {
        pending.progress = Math.min(100, Math.max(0, pct))
        pending.updatedAt = new Date()
      })

      pending.status = "COMPLETED"
      pending.progress = 100
      pending.result = result
      pending.updatedAt = new Date()
      logger.info(`Job completed: ${pending.type}`, "QUEUE", { jobId: pending.id })
    } catch (err: any) {
      pending.status = "FAILED"
      pending.error = err?.message || String(err)
      pending.updatedAt = new Date()
      logger.error(`Job failed: ${pending.type}`, "QUEUE", { jobId: pending.id, error: pending.error })
    } finally {
      this.isProcessing = false
      // Continue draining queue
      setTimeout(() => this.processNext(), 100)
    }
  }
}

export const queueManager = new BackgroundQueueManager()
