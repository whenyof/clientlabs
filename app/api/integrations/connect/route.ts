import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { type, provider, category = 'OTHER', config = {} } = body

        if (!type || !provider) {
            return NextResponse.json({ error: 'Integration type and provider required' }, { status: 400 })
        }

        // Check if integration already exists
        let integration = await prisma.integration.findFirst({
            where: {
                userId: session.user.id,
                type: String(type),
                provider: String(provider)
            }
        })

        if (integration) {
            // Update existing
            integration = await prisma.integration.update({
                where: { id: integration.id },
                data: {
                    status: 'CONNECTED',
                    config,
                    lastSync: new Date()
                }
            })
        } else {
            // Create new
            integration = await prisma.integration.create({
                data: {
                    userId: session.user.id,
                    name: provider, // Display name
                    type: String(type),
                    provider: String(provider),
                    category: ['CRM', 'BILLING', 'COMMS', 'ANALYTICS', 'OTHER'].includes(category) ? category as any : 'OTHER',
                    status: 'CONNECTED',
                    config,
                    lastSync: new Date()
                }
            })
        }

        return NextResponse.json({ success: true, integration })
    } catch (error) {
        console.error('Error connecting integration:', error)
        return NextResponse.json({ error: 'Failed to connect integration' }, { status: 500 })
    }
}
