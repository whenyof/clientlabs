import { exec, spawn } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface BackupResult {
  success: boolean
  backupPath?: string
  encryptedPath?: string
  size?: number
  error?: string
}

export interface BackupMetadata {
  timestamp: string
  environment: string
  database_type: string
  database_name: string
  backup_size_bytes: number
  compressed_size_bytes: number
  compression_ratio: number
  status: 'unencrypted' | 'encrypted'
}

export interface BackupLogEntry {
  id: string
  timestamp: string
  status: 'unencrypted' | 'encrypted' | 'error'
  size: number
  path: string
  metadata: BackupMetadata
}

/**
 * Execute backup script
 */
export async function runBackup(): Promise<BackupResult> {
  try {
    const scriptPath = path.join(process.cwd(), 'scripts', 'backup.sh')

    // Check if script exists and is executable
    await fs.access(scriptPath, fs.constants.F_OK | fs.constants.X_OK)

    // Run backup script
    const { stdout, stderr } = await execAsync(`bash ${scriptPath}`, {
      cwd: process.cwd(),
      timeout: 300000, // 5 minutes timeout
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    })

    // Parse output to find backup path
    const backupPathMatch = stdout.match(/Location: ([^\n]+)/)
    const backupPath = backupPathMatch ? backupPathMatch[1].trim() : undefined

    return {
      success: true,
      backupPath
    }
  } catch (error) {
    console.error('Backup execution failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Encrypt backup file
 */
export async function encryptBackup(backupPath?: string): Promise<BackupResult> {
  try {
    const scriptPath = path.join(process.cwd(), 'scripts', 'encrypt.sh')
    const args = backupPath ? [backupPath] : []

    // Check if script exists and is executable
    await fs.access(scriptPath, fs.constants.F_OK | fs.constants.X_OK)

    // Run encryption script
    const { stdout, stderr } = await execAsync(`bash ${scriptPath} ${args.join(' ')}`, {
      cwd: process.cwd(),
      timeout: 180000, // 3 minutes timeout
      maxBuffer: 1024 * 1024 * 5 // 5MB buffer
    })

    // Parse output to find encrypted file path
    const encryptedPathMatch = stdout.match(/Encrypted file: ([^\n]+)/)
    const encryptedPath = encryptedPathMatch ? encryptedPathMatch[1].trim() : undefined

    return {
      success: true,
      encryptedPath
    }
  } catch (error) {
    console.error('Encryption execution failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Decrypt backup file (requires password)
 */
export async function decryptBackup(encryptedPath: string, password: string): Promise<BackupResult> {
  try {
    const scriptPath = path.join(process.cwd(), 'scripts', 'decrypt.sh')

    // Check if script exists and is executable
    await fs.access(scriptPath, fs.constants.F_OK | fs.constants.X_OK)

    // Set password in environment for the script
    const env = { ...process.env, BACKUP_SECRET: password }

    // Run decryption script
    const { stdout, stderr } = await execAsync(`bash ${scriptPath} "${encryptedPath}"`, {
      cwd: process.cwd(),
      env,
      timeout: 180000, // 3 minutes timeout
      maxBuffer: 1024 * 1024 * 5 // 5MB buffer
    })

    // Parse output to find decrypted file path
    const decryptedPathMatch = stdout.match(/Decrypted file: ([^\n]+)/)
    const decryptedPath = decryptedPathMatch ? decryptedPathMatch[1].trim() : undefined

    return {
      success: true,
      backupPath: decryptedPath
    }
  } catch (error) {
    console.error('Decryption execution failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get backup logs
 */
export async function getBackupLogs(): Promise<BackupLogEntry[]> {
  try {
    const logPath = path.join(process.cwd(), 'backups', 'backup-log.json')

    try {
      await fs.access(logPath, fs.constants.F_OK)
    } catch {
      return [] // File doesn't exist
    }

    const logContent = await fs.readFile(logPath, 'utf-8')
    const logs = JSON.parse(logContent)

    return Array.isArray(logs) ? logs : []
  } catch (error) {
    console.error('Failed to read backup logs:', error)
    return []
  }
}

/**
 * Get backup metadata
 */
export async function getBackupMetadata(backupPath: string): Promise<BackupMetadata | null> {
  try {
    const metadataPath = path.join(backupPath, 'metadata.json')
    const metadataContent = await fs.readFile(metadataPath, 'utf-8')
    return JSON.parse(metadataContent)
  } catch (error) {
    console.error('Failed to read backup metadata:', error)
    return null
  }
}

/**
 * Validate backup secret key
 */
export function validateBackupSecret(secret: string): { valid: boolean; error?: string } {
  if (!secret) {
    return { valid: false, error: 'Backup secret is required' }
  }

  if (secret.length !== 64) {
    return { valid: false, error: 'Backup secret must be 64 characters (32 bytes hex)' }
  }

  if (!/^[0-9a-fA-F]{64}$/.test(secret)) {
    return { valid: false, error: 'Backup secret must be valid hexadecimal' }
  }

  return { valid: true }
}

/**
 * Generate a new backup secret
 */
export async function generateBackupSecret(): Promise<string> {
  try {
    const { stdout } = await execAsync('openssl rand -hex 32')
    return stdout.trim()
  } catch (error) {
    console.error('Failed to generate backup secret:', error)
    throw new Error('Failed to generate backup secret')
  }
}

/**
 * Complete backup workflow (backup + encrypt)
 */
export async function createEncryptedBackup(): Promise<BackupResult> {
  try {
    // Step 1: Create backup
    const backupResult = await runBackup()
    if (!backupResult.success || !backupResult.backupPath) {
      return backupResult
    }

    // Step 2: Encrypt backup
    const encryptResult = await encryptBackup(backupResult.backupPath)
    if (!encryptResult.success) {
      return encryptResult
    }

    // Step 3: Get final result
    const backupDir = path.dirname(backupResult.backupPath)
    const metadata = await getBackupMetadata(backupDir)

    return {
      success: true,
      backupPath: backupResult.backupPath,
      encryptedPath: encryptResult.encryptedPath,
      size: metadata?.compressed_size_bytes
    }
  } catch (error) {
    console.error('Encrypted backup workflow failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Clean up decrypted files (security)
 */
export async function cleanupDecryptedFiles(backupPath: string): Promise<void> {
  try {
    const decryptedFile = backupPath.replace('.enc', '')

    try {
      await fs.access(decryptedFile, fs.constants.F_OK)
      await fs.unlink(decryptedFile)
      console.log(`Cleaned up decrypted file: ${decryptedFile}`)
    } catch {
      // File doesn't exist, nothing to clean
    }
  } catch (error) {
    console.error('Failed to cleanup decrypted files:', error)
  }
}