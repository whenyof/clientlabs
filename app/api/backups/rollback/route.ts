import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)

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

// POST /api/backups/rollback - Execute rollback to specific backup
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

    const body = await request.json()
    const { backupName } = body

    if (!backupName) {
      return NextResponse.json(
        { error: 'backupName is required' },
        { status: 400 }
      )
    }

    // Validate backup name format
    if (!backupName.match(/^backup_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.zip$/)) {
      return NextResponse.json(
        { error: 'Invalid backup name format' },
        { status: 400 }
      )
    }

    // Check if backup exists in cloud
    try {
      const { stdout } = await execAsync(`rclone lsf gdrive-secure:backups/code/ | grep "${backupName}"`, {
        timeout: 30000
      })

      if (!stdout.trim()) {
        return NextResponse.json(
          { error: `Backup ${backupName} not found in cloud storage` },
          { status: 404 }
        )
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to verify backup existence' },
        { status: 500 }
      )
    }

    console.log('Starting rollback via API:', {
      backupName,
      user: accessCheck.user?.email
    })

    // Execute rollback script
    const scriptPath = path.join(process.cwd(), 'scripts', 'restore-backup.sh')

    const { stdout, stderr } = await execAsync(`bash "${scriptPath}" --auto "${backupName}"`, {
      cwd: process.cwd(),
      timeout: 900000, // 15 minutes
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    })

    const output = stdout + stderr

    console.log('Rollback completed via API:', {
      backupName,
      user: accessCheck.user?.email
    })

    return NextResponse.json({
      success: true,
      rollback: {
        backupName,
        timestamp: new Date().toISOString()
      },
      output: output.split('\n').slice(-10), // Last 10 lines
      message: 'Rollback completed successfully'
    })

  } catch (error: any) {
    console.error('Rollback failed via API:', error)

    // Check if it's a timeout
    if (error.code === 'ETIMEDOUT') {
      return NextResponse.json(
        {
          success: false,
          error: 'Rollback timed out after 15 minutes',
          timestamp: new Date().toISOString()
        },
        { status: 408 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Rollback execution failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}