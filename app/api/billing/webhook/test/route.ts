import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { eventType = "checkout.session.completed", organizationId = "org_test", planKey = "PROFESSIONAL", cadence = "MONTHLY" } = body

    let simulatedEvent: any = {}

    switch (eventType) {
      case "checkout.session.completed":
        simulatedEvent = {
          id: `evt_sim_${Date.now()}`,
          type: "checkout.session.completed",
          data: {
            object: {
              id: `cs_sim_${Date.now()}`,
              customer: "cus_sim_test_123",
              subscription: "sub_sim_test_123",
              metadata: {
                organizationId,
                planKey,
                cadence,
              },
            },
          },
        }
        break

      case "invoice.payment_failed":
        simulatedEvent = {
          id: `evt_sim_${Date.now()}`,
          type: "invoice.payment_failed",
          data: {
            object: {
              id: `in_sim_${Date.now()}`,
              customer: "cus_sim_test_123",
              amount_due: 19900,
            },
          },
        }
        break

      case "invoice.paid":
        simulatedEvent = {
          id: `evt_sim_${Date.now()}`,
          type: "invoice.paid",
          data: {
            object: {
              id: `in_sim_${Date.now()}`,
              customer: "cus_sim_test_123",
              amount_paid: 19900,
            },
          },
        }
        break

      case "customer.subscription.updated":
        simulatedEvent = {
          id: `evt_sim_${Date.now()}`,
          type: "customer.subscription.updated",
          data: {
            object: {
              id: "sub_sim_test_123",
              customer: "cus_sim_test_123",
              status: "active",
              cancel_at_period_end: false,
              current_period_start: Math.floor(Date.now() / 1000),
              current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30,
              items: {
                data: [{ price: { id: `price_${planKey.toLowerCase()}` } }],
              },
              metadata: { organizationId, planKey },
            },
          },
        }
        break

      default:
        return NextResponse.json({ ok: false, error: `Unsupported simulated event: ${eventType}` }, { status: 400 })
    }

    // Forward to actual webhook handler
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin
    const res = await fetch(`${appUrl}/api/billing/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(simulatedEvent),
    })

    const json = await res.json()
    return NextResponse.json({
      ok: true,
      simulatedEventType: eventType,
      webhookResponse: json,
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
