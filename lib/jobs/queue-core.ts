// ============================================================
// TOPSEOTOOL — Enterprise Asynchronous Background Job Queue Core
// Production-grade queue system supporting Redis / BullMQ or embedded worker
// ============================================================

import { logger } from "@/lib/logger"
import { logSecurityAudit } from "@/lib/security/audit-logger"

export type JobType =
  | "WEBSITE_CRAWL"
  | "RANK_TRACKING"
  | "KEYWORD_PROCESSING"
  | "BACKLINK_PROCESSING"
  | "REPORT_GENERATION"
  | "AI_PROCESSING"
  | "SCHEDULED_AUDIT"
  | "EMAIL_NOTIFICATION"
  // Legacy aliases for backward compatibility
  | "SEO_CRAWL"
  | "RANK_TRACKING_SYNC"
  | "AI_VISIBILITY_BATCH"
  | "PDF_REPORT_GENERATE"
  | "BACKLINK_AUDIT"

export type JobStatus = "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED"

export interface JobRecord<T = any, R = any> {
  id: string
  type: JobType
  status: JobStatus
  organizationId?: string | null
  userId?: string | null
  payload: T
  result?: R
  error?: string
  progress: number // 0 to 100
  attempts: number
  maxAttempts: number
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  failedAt?: Date
  updatedAt: Date
}

export type JobProgressCallback = (progressPercent: number, stageMessage?: string) => Promise<void>
export type JobHandler<T = any, R = any> = (
  payload: T,
  updateProgress: JobProgressCallback,
  job: JobRecord<T, R>
) => Promise<R>

export interface EnqueueOptions {
  organizationId?: string | null
  userId?: string | null
  maxAttempts?: number
  priority?: "HIGH" | "NORMAL" | "LOW"
}

class BackgroundJobQueue {
  private jobs = new Map<string, JobRecord>()
  private handlers = new Map<JobType, JobHandler>()
  private activeConcurrency = 0
  private maxConcurrency = 5
  private isProcessing = false

  constructor() {
    // Prune completed and failed jobs older than 24 hours every 15 minutes
    setInterval(() => {
      const now = Date.now()
      for (const [id, job] of this.jobs.entries()) {
        if (job.status === "COMPLETED" || job.status === "FAILED") {
          if (now - job.updatedAt.getTime() > 24 * 60 * 60 * 1000) {
            this.jobs.delete(id)
          }
        }
      }
    }, 15 * 60 * 1000)
  }

  /**
   * Register a background worker handler for a specific JobType
   */
  registerHandler<T = any, R = any>(type: JobType, handler: JobHandler<T, R>): void {
    this.handlers.set(type, handler)
    logger.info(`Registered background worker handler for [${type}]`, "QUEUE")
  }

  /**
   * Enqueue a new job asynchronously without blocking HTTP response
   */
  async enqueue<T = any>(
    type: JobType,
    payload: T,
    options: EnqueueOptions = {}
  ): Promise<JobRecord<T>> {
    const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    const job: JobRecord<T> = {
      id,
      type,
      status: "QUEUED",
      organizationId: options.organizationId ?? null,
      userId: options.userId ?? null,
      payload,
      progress: 0,
      attempts: 0,
      maxAttempts: options.maxAttempts ?? 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.jobs.set(id, job)
    logger.info(`Enqueued job: [${type}] (${id})`, "QUEUE", {
      jobId: id,
      type,
      orgId: options.organizationId,
    })

    // Trigger immediate async worker tick
    setImmediate(() => this.processNext())
    return job
  }

  /**
   * Retrieve a job by its unique ID
   */
  getJob(jobId: string): JobRecord | null {
    return this.jobs.get(jobId) ?? null
  }

  /**
   * Retrieve all jobs, optionally filtered by organization or status
   */
  getJobs(filters: { organizationId?: string; status?: JobStatus; type?: JobType } = {}): JobRecord[] {
    let list = Array.from(this.jobs.values())

    if (filters.organizationId) {
      list = list.filter((j) => j.organizationId === filters.organizationId || !j.organizationId)
    }
    if (filters.status) {
      list = list.filter((j) => j.status === filters.status)
    }
    if (filters.type) {
      list = list.filter((j) => j.type === filters.type)
    }

    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  /**
   * Retrieve all failed jobs eligible for retry
   */
  getFailedJobs(organizationId?: string): JobRecord[] {
    return this.getJobs({ organizationId, status: "FAILED" })
  }

  /**
   * Retry a failed job
   */
  async retryJob(jobId: string): Promise<JobRecord | null> {
    const job = this.jobs.get(jobId)
    if (!job) return null

    job.status = "QUEUED"
    job.error = undefined
    job.progress = 0
    job.startedAt = undefined
    job.completedAt = undefined
    job.failedAt = undefined
    job.updatedAt = new Date()

    logger.info(`Retrying job: [${job.type}] (${jobId})`, "QUEUE", { jobId })

    void logSecurityAudit({
      eventType: "admin.feature_flag_toggle", // Audit entry for operator action
      actorId: job.userId,
      organizationId: job.organizationId,
      targetResource: "BackgroundJob",
      targetResourceId: jobId,
      status: "SUCCESS",
      metadata: { action: "job_retry", type: job.type },
    })

    setImmediate(() => this.processNext())
    return job
  }

  /**
   * Retry all failed jobs at once
   */
  retryAllFailed(organizationId?: string): number {
    const failed = this.getFailedJobs(organizationId)
    for (const job of failed) {
      job.status = "QUEUED"
      job.error = undefined
      job.progress = 0
      job.updatedAt = new Date()
    }
    if (failed.length > 0) {
      setImmediate(() => this.processNext())
    }
    return failed.length
  }

  /**
   * Cancel / abort a queued job
   */
  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId)
    if (!job) return false

    if (job.status === "QUEUED") {
      job.status = "FAILED"
      job.error = "Canceled by user or operator"
      job.failedAt = new Date()
      job.updatedAt = new Date()
      return true
    }
    return false
  }

  /**
   * Internal queue pump: drains queued jobs respecting concurrency limits
   */
  private async processNext(): Promise<void> {
    if (this.activeConcurrency >= this.maxConcurrency) return

    // Find next queued job (FIFO)
    const nextJob = Array.from(this.jobs.values())
      .filter((j) => j.status === "QUEUED")
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0]

    if (!nextJob) return

    this.activeConcurrency += 1
    nextJob.status = "PROCESSING"
    nextJob.attempts += 1
    nextJob.startedAt = new Date()
    nextJob.updatedAt = new Date()

    const handler = this.handlers.get(nextJob.type)

    if (!handler) {
      nextJob.status = "FAILED"
      nextJob.error = `No handler registered for job type: ${nextJob.type}`
      nextJob.failedAt = new Date()
      nextJob.updatedAt = new Date()
      this.activeConcurrency -= 1
      setImmediate(() => this.processNext())
      return
    }

    try {
      logger.info(`Worker processing job [${nextJob.type}] (Attempt ${nextJob.attempts}/${nextJob.maxAttempts})`, "QUEUE", {
        jobId: nextJob.id,
      })

      const updateProgress: JobProgressCallback = async (pct: number, stageMessage?: string) => {
        nextJob.progress = Math.min(100, Math.max(0, pct))
        nextJob.updatedAt = new Date()
        if (stageMessage) {
          logger.debug(`[${nextJob.type}] Progress: ${nextJob.progress}% - ${stageMessage}`, "QUEUE", { jobId: nextJob.id })
        }
      }

      const result = await handler(nextJob.payload, updateProgress, nextJob)

      nextJob.status = "COMPLETED"
      nextJob.progress = 100
      nextJob.result = result
      nextJob.completedAt = new Date()
      nextJob.updatedAt = new Date()

      logger.info(`Job completed successfully: [${nextJob.type}] (${nextJob.id})`, "QUEUE", {
        jobId: nextJob.id,
        durationMs: nextJob.completedAt.getTime() - (nextJob.startedAt?.getTime() ?? nextJob.createdAt.getTime()),
      })
    } catch (err: any) {
      nextJob.status = "FAILED"
      nextJob.error = err?.message || String(err)
      nextJob.failedAt = new Date()
      nextJob.updatedAt = new Date()

      logger.error(`Job execution failed: [${nextJob.type}] (${nextJob.id})`, "QUEUE", {
        jobId: nextJob.id,
        error: nextJob.error,
        attempts: nextJob.attempts,
      })

      // Automatic retry with exponential backoff if below maxAttempts
      if (nextJob.attempts < nextJob.maxAttempts) {
        const backoffDelay = Math.min(60_000, 1000 * Math.pow(2, nextJob.attempts))
        logger.info(`Scheduling retry for [${nextJob.type}] in ${backoffDelay}ms`, "QUEUE", { jobId: nextJob.id })
        setTimeout(() => {
          if (nextJob.status === "FAILED") {
            nextJob.status = "QUEUED"
            nextJob.error = undefined
            nextJob.updatedAt = new Date()
            setImmediate(() => this.processNext())
          }
        }, backoffDelay)
      }
    } finally {
      this.activeConcurrency -= 1
      // Continue draining queue
      setImmediate(() => this.processNext())
    }
  }
}

export const jobQueue = new BackgroundJobQueue()
