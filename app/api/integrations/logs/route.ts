// API route for integration logs

import { NextRequest, NextResponse } from 'next/server'
import { mockIntegrationLogs } from '@/app/dashboard/other/integrations/mock'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const integrationId = searchParams.get('integrationId')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')

    // TODO: Get real logs from database
    // const logs = await prisma.integrationLog.findMany({
    //   where: {
    //     ...(integrationId && { integrationId }),
    //     ...(type && { type })
    //   },
    //   orderBy: { createdAt: 'desc' },
    //   take: limit
    // })

    // Mock response for now
    let logs = mockIntegrationLogs

    if (integrationId) {
      logs = logs.filter(log => log.integrationId === integrationId)
    }

    if (type) {
      logs = logs.filter(log => log.type === type)
    }

    logs = logs.slice(0, limit)

    return NextResponse.json({
      success: true,
      data: logs,
      total: logs.length
    })
  } catch (error) {
    console.error('Error fetching integration logs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch integration logs' },
      { status: 500 }
    )
  }
}