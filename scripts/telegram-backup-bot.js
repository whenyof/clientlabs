#!/usr/bin/env node

/**
 * ClientLabs Backup Control Bot
 * Telegram bot for backup management and monitoring
 */

const https = require('https');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const PROJECT_ROOT = path.join(__dirname, '..');
const BACKUP_DIR = path.join(PROJECT_ROOT, 'backups');
const LOG_FILE = path.join(BACKUP_DIR, 'telegram-bot.log');

// Validate environment
if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID environment variables');
  process.exit(1);
}

// Global state for rollback confirmation
let pendingRollback = null;
let rollbackTimeout = null;

// Logging function
function log(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...data
  };

  console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);

  // Append to log file
  try {
    fs.appendFileSync(LOG_FILE, JSON.stringify(logEntry) + '\n');
  } catch (error) {
    console.error('Failed to write to log file:', error.message);
  }
}

// Telegram API functions
function sendMessage(chatId, text, options = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown',
      ...options
    });

    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (response.ok) {
            resolve(response.result);
          } else {
            reject(new Error(`Telegram API error: ${response.description}`));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Execute shell command with timeout
function executeCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    const timeout = options.timeout || 300000; // 5 minutes default
    const cwd = options.cwd || PROJECT_ROOT;

    log('info', `Executing command: ${command}`, { cwd, timeout });

    const child = exec(command, {
      cwd,
      timeout,
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    }, (error, stdout, stderr) => {
      if (error) {
        if (error.code === 'ETIMEDOUT') {
          reject(new Error(`Command timed out after ${timeout}ms`));
        } else {
          reject(new Error(`Command failed: ${error.message}\nStderr: ${stderr}`));
        }
        return;
      }

      resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
    });
  });
}

// Get backup status
async function getBackupStatus() {
  try {
    // Get local backups
    const localBackups = [];
    if (fs.existsSync(BACKUP_DIR)) {
      const files = fs.readdirSync(BACKUP_DIR);
      const zipFiles = files.filter(f => f.endsWith('.zip')).sort().reverse();
      localBackups.push(...zipFiles.slice(0, 5)); // Last 5
    }

    // Get cloud backups
    const cloudResult = await executeCommand('rclone lsf gdrive-secure:backups/code/ --format "pst"', { timeout: 30000 });
    const cloudLines = cloudResult.stdout.split('\n').filter(line => line.trim());
    const cloudBackups = cloudLines
      .filter(line => line.includes('.zip'))
      .map(line => {
        const parts = line.split(' ');
        const size = parts[0];
        const name = parts.slice(1).join(' ').trim();
        return { name, size };
      })
      .sort((a, b) => b.name.localeCompare(a.name))
      .slice(0, 5); // Last 5

    // Check cron status
    let cronStatus = 'Unknown';
    try {
      const cronResult = await executeCommand('crontab -l | grep auto-backup');
      cronStatus = cronResult.stdout ? 'Active' : 'Inactive';
    } catch (error) {
      cronStatus = 'Error checking cron';
    }

    // Get last backup info
    const lastBackup = cloudBackups.length > 0 ? cloudBackups[0].name : 'No backups found';

    return {
      localBackups,
      cloudBackups,
      cronStatus,
      lastBackup,
      totalCloud: cloudBackups.length
    };
  } catch (error) {
    log('error', 'Failed to get backup status', { error: error.message });
    throw error;
  }
}

// Run backup
async function runBackup(chatId) {
  try {
    log('info', 'Starting manual backup via Telegram', { chatId });

    await sendMessage(chatId, '🔄 *Iniciando backup manual...*\n\nEsto puede tomar varios minutos.');

    const result = await executeCommand('./scripts/auto-backup.sh', { timeout: 600000 }); // 10 minutes

    // Extract backup info from output
    const output = result.stdout + result.stderr;
    const backupMatch = output.match(/📦 Backup: ([^\n]+)/);
    const backupName = backupMatch ? backupMatch[1].replace(/`/g, '') : 'Unknown';

    await sendMessage(chatId, `✅ *Backup completado exitosamente*

📦 Backup: \`${backupName}\`
🕒 ${new Date().toLocaleString('es-ES')}
☁️ Subido a Google Drive

\`\`\`
${output.split('\n').slice(-5).join('\n')}
\`\`\``);

    log('info', 'Manual backup completed', { backupName, chatId });

  } catch (error) {
    log('error', 'Manual backup failed', { error: error.message, chatId });
    await sendMessage(chatId, `❌ *Backup falló*

Error: ${error.message}

Revisa los logs del sistema para más detalles.`);
  }
}

// Handle rollback
async function handleRollback(chatId, backupName) {
  try {
    // Check if backup exists in cloud
    const status = await getBackupStatus();
    const backupExists = status.cloudBackups.some(b => b.name === backupName);

    if (!backupExists) {
      await sendMessage(chatId, `❌ *Backup no encontrado*

El backup \`${backupName}\` no existe en Google Drive.

Usa \`/status\` para ver backups disponibles.`);
      return;
    }

    // Set pending rollback
    pendingRollback = {
      backupName,
      chatId,
      timestamp: Date.now()
    };

    // Clear any existing timeout
    if (rollbackTimeout) {
      clearTimeout(rollbackTimeout);
    }

    // Set timeout for confirmation (5 minutes)
    rollbackTimeout = setTimeout(() => {
      pendingRollback = null;
      log('info', 'Rollback confirmation timeout', { backupName });
    }, 5 * 60 * 1000);

    await sendMessage(chatId, `⚠️ *CONFIRMACIÓN REQUERIDA*

Estás a punto de restaurar el backup:
\`${backupName}\`

❌ *Esto SOBRESCRIBIRÁ todos los archivos actuales*

Para confirmar, envía: \`/confirm\`

*Esta confirmación expira en 5 minutos.*`);

  } catch (error) {
    log('error', 'Rollback check failed', { error: error.message });
    await sendMessage(chatId, `❌ *Error verificando backup*

${error.message}`);
  }
}

// Execute confirmed rollback
async function executeRollback(chatId) {
  if (!pendingRollback || pendingRollback.chatId !== chatId) {
    await sendMessage(chatId, '❌ *No hay rollback pendiente de confirmación*');
    return;
  }

  const { backupName } = pendingRollback;
  pendingRollback = null;

  if (rollbackTimeout) {
    clearTimeout(rollbackTimeout);
    rollbackTimeout = null;
  }

  try {
    log('info', 'Starting rollback', { backupName, chatId });

    await sendMessage(chatId, `🔄 *Iniciando rollback...*

Backup: \`${backupName}\`
⚠️ *Esto sobrescribirá archivos actuales*

El proceso puede tomar varios minutos...`);

    // Execute rollback
    const result = await executeCommand(`./scripts/restore-backup.sh --auto "${backupName}"`, {
      timeout: 900000 // 15 minutes
    });

    await sendMessage(chatId, `✅ *Rollback completado exitosamente*

📦 Backup restaurado: \`${backupName}\`
🕒 ${new Date().toLocaleString('es-ES')}

*El proyecto ha sido restaurado. Verifica que todo funciona correctamente.*`);

    log('info', 'Rollback completed successfully', { backupName, chatId });

  } catch (error) {
    log('error', 'Rollback failed', { error: error.message, backupName, chatId });
    await sendMessage(chatId, `❌ *Rollback falló*

Backup: \`${backupName}\`
Error: ${error.message}

Los archivos originales NO han sido modificados.`);
  }
}

// Handle incoming messages
async function handleMessage(message) {
  const chatId = message.chat.id;
  const text = message.text?.trim();

  // Validate chat ID
  if (chatId.toString() !== TELEGRAM_CHAT_ID) {
    log('warning', 'Unauthorized access attempt', { chatId, text });
    return;
  }

  log('info', 'Received command', { chatId, command: text });

  try {
    if (text === '/start' || text === '/help') {
      await sendMessage(chatId, `*🤖 ClientLabs Backup Bot*

Comandos disponibles:

🔄 \`/backup\` - Ejecutar backup manual
📊 \`/status\` - Ver estado del sistema
🔙 \`/rollback <backup_name>\` - Restaurar backup
✅ \`/confirm\` - Confirmar rollback pendiente

*Ejemplos:*
• \`/status\`
• \`/rollback backup_2026-01-22_03-00-01.zip\`
• \`/confirm\`

⚠️ *Solo funciona en chat autorizado*`);

    } else if (text === '/backup') {
      await runBackup(chatId);

    } else if (text === '/status') {
      const status = await getBackupStatus();

      let statusMessage = `*📊 Estado del Sistema de Backups*

🖥️ *Backups locales:* ${status.localBackups.length}
`;
      if (status.localBackups.length > 0) {
        statusMessage += status.localBackups.map(b => `  • ${b}`).join('\n');
      } else {
        statusMessage += '  (ninguno)';
      }

      statusMessage += `

☁️ *Backups en Drive:* ${status.totalCloud}
`;
      if (status.cloudBackups.length > 0) {
        statusMessage += status.cloudBackups.map(b => `  • ${b.name} (${b.size})`).join('\n');
      } else {
        statusMessage += '  (ninguno)';
      }

      statusMessage += `

⏰ *Último backup:* ${status.lastBackup}
🔄 *Cron status:* ${status.cronStatus}

🕒 ${new Date().toLocaleString('es-ES')}`;

      await sendMessage(chatId, statusMessage);

    } else if (text?.startsWith('/rollback ')) {
      const backupName = text.substring(10).trim();
      if (!backupName) {
        await sendMessage(chatId, '❌ *Formato incorrecto*

Uso: \`/rollback backup_2026-01-22_03-00-01.zip\`');
        return;
      }
      await handleRollback(chatId, backupName);

    } else if (text === '/confirm') {
      await executeRollback(chatId);

    } else {
      await sendMessage(chatId, '❓ *Comando no reconocido*

Usa \`/help\` para ver comandos disponibles.');
    }

  } catch (error) {
    log('error', 'Command execution failed', { error: error.message, command: text });
    await sendMessage(chatId, `❌ *Error procesando comando*

\`${text}\`

Error: ${error.message}

Contacta al administrador del sistema.`);
  }
}

// Main polling loop
async function startPolling() {
  log('info', 'Starting Telegram backup bot');

  let offset = 0;

  while (true) {
    try {
      // Get updates
      const updatesUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${offset}&timeout=30`;

      const updates = await new Promise((resolve, reject) => {
        https.get(updatesUrl, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (error) {
              reject(error);
            }
          });
        }).on('error', reject);
      });

      if (updates.ok && updates.result.length > 0) {
        for (const update of updates.result) {
          if (update.message) {
            await handleMessage(update.message);
          }
          offset = update.update_id + 1;
        }
      }

      // Small delay to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      log('error', 'Polling error', { error: error.message });
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  log('info', 'Shutting down Telegram backup bot');
  if (rollbackTimeout) {
    clearTimeout(rollbackTimeout);
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('info', 'Received SIGTERM, shutting down');
  if (rollbackTimeout) {
    clearTimeout(rollbackTimeout);
  }
  process.exit(0);
});

// Start the bot
startPolling().catch((error) => {
  log('error', 'Fatal error in Telegram bot', { error: error.message });
  process.exit(1);
});