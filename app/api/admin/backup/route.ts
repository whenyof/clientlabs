import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createEncryptedBackup, getBackupLogs, validateBackupSecret } from '@/lib/backup'

// Only allow admin users
async function checkAdminAccess() {
  const session = await getServerSession()

  if (!session?.user?.id) {
    return { error: 'Unauthorized', status: 401 }
  }

  // TODO: Check if user has admin role
  // For now, allow all authenticated users
  // In production, check: session.user.role === 'ADMIN'

  return { user: session.user }
}

// POST /api/admin/backup - Create encrypted backup
export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const accessCheck = await checkAdminAccess()
    if (accessCheck.error) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      )
    }

    // Start backup process
    const backupResult = await createEncryptedBackup()

    if (!backupResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: backupResult.error,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }

    // Log admin action
    console.log(`Admin backup created by ${accessCheck.user.email}: ${backupResult.encryptedPath}`)

    return NextResponse.json({
      success: true,
      backup: {
        path: backupResult.backupPath,
        encryptedPath: backupResult.encryptedPath,
        size: backupResult.size,
        timestamp: new Date().toISOString()
      },
      message: 'Backup created and encrypted successfully'
    })

  } catch (error) {
    console.error('Admin backup creation failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Backup creation failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// GET /api/admin/backup - Get backup logs
export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const accessCheck = await checkAdminAccess()
    if (accessCheck.error) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      )
    }

    const backupLogs = await getBackupLogs()

    return NextResponse.json({
      success: true,
      backups: backupLogs,
      count: backupLogs.length
    })

  } catch (error) {
    console.error('Failed to fetch backup logs:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch backup logs'
      },
      { status: 500 }
    )
  }
}