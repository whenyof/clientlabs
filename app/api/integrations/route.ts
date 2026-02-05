import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

// GET /api/integrations - List integrations for current user (real DB)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const integrations = await prisma.integration.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return NextResponse.json({
      success: true,
      data: integrations.map(i => ({
        id: i.id,
        name: i.name,
        provider: i.provider,
        status: i.status,
        category: i.category,
        lastSync: i.lastSync,
        createdAt: i.createdAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching integrations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch integrations' },
      { status: 500 }
    )
  }
}

// POST /api/integrations - Create new integration (real DB)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const { name, provider, category = 'CRM' } = body
    if (!name || !provider) {
      return NextResponse.json(
        { success: false, error: 'name and provider required' },
        { status: 400 }
      )
    }
    const integration = await prisma.integration.create({
      data: {
        userId: session.user.id,
        name: String(name),
        provider: String(provider),
        category: ['CRM', 'BILLING', 'COMMS', 'ANALYTICS', 'OTHER'].includes(category) ? category : 'OTHER',
        status: 'DISCONNECTED',
      },
    })
    return NextResponse.json({
      success: true,
      data: {
        id: integration.id,
        name: integration.name,
        provider: integration.provider,
        status: integration.status,
        category: integration.category,
        createdAt: integration.createdAt,
      },
    })
  } catch (error) {
    console.error('Error creating integration:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create integration' },
      { status: 500 }
    )
  }
}