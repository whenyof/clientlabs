// API route for Stripe customer portal

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createCustomerPortalSession } from '@/app/dashboard/other/settings/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    // TODO: Add session validation
    // const session = await getServerSession()
    // if (!session?.user?.id) {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   )
    // }

    // Mock user data - replace with real session data
    const customerId = 'cus_mock_customer_id' // Get from user record

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      )
    }

    const result = await createCustomerPortalSession({
      customerId,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/other/settings`
    })

    return NextResponse.json({
      success: true,
      url: result.url
    })

  } catch (error) {
    console.error('Error creating customer portal session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create customer portal session' },
      { status: 500 }
    )
  }
}