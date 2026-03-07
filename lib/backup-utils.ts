/**
 * Client-safe backup utilities (no Node.js APIs)
 */

export interface BackupLogEntry {
  id: string
  timestamp: string
  status: 'unencrypted' | 'encrypted' | 'error'
  size: number
  path: string
  metadata: {
    timestamp: string
    environment: string
    database_type: string
    database_name: string
    backup_size_bytes: number
    compressed_size_bytes: number
    compression_ratio: number
    status: 'unencrypted' | 'encrypted'
  }
}

/**
 * Validate backup secret key (client-safe)
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
 * Generate a random backup secret (client-side fallback)
 */
export function generateBackupSecretClient(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}