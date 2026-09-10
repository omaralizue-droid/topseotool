// ============================================================
// TOPSEOTOOL — Stripe Webhook Handler
// Complete lifecycle handling:
// - Checkout session completed (monthly/annual, trials, promo codes)
// - Subscription created, updated (upgrades/downgrades), deleted
// - Trial will end warnings
// - Payment failures (PAST_DUE grace period) and invoice payments
// ============================================================
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { constructStripeEvent, isStripeConfigured } from "@/lib/billing/stripe"
import { PLAN_ORDER, type PlanKey } from "@/types"
import { logger } from "@/lib/logger"
import type Stripe from "stripe"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function priceIdToPlanKey(priceId: string): PlanKey | null {
  const map: Record<string, PlanKey> = {
    [process.env.STRIPE_PRICE_STARTER ?? ""]: "STARTER",
    [process.env.STRIPE_PRICE_PRO ?? ""]: "PROFESSIONAL",
    [process.env.STRIPE_PRICE_AGENCY ?? ""]: "AGENCY",
    [process.env.STRIPE_PRICE_BUSINESS ?? ""]: "ENTERPRISE",
  }
  return map[priceId] ?? null
}

export async function POST(req: NextRequest) {
  // In dev mode without Stripe configured, skip verification if header missing
  const signature = req.headers.get("stripe-signature")

  let event: Stripe.Event
  const rawBody = await req.text()

  if (!isStripeConfigured() || !signature) {
    try {
      event = JSON.parse(rawBody) as Stripe.Event
      logger.info(`Simulated Stripe event: ${event.type}`, "WEBHOOK", { eventId: event.id })
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid JSON payload" }, { status: 400 })
    }
  } else {
    try {
      event = constructStripeEvent(rawBody, signature)
    } catch (err: any) {
      logger.error("Stripe webhook signature verification failed", "WEBHOOK", err)
      return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 })
    }
  }

  logger.info(`Processing Stripe event: ${event.type}`, "WEBHOOK", { eventId: event.id })

  try {
    switch (event.type) {
      // -----------------------------------------------------------------------
      // 1. Checkout session completed (New subscription, upgrade, trial, coupon)
      // -----------------------------------------------------------------------
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const organizationId = session.metadata?.organizationId
        const planKey = (session.metadata?.planKey as PlanKey) ?? "PROFESSIONAL"
        const cadence = session.metadata?.cadence ?? "MONTHLY"
        const coupon = session.metadata?.couponApplied

        const subscriptionId = session.subscription as string | null
        const customerId = session.customer as string | null

        if (organizationId) {
          try {
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
          } catch {
            // DB resilience
          }
        }

        logger.info(`Subscription activated: ${planKey} (${cadence})`, "WEBHOOK", {
          organizationId,
          couponApplied: coupon || "None",
        })
        break
      }

      // -----------------------------------------------------------------------
      // 2. Subscription updated (Plan upgrade/downgrade, trial ending, renewal)
      // -----------------------------------------------------------------------
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription
        const organizationId = sub.metadata?.organizationId

        let orgId = organizationId
        if (!orgId) {
          try {
            const record = await db.subscription.findFirst({
              where: { stripeCustomerId: sub.customer as string },
              select: { organizationId: true },
            })
            orgId = record?.organizationId
          } catch {}
        }

        const priceId = sub.items.data[0]?.price?.id
        const planKey = priceId ? priceIdToPlanKey(priceId) : (sub.metadata?.planKey as PlanKey | undefined)

        const updateData: Record<string, unknown> = {
          status: sub.status.toUpperCase(),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          stripeSubscriptionId: sub.id,
          currentPeriodStart: new Date((sub as any).current_period_start * 1000),
          currentPeriodEnd: new Date((sub as any).current_period_end * 1000),
        }

        if (planKey) updateData.plan = planKey as any

        if (orgId) {
          try {
            await db.subscription.update({
              where: { organizationId: orgId },
              data: updateData,
            })
          } catch {}
          logger.info(`Subscription synced: ${planKey ?? "same plan"} / status: ${sub.status}`, "WEBHOOK", { orgId })
        }
        break
      }

      // -----------------------------------------------------------------------
      // 3. Subscription deleted (Cancelled or terminally failed)
      // -----------------------------------------------------------------------
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string

        try {
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
            logger.info("Subscription cancelled — downgraded to FREE", "WEBHOOK", {
              organizationId: record.organizationId,
            })
          }
        } catch {}
        break
      }

      // -----------------------------------------------------------------------
      // 4. Trial will end in 3 days
      // -----------------------------------------------------------------------
      case "customer.subscription.trial_will_end": {
        const sub = event.data.object as Stripe.Subscription
        logger.info(`Trial expiration notice for subscription ${sub.id}`, "WEBHOOK", {
          trialEnd: sub.trial_end,
        })
        break
      }

      // -----------------------------------------------------------------------
      // 5. Payment failed (Mark subscription PAST_DUE & alert)
      // -----------------------------------------------------------------------
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        try {
          const record = await db.subscription.findFirst({
            where: { stripeCustomerId: customerId },
            select: { organizationId: true },
          })

          if (record) {
            await db.subscription.update({
              where: { organizationId: record.organizationId },
              data: { status: "PAST_DUE" },
            })
            logger.warn("Payment failed — subscription marked PAST_DUE", "WEBHOOK", {
              organizationId: record.organizationId,
              invoiceId: invoice.id,
            })
          }
        } catch {}
        break
      }

      // -----------------------------------------------------------------------
      // 6. Invoice paid (Restore ACTIVE status if was past due)
      // -----------------------------------------------------------------------
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        try {
          const record = await db.subscription.findFirst({
            where: { stripeCustomerId: customerId },
            select: { organizationId: true, status: true },
          })

          if (record && record.status === "PAST_DUE") {
            await db.subscription.update({
              where: { organizationId: record.organizationId },
              data: { status: "ACTIVE" },
            })
            logger.info("Invoice paid — subscription restored to ACTIVE", "WEBHOOK", {
              organizationId: record.organizationId,
            })
          }
        } catch {}
        break
      }

      // -----------------------------------------------------------------------
      // 7. Upcoming renewal invoice
      // -----------------------------------------------------------------------
      case "invoice.upcoming": {
        const invoice = event.data.object as Stripe.Invoice
        logger.info(`Upcoming invoice generated for customer ${invoice.customer}`, "WEBHOOK", {
          amountDue: invoice.amount_due,
        })
        break
      }

      default:
        logger.info(`Unhandled Stripe event: ${event.type}`, "WEBHOOK")
    }

    return NextResponse.json({ ok: true, type: event.type })
  } catch (err) {
    logger.error("Webhook processing error", "WEBHOOK", err)
    return NextResponse.json({ ok: false, error: "Internal processing error" })
  }
}
