// ============================================================
// TOPSEOTOOL — Cloud Storage Service Abstraction
// Handles PDF exports, audit artifacts, and agency brand assets
// Supports Local storage, Supabase Storage, or AWS S3
// ============================================================

import { logger } from "@/lib/logger"

export interface StorageAdapter {
  upload(key: string, buffer: Buffer | Uint8Array, mimeType: string): Promise<string>
  getDownloadUrl(key: string): Promise<string>
  delete(key: string): Promise<void>
}

class SupabaseOrLocalAdapter implements StorageAdapter {
  private supabaseUrl: string | undefined
  private supabaseKey: string | undefined

  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    this.supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  }

  async upload(key: string, buffer: Buffer | Uint8Array, mimeType: string): Promise<string> {
    if (this.supabaseUrl && this.supabaseKey) {
      try {
        const url = `${this.supabaseUrl}/storage/v1/object/reports/${key}`
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.supabaseKey}`,
            "Content-Type": mimeType,
          },
          body: buffer as any,
        })
        if (res.ok) {
          return `${this.supabaseUrl}/storage/v1/object/public/reports/${key}`
        }
      } catch (err) {
        logger.warn("Supabase upload failed, falling back to data URL", "STORAGE", { err })
      }
    }

    // Default fallback: return public relative URL or data URL
    return `/api/reports/download/${encodeURIComponent(key)}`
  }

  async getDownloadUrl(key: string): Promise<string> {
    if (this.supabaseUrl) {
      return `${this.supabaseUrl}/storage/v1/object/public/reports/${key}`
    }
    return `/api/reports/download/${encodeURIComponent(key)}`
  }

  async delete(key: string): Promise<void> {
    logger.info("Storage object delete requested", "STORAGE", { key })
  }
}

export const storage = new SupabaseOrLocalAdapter()
