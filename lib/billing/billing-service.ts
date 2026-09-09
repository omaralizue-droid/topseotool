// ============================================================
// TOPSEOTOOL — Central Billing Service
// Resolves the active billing provider dynamically (Stripe, LemonSqueezy, etc.)
// ============================================================

import type { BillingProvider, PaymentProviderId } from "./types"
import { StripeBillingProvider } from "./providers/stripe-provider"

const stripeProvider = new StripeBillingProvider()

// Registry of available payment gateways
const providers: Record<string, BillingProvider> = {
  stripe: stripeProvider,
}

/**
 * Returns the currently configured payment provider.
 * Allows effortless switching between Stripe, LemonSqueezy, or Paddle via BILLING_PROVIDER env var.
 */
export function getBillingProvider(providerId?: PaymentProviderId): BillingProvider {
  const activeId = providerId || (process.env.BILLING_PROVIDER as PaymentProviderId) || "stripe"
  const provider = providers[activeId]
  if (!provider) {
    return stripeProvider // fallback to Stripe
  }
  return provider
}

export * from "./types"
export { StripeBillingProvider } from "./providers/stripe-provider"
