// ============================================================
// TOPSEOTOOL — Stripe Billing Provider Implementation
// ============================================================

import Stripe from "stripe"
import { getPlanConfig } from "@/types"
import { db } from "@/lib/db"
import { logger } from "@/lib/logger"
import type {
  BillingProvider,
  CheckoutOptions,
  CheckoutResult,
  PortalOptions,
  PortalResult,
  WebhookResult
} from "../types"

let _stripe: Stripe | null = null

function getStripe(): Stripe {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set")
  _stripe = new Stripe(key, {
    apiVersion: "2025-02-24.acacia",
    appInfo: { name: "TOPSEOTOOL Enterprise", version: "1.0.0" },
  })
  return _stripe
}

export class StripeBillingProvider implements BillingProvider {
  readonly id = "stripe" as const
  readonly name = "Stripe"

  isConfigured(): boolean {
    return Boolean(process.env.STRIPE_SECRET_KEY)
  }

  async getOrCreateCustomer(
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

    if (!this.isConfigured()) {
      return `cus_mock_${organizationId.slice(0, 8)}`
    }

    const stripe = getStripe()
    const customer = await stripe.customers.create({
      email: email ?? undefined,
      name: name ?? undefined,
      metadata: { organizationId },
    })

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

    logger.info("Stripe customer created", "BILLING_STRIPE", {
      customerId: customer.id,
      organizationId,
    })

    return customer.id
  }

  async createCheckoutSession(options: CheckoutOptions): Promise<CheckoutResult> {
    const { planKey, organizationId, returnUrl, email, orgName } = options
    const plan = getPlanConfig(planKey)
    const priceId = plan.getPriceId()

    if (!this.isConfigured() || !priceId) {
      logger.info("Mock checkout session returned", "BILLING_STRIPE", { planKey })
      return {
        url: `${returnUrl}?checkout_success=true&plan=${planKey}`,
        providerId: this.id,
      }
    }

    const stripe = getStripe()
    const customerId = await this.getOrCreateCustomer(organizationId, email, orgName)

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

    logger.info("Checkout session created", "BILLING_STRIPE", {
      sessionId: session.id,
      planKey,
      organizationId,
    })

    return {
      url: session.url!,
      sessionId: session.id,
      providerId: this.id,
    }
  }

  async createPortalSession(options: PortalOptions): Promise<PortalResult> {
    const { organizationId, returnUrl } = options
    const subscription = await db.subscription.findUnique({
      where: { organizationId },
      select: { stripeCustomerId: true },
    })

    const customerId = subscription?.stripeCustomerId

    if (!this.isConfigured() || !customerId || customerId.startsWith("cus_mock")) {
      return { url: returnUrl, providerId: this.id }
    }

    const stripe = getStripe()
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return { url: session.url, providerId: this.id }
  }

  async cancelSubscription(organizationId: string): Promise<void> {
    const sub = await db.subscription.findUnique({
      where: { organizationId },
      select: { stripeSubscriptionId: true },
    })

    if (this.isConfigured() && sub?.stripeSubscriptionId) {
      const stripe = getStripe()
      await stripe.subscriptions.update(sub.stripeSubscriptionId, {
        cancel_at_period_end: true,
      })
    }

    await db.subscription.update({
      where: { organizationId },
      data: { cancelAtPeriodEnd: true },
    })

    logger.info("Subscription canceled at period end", "BILLING_STRIPE", { organizationId })
  }

  async resumeSubscription(organizationId: string): Promise<void> {
    const sub = await db.subscription.findUnique({
      where: { organizationId },
      select: { stripeSubscriptionId: true },
    })

    if (this.isConfigured() && sub?.stripeSubscriptionId) {
      const stripe = getStripe()
      await stripe.subscriptions.update(sub.stripeSubscriptionId, {
        cancel_at_period_end: false,
      })
    }

    await db.subscription.update({
      where: { organizationId },
      data: { cancelAtPeriodEnd: false },
    })

    logger.info("Subscription resumed", "BILLING_STRIPE", { organizationId })
  }

  async handleWebhook(payload: string | Buffer, signature: string): Promise<WebhookResult> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      return { received: true, event: "mock_webhook" }
    }

    const stripe = getStripe()
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)

    return {
      received: true,
      event: event.type,
      organizationId: (event.data.object as any)?.metadata?.organizationId,
    }
  }
}
