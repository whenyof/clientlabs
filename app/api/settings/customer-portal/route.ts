export const maxDuration = 10
// API route for Stripe customer portal

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCustomerPortalSession } from '@/app/dashboard/settings/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
 try {
 const session = await getServerSession(authOptions)
 if (!session?.user?.id) {
 return NextResponse.json(
 { success: false, error: 'Unauthorized' },
 { status: 401 }
 )
 }

 // Get the Stripe customer ID from the authenticated user
 const user = await prisma.user.findUnique({
 where: { id: session.user.id },
 select: { stripeCustomerId: true },
 })

 const customerId = user?.stripeCustomerId

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