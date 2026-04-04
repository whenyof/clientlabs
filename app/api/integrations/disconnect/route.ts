export const maxDuration = 10
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

        const { type, provider } = await request.json()

        if (!type || !provider) {
            return NextResponse.json({ error: 'Integration type and provider required' }, { status: 400 })
        }

        // Disconnect integration (setting status to DISCONNECTED)
        // Could also just delete it, but marking disconnected preserves the config/webhookUrl
        const result = await prisma.integration.updateMany({
            where: {
                userId: session.user.id,
                type: String(type),
                provider: String(provider)
            },
            data: {
                status: 'DISCONNECTED'
            }
        })

        return NextResponse.json({ success: true, count: result.count })
    } catch (error) {
        console.error('Error disconnecting integration:', error)
        return NextResponse.json({ error: 'Failed to disconnect integration' }, { status: 500 })
    }
}
