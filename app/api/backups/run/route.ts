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

// POST /api/backups/run - Execute manual backup
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

    // Execute backup script
    const scriptPath = path.join(process.cwd(), 'scripts', 'auto-backup.sh')

    console.log('Starting manual backup via API:', { user: accessCheck.user.email })

    // Run backup with timeout (10 minutes)
    const { stdout, stderr } = await execAsync(`bash "${scriptPath}"`, {
      cwd: process.cwd(),
      timeout: 600000, // 10 minutes
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    })

    const output = stdout + stderr

    // Extract backup info from output
    const backupMatch = output.match(/📦 Backup: ([^\n]+)/)
    const backupName = backupMatch ? backupMatch[1].replace(/`/g, '') : 'Unknown'

    console.log('Manual backup completed via API:', { backupName, user: accessCheck.user.email })

    return NextResponse.json({
      success: true,
      backup: {
        name: backupName,
        timestamp: new Date().toISOString()
      },
      output: output.split('\n').slice(-10), // Last 10 lines
      message: 'Backup completed successfully'
    })

  } catch (error: any) {
    console.error('Manual backup failed via API:', error)

    // Check if it's a timeout
    if (error.code === 'ETIMEDOUT') {
      return NextResponse.json(
        {
          success: false,
          error: 'Backup timed out after 10 minutes',
          timestamp: new Date().toISOString()
        },
        { status: 408 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Backup execution failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}