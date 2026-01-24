import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import fs from 'fs'
import path from 'path'

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

// GET /api/backups/logs - Get backup system logs
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

    const logs: string[] = []

    // Read auto-backup.log
    try {
      const autoBackupLogPath = path.join(process.cwd(), 'backups', 'auto-backup.log')
      if (fs.existsSync(autoBackupLogPath)) {
        const content = fs.readFileSync(autoBackupLogPath, 'utf-8')
        const lines = content.split('\n').filter(line => line.trim())
        logs.push(...lines.slice(-100)) // Last 100 lines
      }
    } catch (error) {
      console.error('Error reading auto-backup.log:', error)
    }

    // Read cron.log
    try {
      const cronLogPath = path.join(process.cwd(), 'backups', 'cron.log')
      if (fs.existsSync(cronLogPath)) {
        const content = fs.readFileSync(cronLogPath, 'utf-8')
        const lines = content.split('\n').filter(line => line.trim())
        logs.push(...lines.slice(-50)) // Last 50 lines
      }
    } catch (error) {
      console.error('Error reading cron.log:', error)
    }

    // Read telegram bot logs
    try {
      const telegramLogPath = path.join(process.cwd(), 'backups', 'telegram-bot.log')
      if (fs.existsSync(telegramLogPath)) {
        const content = fs.readFileSync(telegramLogPath, 'utf-8')
        const lines = content.split('\n').filter(line => line.trim())
        logs.push(...lines.slice(-50)) // Last 50 lines
      }
    } catch (error) {
      console.error('Error reading telegram-bot.log:', error)
    }

    // Sort logs by timestamp (most recent first)
    const sortedLogs = logs
      .filter(log => log.includes('"timestamp"') || log.includes('[INFO]') || log.includes('[ERROR]'))
      .sort((a, b) => {
        // Simple sort - in production you might want more sophisticated sorting
        return b.localeCompare(a)
      })
      .slice(0, 200) // Limit to 200 most recent entries

    return NextResponse.json({
      success: true,
      logs: sortedLogs,
      count: sortedLogs.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Backup logs error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve backup logs',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}