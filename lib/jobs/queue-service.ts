// ============================================================
// TOPSEOTOOL — Centralized Background Queue Service
// Connects the enterprise queue engine, handlers & Admin monitoring
// ============================================================

import { jobQueue, JobRecord, JobType, JobStatus, JobHandler } from "./queue-core"
import "./handlers" // Ensure all 8 worker handlers are registered

export { jobQueue, type JobRecord, type JobType, type JobStatus, type JobHandler }

/**
 * Backward-compatible queueManager adapter for AdminService and API consumers
 */
class QueueServiceAdapter {
  registerHandler<T, R>(type: JobType, handler: JobHandler<T, R>) {
    jobQueue.registerHandler(type, handler)
  }

  async enqueue<T>(type: JobType, payload: T, options?: { organizationId?: string; userId?: string }): Promise<JobRecord<T>> {
    return jobQueue.enqueue(type, payload, options)
  }

  getJob(jobId: string): JobRecord | null {
    return jobQueue.getJob(jobId)
  }

  getAllJobs(organizationId?: string): JobRecord[] {
    return jobQueue.getJobs({ organizationId })
  }

  getFailedJobs(organizationId?: string): JobRecord[] {
    return jobQueue.getFailedJobs(organizationId)
  }

  retryJob(jobId: string): boolean {
    void jobQueue.retryJob(jobId)
    return true
  }

  retryAllFailed(organizationId?: string): number {
    return jobQueue.retryAllFailed(organizationId)
  }

  purgeCompletedAndFailed(): void {
    const jobs = jobQueue.getJobs()
    for (const j of jobs) {
      if (j.status === "COMPLETED" || j.status === "FAILED") {
        jobQueue.cancelJob(j.id)
      }
    }
  }
}

export const queueManager = new QueueServiceAdapter()
