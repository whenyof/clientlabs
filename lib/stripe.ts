import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
  typescript: true,
})

export const PRICE_IDS = {
  PRO_MONTHLY:      process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
  PRO_YEARLY:       process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
  BUSINESS_MONTHLY: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID!,
  BUSINESS_YEARLY:  process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID!,
} as const

export function getPlanFromPriceId(priceId: string): "PRO" | "BUSINESS" | null {
  if (priceId === PRICE_IDS.PRO_MONTHLY || priceId === PRICE_IDS.PRO_YEARLY) return "PRO"
  if (priceId === PRICE_IDS.BUSINESS_MONTHLY || priceId === PRICE_IDS.BUSINESS_YEARLY) return "BUSINESS"
  return null
}

export function getPriceId(plan: "PRO" | "BUSINESS", period: "monthly" | "yearly"): string {
  const key = `${plan}_${period.toUpperCase()}` as keyof typeof PRICE_IDS
  return PRICE_IDS[key]
}
