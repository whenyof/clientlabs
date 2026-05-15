// Professional Stripe Configuration
// Production-ready Stripe integration

import Stripe from 'stripe'
import { PLANS } from './plans'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is missing. Stripe features will be disabled.')
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  console.warn('STRIPE_WEBHOOK_SECRET is missing.')
}

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  console.warn('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing.')
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-02-25.clover',
    typescript: true,
  })
  : null as unknown as Stripe

export const stripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
}

// Stripe Products and Prices
export const STRIPE_PRODUCTS = {
  STARTER: process.env.STRIPE_STARTER_PRODUCT_ID || '',
  PRO: process.env.STRIPE_PRO_PRODUCT_ID || '',
  BUSINESS: process.env.STRIPE_BUSINESS_PRODUCT_ID || '',
}

export const STRIPE_PRICES = {
  STARTER_MONTHLY: process.env.STRIPE_STARTER_PRICE_ID || '',
  PRO_MONTHLY: process.env.STRIPE_PRO_PRICE_ID || '',
  BUSINESS_MONTHLY: process.env.STRIPE_BUSINESS_PRICE_ID || '',
}

// Customer Portal Configuration
export const CUSTOMER_PORTAL_CONFIG = {
  features: {
    customer_update: {
      enabled: true,
      allowed_updates: ['email', 'name', 'phone'],
    },
    invoice_history: { enabled: true },
    payment_method_update: { enabled: true },
    subscription_cancel: { enabled: true },
    subscription_pause: { enabled: false },
    subscription_update: {
      enabled: true,
      proration_behavior: 'create_prorations' as const,
      default_allowed_updates: ['price'],
    },
  },
  business_profile: {
    privacy_policy_url: 'https://clientlabs.com/privacy',
    terms_of_service_url: 'https://clientlabs.com/terms',
  },
}

// Create Checkout Session
export async function createCheckoutSession({
  priceId,
  userId,
  userEmail,
  successUrl,
  cancelUrl,
}: {
  priceId: string
  userId: string
  userEmail: string
  successUrl: string
  cancelUrl: string
}) {
  try {
    if (!stripe) throw new Error('Stripe is not initialized')
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      client_reference_id: userId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      metadata: {
        userId,
      },
    })

    return { sessionId: session.id, url: session.url }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw new Error('Failed to create checkout session')
  }
}

// Create Customer Portal Session
export async function createCustomerPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}) {
  try {
    if (!stripe) throw new Error('Stripe is not initialized')
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
      configuration: CUSTOMER_PORTAL_CONFIG as any,
    })

    return { url: session.url }
  } catch (error) {
    console.error('Error creating customer portal session:', error)
    throw new Error('Failed to create customer portal session')
  }
}

// Get Customer by Email
export async function getCustomerByEmail(email: string) {
  try {
    if (!stripe) return null
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    })

    return customers.data[0] || null
  } catch (error) {
    console.error('Error getting customer by email:', error)
    return null
  }
}

// Create or Retrieve Customer
export async function createOrRetrieveCustomer({
  email,
  name,
  userId,
}: {
  email: string
  name?: string
  userId: string
}) {
  try {
    let customer = await getCustomerByEmail(email)

    if (!customer) {
      customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          userId,
        },
      })
    }

    return customer
  } catch (error) {
    console.error('Error creating/retrieving customer:', error)
    throw new Error('Failed to create customer')
  }
}

// Cancel Subscription
export async function cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd,
    })

    return subscription
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw new Error('Failed to cancel subscription')
  }
}

// Update Subscription
export async function updateSubscription(subscriptionId: string, newPriceId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const currentItem = subscription.items.data[0]

    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: currentItem.id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    })

    return updatedSubscription
  } catch (error) {
    console.error('Error updating subscription:', error)
    throw new Error('Failed to update subscription')
  }
}

