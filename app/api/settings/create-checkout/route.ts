// API route for creating Stripe checkout sessions

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createCheckoutSession } from '@/app/dashboard/other/settings/lib/stripe'
import { PLANS } from '@/app/dashboard/other/settings/lib/plans'

export async function POST(request: NextRequest) {
  try {
    // TODO: Add session validation
    // const session = await getServerSession()
    // if (!session?.user?.email) {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   )
    // }

    const { planId } = await request.json()

    if (!planId) {
      return NextResponse.json(
        { success: false, error: 'Plan ID is required' },
        { status: 400 }
      )
    }

    const plan = PLANS.find(p => p.id === planId)
    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan' },
        { status: 400 }
      )
    }

    // Mock user data - replace with real session data
    const userEmail = 'user@example.com'
    const userId = 'user_123'

    // Create checkout session
    const result = await createCheckoutSession({
      priceId: plan.stripePriceId,
      userId,
      userEmail,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/other/settings?success=true`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/other/settings?canceled=true`
    })

    return NextResponse.json({
      success: true,
      sessionId: result.sessionId,
      url: result.url
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}