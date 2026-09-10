// ============================================================
// TOPSEOTOOL — Abstracted Billing Provider Architecture
// Allows swapping Stripe with LemonSqueezy, Paddle, or custom gateways
// without modifying business logic or route handlers.
// ============================================================

import type { PlanKey } from "@/types"

export type PaymentProviderId = "stripe" | "lemonsqueezy" | "paddle" | "mock"

export interface CheckoutOptions {
  planKey: PlanKey
  organizationId: string
  returnUrl: string
  email?: string | null
  orgName?: string | null
  isYearly?: boolean
}

export interface CheckoutResult {
  url: string
  sessionId?: string
  providerId: PaymentProviderId
}

export interface PortalOptions {
  organizationId: string
  returnUrl: string
}

export interface PortalResult {
  url: string
  providerId: PaymentProviderId
}

export interface SubscriptionDetails {
  id: string
  organizationId: string
  planKey: PlanKey
  status: "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING" | "INCOMPLETE"
  currentPeriodStart?: Date | null
  currentPeriodEnd?: Date | null
  cancelAtPeriodEnd: boolean
  customerEmail?: string | null
}

export interface WebhookResult {
  received: boolean
  event?: string
  organizationId?: string
  planKey?: PlanKey
  status?: string
}

/**
 * Universal Billing Provider Contract
 * Any payment gateway (Stripe, LemonSqueezy, Paddle) must implement this interface.
 */
export interface BillingProvider {
  readonly id: PaymentProviderId
  readonly name: string

  isConfigured(): boolean

  getOrCreateCustomer(
    organizationId: string,
    email?: string | null,
    name?: string | null
  ): Promise<string>

  createCheckoutSession(options: CheckoutOptions): Promise<CheckoutResult>

  createPortalSession(options: PortalOptions): Promise<PortalResult>

  cancelSubscription(organizationId: string): Promise<void>

  resumeSubscription(organizationId: string): Promise<void>

  handleWebhook(
    payload: string | Buffer,
    signature: string
  ): Promise<WebhookResult>
}

export type BillingCadence = "MONTHLY" | "ANNUAL"

export interface BillingInvoice {
  id: string
  number: string
  amountUsd: number
  currency: string
  status: "paid" | "open" | "void" | "uncollectible" | "failed"
  date: string
  periodStart: string
  periodEnd: string
  pdfUrl: string
  hostedInvoiceUrl: string
  planName: string
  paymentMethod?: {
    brand: string
    last4: string
  }
}

export interface CouponValidation {
  code: string
  valid: boolean
  discountType: "PERCENT" | "FIXED"
  discountValue: number
  description: string
  appliesTo: "ALL" | "ANNUAL_ONLY" | "PRO_AGENCY"
}

export interface ChangePlanOptions {
  organizationId: string
  newPlanKey: PlanKey
  cadence: BillingCadence
}
