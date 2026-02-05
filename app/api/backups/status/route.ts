import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { exec } from 'child_process'
import { promisify } from 'util'

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

// GET /api/backups/status - Get comprehensive backup status
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

    // Get local backups
    const localBackups = []
    try {
      const fs = require('fs')
      const path = require('path')
      const backupDir = path.join(process.cwd(), 'backups')

      if (fs.existsSync(backupDir)) {
        const files = fs.readdirSync(backupDir)
        const zipFiles = files
          .filter((f: string) => f.endsWith('.zip'))
          .sort()
          .reverse()
          .slice(0, 10) // Last 10

        for (const file of zipFiles) {
          const filePath = path.join(backupDir, file)
          const stats = fs.statSync(filePath)
          localBackups.push({
            name: file,
            size: stats.size,
            modified: stats.mtime.toISOString()
          })
        }
      }
    } catch (error) {
      console.error('Error reading local backups:', error)
    }

    // Get cloud backups
    let cloudBackups: { name: string; size: number }[] = []
    let cloudError = null
    try {
      const { stdout } = await execAsync('rclone lsf gdrive-secure:backups/code/ --format "pst"', {
        timeout: 30000
      })

      const lines = stdout.split('\n').filter(line => line.trim())
      cloudBackups = lines
        .filter((line: string) => line.includes('.zip'))
        .map(line => {
          const parts = line.split(' ')
          const size = parseInt(parts[0]) || 0
          const name = parts.slice(1).join(' ').trim()
          return { name, size }
        })
        .sort((a, b) => b.name.localeCompare(a.name))
        .slice(0, 10) // Last 10
    } catch (error: any) {
      cloudError = error.message
      console.error('Error reading cloud backups:', error)
    }

    // Check cron status
    let cronStatus = 'unknown'
    try {
      const { stdout } = await execAsync('crontab -l | grep auto-backup')
      cronStatus = stdout ? 'active' : 'inactive'
    } catch (error) {
      cronStatus = 'error'
    }

    // Get system info
    const lastBackup = cloudBackups.length > 0 ? cloudBackups[0].name : null

    return NextResponse.json({
      success: true,
      data: {
        localBackups,
        cloudBackups,
        cronStatus,
        lastBackup,
        totalLocal: localBackups.length,
        totalCloud: cloudBackups.length,
        cloudError,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Backup status error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get backup status',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}