// ============================================================
// TOPSEOTOOL — Stripe Webhook Handler
// Handles all Stripe lifecycle events and syncs subscription
// state to the database. This is the single authoritative
// source for plan/status changes triggered by payment events.
// ============================================================
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { constructStripeEvent, isStripeConfigured } from "@/lib/billing/stripe"
import { PLAN_ORDER, type PlanKey } from "@/types"
import { logger } from "@/lib/logger"
import type Stripe from "stripe"

export const runtime = "nodejs"

// Disable body parsing — Stripe needs the raw body for signature verification
export const dynamic = "force-dynamic"

/** Map a Stripe price ID back to a PlanKey using env vars */
function priceIdToPlanKey(priceId: string): PlanKey | null {
  const map: Record<string, PlanKey> = {
    [process.env.STRIPE_PRICE_PRO ?? ""]: "PRO",
    [process.env.STRIPE_PRICE_AGENCY ?? ""]: "AGENCY",
    [process.env.STRIPE_PRICE_BUSINESS ?? ""]: "BUSINESS",
  }
  return map[priceId] ?? null
}

export async function POST(req: NextRequest) {
  // In dev mode without Stripe configured, skip gracefully
  if (!isStripeConfigured()) {
    return NextResponse.json({ ok: true, message: "Stripe not configured — webhook skipped" })
  }

  const signature = req.headers.get("stripe-signature")
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const rawBody = await req.text()
    event = constructStripeEvent(rawBody, signature)
  } catch (err) {
    logger.error("Stripe webhook signature verification failed", "WEBHOOK", err)
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 })
  }

  logger.info(`Stripe event: ${event.type}`, "WEBHOOK", { eventId: event.id })

  try {
    switch (event.type) {
      // -----------------------------------------------------------------------
      // Checkout session completed — new subscription or upgrade
      // -----------------------------------------------------------------------
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const organizationId = session.metadata?.organizationId
        const planKey = session.metadata?.planKey as PlanKey | undefined

        if (!organizationId || !planKey || !PLAN_ORDER.includes(planKey)) {
          logger.warn("checkout.session.completed: missing metadata", "WEBHOOK", session.metadata)
          break
        }

        const subscriptionId = session.subscription as string | null
        const customerId = session.customer as string | null

        await db.subscription.upsert({
          where: { organizationId },
          update: {
            plan: planKey as any,
            status: "ACTIVE",
            stripeCustomerId: customerId ?? undefined,
            stripeSubscriptionId: subscriptionId ?? undefined,
            cancelAtPeriodEnd: false,
          },
          create: {
            organizationId,
            plan: planKey as any,
            status: "ACTIVE",
            stripeCustomerId: customerId ?? undefined,
            stripeSubscriptionId: subscriptionId ?? undefined,
          },
        })

        logger.info(`Subscription activated: ${planKey}`, "WEBHOOK", { organizationId })
        break
      }

      // -----------------------------------------------------------------------
      // Subscription updated — plan change, renewal, trial end
      // -----------------------------------------------------------------------
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription
        const organizationId = sub.metadata?.organizationId

        if (!organizationId) {
          // Look up by customer ID
          const record = await db.subscription.findFirst({
            where: { stripeCustomerId: sub.customer as string },
          })
          if (!record) {
            logger.warn("customer.subscription.updated: org not found", "WEBHOOK", { customerId: sub.customer })
            break
          }
        }

        const priceId = sub.items.data[0]?.price?.id
        const planKey = priceId ? priceIdToPlanKey(priceId) : null

        const updateData: Record<string, unknown> = {
          status: sub.status.toUpperCase(),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          stripeSubscriptionId: sub.id,
          currentPeriodStart: new Date((sub as any).current_period_start * 1000),
          currentPeriodEnd: new Date((sub as any).current_period_end * 1000),
        }

        if (planKey) updateData.plan = planKey as any

        const orgId = organizationId ?? (
          await db.subscription.findFirst({
            where: { stripeCustomerId: sub.customer as string },
            select: { organizationId: true },
          })
        )?.organizationId

        if (orgId && typeof orgId === "string") {
          await db.subscription.update({
            where: { organizationId: orgId },
            data: updateData,
          })
          logger.info(`Subscription updated: ${planKey ?? "same plan"} / ${sub.status}`, "WEBHOOK", { orgId })
        }
        break
      }

      // -----------------------------------------------------------------------
      // Subscription deleted — customer cancelled or payment failed terminally
      // -----------------------------------------------------------------------
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string

        const record = await db.subscription.findFirst({
          where: { stripeCustomerId: customerId },
          select: { organizationId: true },
        })

        if (record) {
          await db.subscription.update({
            where: { organizationId: record.organizationId },
            data: {
              plan: "FREE" as any,
              status: "CANCELED",
              stripeSubscriptionId: null,
              cancelAtPeriodEnd: false,
            },
          })
          logger.info("Subscription canceled — downgraded to FREE", "WEBHOOK", { organizationId: record.organizationId })
        }
        break
      }

      // -----------------------------------------------------------------------
      // Payment failed — mark as past due
      // -----------------------------------------------------------------------
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const record = await db.subscription.findFirst({
          where: { stripeCustomerId: customerId },
          select: { organizationId: true },
        })

        if (record) {
          await db.subscription.update({
            where: { organizationId: record.organizationId },
            data: { status: "PAST_DUE" },
          })
          logger.warn("Payment failed — subscription marked PAST_DUE", "WEBHOOK", { organizationId: record.organizationId })
        }
        break
      }

      // -----------------------------------------------------------------------
      // Invoice paid — mark active again (after a past-due recovery)
      // -----------------------------------------------------------------------
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const record = await db.subscription.findFirst({
          where: { stripeCustomerId: customerId },
          select: { organizationId: true, status: true },
        })

        if (record && record.status === "PAST_DUE") {
          await db.subscription.update({
            where: { organizationId: record.organizationId },
            data: { status: "ACTIVE" },
          })
          logger.info("Invoice paid — subscription restored to ACTIVE", "WEBHOOK", { organizationId: record.organizationId })
        }
        break
      }

      default:
        // Unhandled event types — log and ignore
        logger.info(`Unhandled Stripe event type: ${event.type}`, "WEBHOOK")
    }

    return NextResponse.json({ ok: true, type: event.type })
  } catch (err) {
    logger.error("Webhook handler error", "WEBHOOK", err)
    // Return 200 anyway so Stripe doesn't retry for our own errors
    return NextResponse.json({ ok: false, error: "Internal handler error" })
  }
}
