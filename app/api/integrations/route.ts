export const maxDuration = 10
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = session.user.id

        // Check DB for Integrations (WhatsApp, Facebook, Web)
        const integrations = await prisma.integration.findMany({
            where: { userId },
            select: { id: true, type: true, category: true, provider: true, status: true, lastSync: true, config: true, health: true }
        })

        // Web: verified integration OR SdkInstallation with real traffic
        const verifiedWebInt = integrations.find(i => i.type === "web" && i.health === "verified")
        let webLastSync: string | null = (verifiedWebInt?.lastSync as Date | null)?.toISOString() ?? null

        if (!webLastSync) {
            try {
                const sdk = await prisma.sdkInstallation.findFirst({
                    where: { userId },
                    orderBy: { lastSeenAt: 'desc' },
                    select: { lastSeenAt: true },
                })
                if (sdk?.lastSeenAt) webLastSync = sdk.lastSeenAt.toISOString()
            } catch {
                // ignore
            }
        }
        const hasWebConnection = webLastSync !== null

        const isConnected = (provider: string) => {
            const ints = integrations.filter((i) => i.provider.toLowerCase() === provider.toLowerCase())
            return ints.some((i) => i.status === 'CONNECTED')
        }

        // Build the expected response format exactly as requested:
        const data = {
            web: {
                connected: hasWebConnection,
                lastSync: webLastSync
            },
            whatsapp: {
                connected: isConnected('whatsapp')
            },
            facebook: {
                connected: isConnected('facebook')
            },
            items: integrations.map((i) => ({ ...i, type: i.category }))
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching integrations:', error)
        return NextResponse.json(
            { error: 'Failed to fetch integrations' },
            { status: 500 }
        )
    }
}