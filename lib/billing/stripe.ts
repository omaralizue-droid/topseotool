// ============================================================
// TOPSEOTOOL — Stripe Integration Layer
// All Stripe API calls go through this module.
// Never import stripe directly in route handlers.
// ============================================================
import Stripe from "stripe"
import { PLANS, getPlanConfig, type PlanKey } from "@/types"
import { db } from "@/lib/db"
import { logger } from "@/lib/logger"

// ---------------------------------------------------------------------------
// Stripe client singleton — lazy, throws if not configured
// ---------------------------------------------------------------------------

let _stripe: Stripe | null = null

export function getStripeClient(): Stripe {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set")
  _stripe = new Stripe(key, {
    apiVersion: "2025-02-24.acacia",
    appInfo: { name: "TOPSEOTOOL", version: "1.0.0" },
  })
  return _stripe
}

export const isStripeConfigured = (): boolean =>
  Boolean(process.env.STRIPE_SECRET_KEY)

// ---------------------------------------------------------------------------
// Customer management
// ---------------------------------------------------------------------------

/**
 * Get or create a Stripe customer for an organization.
 * Persists the customer ID back to the subscription record.
 */
export async function getOrCreateStripeCustomer(
  organizationId: string,
  email?: string | null,
  name?: string | null
): Promise<string> {
  const subscription = await db.subscription.findUnique({
    where: { organizationId },
    select: { stripeCustomerId: true },
  })

  if (subscription?.stripeCustomerId) {
    return subscription.stripeCustomerId
  }

  if (!isStripeConfigured()) {
    // Dev / CI mode: return a mock customer ID
    return `cus_mock_${organizationId.slice(0, 8)}`
  }

  const stripe = getStripeClient()
  const customer = await stripe.customers.create({
    email: email ?? undefined,
    name: name ?? undefined,
    metadata: { organizationId },
  })

  // Persist customer ID
  await db.subscription.upsert({
    where: { organizationId },
    update: { stripeCustomerId: customer.id },
    create: {
      organizationId,
      stripeCustomerId: customer.id,
      plan: "FREE" as any,
      status: "ACTIVE",
    },
  })

  logger.info("Stripe customer created", "STRIPE", { customerId: customer.id, organizationId })
  return customer.id
}

// ---------------------------------------------------------------------------
// Checkout session
// ---------------------------------------------------------------------------

export interface CheckoutResult {
  url: string
  sessionId?: string
}

export async function createStripeCheckoutSession(
  planKey: PlanKey,
  organizationId: string,
  returnUrl: string,
  email?: string | null,
  orgName?: string | null
): Promise<CheckoutResult> {
  const plan = getPlanConfig(planKey)
  const priceId = plan.getPriceId()

  // Dev mode — return a mock success URL
  if (!isStripeConfigured() || !priceId) {
    logger.info("Mock checkout (Stripe not configured)", "STRIPE", { planKey })
    return {
      url: `${returnUrl}?checkout_success=true&plan=${planKey}`,
    }
  }

  const stripe = getStripeClient()
  const customerId = await getOrCreateStripeCustomer(organizationId, email, orgName)

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      metadata: { organizationId, planKey },
    },
    metadata: { organizationId, planKey },
    success_url: `${returnUrl}?checkout_success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${returnUrl}?checkout_cancelled=true`,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
  })

  logger.info("Stripe checkout session created", "STRIPE", {
    sessionId: session.id,
    planKey,
    organizationId,
  })

  return { url: session.url!, sessionId: session.id }
}

// ---------------------------------------------------------------------------
// Customer portal (manage billing, cancel, update card)
// ---------------------------------------------------------------------------

export interface PortalResult {
  url: string
}

export async function createStripeCustomerPortal(
  organizationId: string,
  returnUrl: string
): Promise<PortalResult> {
  const subscription = await db.subscription.findUnique({
    where: { organizationId },
    select: { stripeCustomerId: true },
  })

  const customerId = subscription?.stripeCustomerId

  if (!isStripeConfigured() || !customerId || customerId.startsWith("cus_mock")) {
    return { url: returnUrl }
  }

  const stripe = getStripeClient()
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return { url: session.url }
}

// ---------------------------------------------------------------------------
// Subscription cancellation
// ---------------------------------------------------------------------------

/**
 * Cancel the active Stripe subscription at the end of the current period.
 * The subscription stays active until `currentPeriodEnd`.
 */
export async function cancelStripeSubscription(
  organizationId: string
): Promise<{ cancelAtPeriodEnd: boolean; periodEnd: Date | null }> {
  const sub = await db.subscription.findUnique({
    where: { organizationId },
    select: { stripeSubscriptionId: true, currentPeriodEnd: true },
  })

  if (!isStripeConfigured() || !sub?.stripeSubscriptionId) {
    // Dev mode / no Stripe sub — just mark in DB
    await db.subscription.update({
      where: { organizationId },
      data: { cancelAtPeriodEnd: true },
    })
    return { cancelAtPeriodEnd: true, periodEnd: sub?.currentPeriodEnd ?? null }
  }

  const stripe = getStripeClient()
  const updated = await stripe.subscriptions.update(sub.stripeSubscriptionId, {
    cancel_at_period_end: true,
  })

  await db.subscription.update({
    where: { organizationId },
    data: { cancelAtPeriodEnd: true },
  })

  logger.info("Subscription set to cancel at period end", "STRIPE", { organizationId })

  return {
    cancelAtPeriodEnd: true,
    periodEnd: sub.currentPeriodEnd,
  }
}

// ---------------------------------------------------------------------------
// Webhook signature verification
// ---------------------------------------------------------------------------

export function constructStripeEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set")
  const stripe = getStripeClient()
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}