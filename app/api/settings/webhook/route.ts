// Stripe webhook handler

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { handleWebhook } from '@/app/dashboard/other/settings/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const sig = (await headers()).get('stripe-signature')

    if (!sig) {
      return NextResponse.json(
        { success: false, error: 'Missing Stripe signature' },
        { status: 400 }
      )
    }

    // Handle webhook
    const result = await handleWebhook(body, sig)

    if (result.received) {
      return NextResponse.json({ received: true })
    } else {
      return NextResponse.json(
        { success: false, error: 'Webhook processing failed' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}