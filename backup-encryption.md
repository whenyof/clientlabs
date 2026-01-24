# 🔐 ClientLabs Encrypted Backup System

## 📋 Table of Contents

1. [Overview](#overview)
2. [Security Architecture](#security-architecture)
3. [Quick Start](#quick-start)
4. [Manual Backup Process](#manual-backup-process)
5. [Automated Backups](#automated-backups)
6. [Encryption Details](#encryption-details)
7. [Restore Process](#restore-process)
8. [API Integration](#api-integration)
9. [Admin Dashboard](#admin-dashboard)
10. [Troubleshooting](#troubleshooting)
11. [Security Best Practices](#security-best-practices)
12. [Emergency Procedures](#emergency-procedures)

---

## 🔍 Overview

The ClientLabs Encrypted Backup System provides **enterprise-grade database backups** with **AES-256 encryption** for maximum security. All backups are encrypted at rest and require proper authentication for decryption.

### Key Features

- ✅ **AES-256-CBC Encryption** with PBKDF2 key derivation
- ✅ **PostgreSQL & MySQL Support** (configurable)
- ✅ **Automatic Cleanup** (30-day retention)
- ✅ **Admin API Integration** for automated backups
- ✅ **Secure Key Management** via environment variables
- ✅ **Production Safety** measures
- ✅ **Comprehensive Logging** and monitoring

### Architecture

```
User Request → Backup Script → Encryption → Secure Storage
                                      ↓
                              Admin Dashboard ← API ← Automation
```

---

## 🛡️ Security Architecture

### Encryption Details

- **Algorithm**: AES-256-CBC (Advanced Encryption Standard)
- **Key Derivation**: PBKDF2 with 10,000 iterations
- **Salt**: Random 8-byte salt per encryption
- **Key Length**: 256-bit (32 bytes)
- **Key Format**: 64-character hexadecimal string

### Key Management

```bash
# Generate secure backup key
openssl rand -hex 32

# Example output: a1b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef

# Add to .env file
BACKUP_SECRET=a1b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef
```

### Security Layers

1. **Environment Protection**: Keys stored in secure environment variables
2. **Production Safety**: Extra confirmations in production environment
3. **File Security**: Unencrypted files automatically deleted
4. **Access Control**: Admin-only API endpoints
5. **Audit Logging**: All operations logged with timestamps

---

## 🚀 Quick Start

### 1. Configure Environment

```bash
# Add to your .env file
BACKUP_SECRET=your-64-character-hex-key-here

# Generate a new key
BACKUP_SECRET=$(openssl rand -hex 32)
echo "BACKUP_SECRET=$BACKUP_SECRET" >> .env
```

### 2. Make Scripts Executable

```bash
chmod +x scripts/backup.sh
chmod +x scripts/encrypt.sh
chmod +x scripts/decrypt.sh
chmod +x scripts/setup-cron.sh
```

### 3. Create Your First Encrypted Backup

```bash
# Create backup
bash scripts/backup.sh

# Encrypt it (uses latest backup automatically)
bash scripts/encrypt.sh

# Verify
ls -la backups/
# Should see: [timestamp]/backup.sql.gz.enc
```

### 4. Setup Automation (Optional)

```bash
# Setup daily automated backups
bash scripts/setup-cron.sh
```

---

## 🔧 Manual Backup Process

### Step 1: Create Backup

```bash
bash scripts/backup.sh
```

**Output:**
```bash
=== Starting ClientLabs Database Backup ===
✅ Backup completed successfully!
📁 Location: backups/2024-01-15_03-00-01
📊 Size: 8.5MB
🔒 Next: Run encryption script
```

### Step 2: Encrypt Backup

```bash
# Encrypt latest backup
bash scripts/encrypt.sh

# Or encrypt specific backup
bash scripts/encrypt.sh backups/2024-01-15_03-00-01
```

**Output:**
```bash
=== Starting ClientLabs Backup Encryption ===
✅ Encryption completed successfully!
🔐 Algorithm: AES-256-CBC
📁 Encrypted file: backups/2024-01-15_03-00-01/backup.sql.gz.enc
🗑️  Unencrypted file: REMOVED
```

### Step 3: Verify Encryption

```bash
# Check encrypted file exists
ls -la backups/2024-01-15_03-00-01/
# backup.sql.gz.enc  encryption.json  metadata.json

# Verify encryption (should show gibberish)
head -c 100 backups/2024-01-15_03-00-01/backup.sql.gz.enc | xxd
```

---

## ⏰ Automated Backups

### Daily Cron Setup

```bash
bash scripts/setup-cron.sh
```

This creates a cron job that runs:
1. `backup.sh` - Creates database backup
2. `encrypt.sh` - Encrypts the backup
3. Cleans up old backups (>30 days)

### Cron Configuration

The script adds this to your crontab:
```bash
0 3 * * * cd /path/to/clientlabs && bash scripts/backup.sh && bash scripts/encrypt.sh
```

### Monitor Automated Backups

```bash
# Check cron is running
crontab -l | grep ClientLabs

# View backup logs
tail -f backups/cron.log

# Check backup creation
ls -la backups/ | grep "$(date '+%Y-%m-%d')"
```

### Remove Automation

```bash
bash scripts/setup-cron.sh remove
```

---

## 🔐 Encryption Details

### Technical Specifications

- **Cipher**: AES-256-CBC
- **Key Derivation**: PBKDF2
- **Iterations**: 10,000
- **Salt**: Random 8-byte per encryption
- **IV**: Generated from password and salt

### Encryption Process

1. **Key Derivation**: PBKDF2 transforms password into 256-bit key
2. **Salt Generation**: Random salt added for uniqueness
3. **File Encryption**: AES-256-CBC encryption with derived key
4. **Metadata Storage**: Encryption parameters saved separately

### Files Created

```
backup-directory/
├── backup.sql.gz.enc     # Encrypted backup (secure)
├── encryption.json       # Encryption metadata
├── metadata.json         # Backup information
└── (no unencrypted files)
```

### Encryption Metadata

```json
{
  "encryption_timestamp": "2024-01-15T03:00:01Z",
  "algorithm": "AES-256-CBC",
  "key_derivation": "PBKDF2",
  "iterations": 10000,
  "original_file": "backup.sql.gz",
  "encrypted_file": "backup.sql.gz.enc"
}
```

---

## 🔄 Restore Process

### Emergency Restore

**⚠️ WARNING: This will REPLACE your current database!**

```bash
# 1. Decrypt backup
bash scripts/decrypt.sh

# 2. Restore database
bash scripts/rollback-db.sh [decrypted-backup-directory]

# 3. Clean up decrypted files
rm backups/[timestamp]/backup.sql.gz
```

### Detailed Restore Steps

#### Step 1: Decrypt Backup

```bash
# Decrypt latest encrypted backup
bash scripts/decrypt.sh
```

**Output:**
```bash
=== Starting ClientLabs Backup Decryption ===
Enter decryption password (64-character hex key): [paste-your-key]
✅ Decryption completed successfully!
📁 Decrypted file: backups/2024-01-15_03-00-01/backup.sql.gz
🗄️  Ready for: bash scripts/rollback-db.sh backups/2024-01-15_03-00-01
```

#### Step 2: Restore Database

```bash
# List available backups
bash scripts/rollback-db.sh

# Select backup 1 and restore
echo "RESTORE" | bash scripts/rollback-db.sh 1
```

#### Step 3: Verify Restore

```bash
# Check database connection
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM users;"

# Verify application works
npm run dev
```

---

## 🌐 API Integration

### Create Encrypted Backup via API

```bash
# Admin-only endpoint
curl -X POST http://localhost:3000/api/admin/backup \
  -H "Authorization: Bearer your-admin-token"
```

**Response:**
```json
{
  "success": true,
  "backup": {
    "path": "backups/2024-01-15_03-00-01",
    "encryptedPath": "backups/2024-01-15_03-00-01/backup.sql.gz.enc",
    "size": 8500000
  },
  "message": "Backup created and encrypted successfully"
}
```

### Get Backup Logs via API

```bash
curl http://localhost:3000/api/admin/backup \
  -H "Authorization: Bearer your-admin-token"
```

### Node.js Integration

```typescript
import { createEncryptedBackup, getBackupLogs } from '@/lib/backup'

// Create backup programmatically
const result = await createEncryptedBackup()

// Get backup history
const logs = await getBackupLogs()
```

---

## 👨‍💼 Admin Dashboard

### Access Admin Panel

Navigate to: `/dashboard/admin/backups`

### Features Available

#### 📊 **Backup Statistics**
- Total backups created
- Encrypted backups count
- Storage usage
- Last backup timestamp

#### ⚡ **Quick Actions**
- Create new encrypted backup
- Download latest backup
- Verify backup integrity
- Clean old backups

#### 📋 **Backup List**
- View all backups with status
- Filter by encryption status
- Download specific backups
- View backup details

#### ⚙️ **Settings Panel**
- Configure encryption key
- Setup automation preferences
- Emergency restore options

### Security Features

- **Admin Authentication Required**
- **Audit Logging** of all admin actions
- **Secure Key Management** (never displayed in UI)
- **Production Confirmations** for destructive actions

---

## 🔧 Troubleshooting

### Backup Fails

**Error**: `Cannot connect to database`

```bash
# Check DATABASE_URL
cat .env | grep DATABASE_URL

# Test connection manually
psql "$DATABASE_URL" -c "SELECT 1;"

# Check PostgreSQL is running
brew services list | grep postgres
```

**Error**: `BACKUP_SECRET not found`

```bash
# Generate and add key
BACKUP_SECRET=$(openssl rand -hex 32)
echo "BACKUP_SECRET=$BACKUP_SECRET" >> .env

# Restart application
npm run dev
```

### Encryption Fails

**Error**: `Invalid key length`

```bash
# Must be exactly 64 hex characters (32 bytes)
openssl rand -hex 32  # Correct
openssl rand -hex 16  # Too short
```

**Error**: `Permission denied`

```bash
# Make scripts executable
chmod +x scripts/encrypt.sh scripts/decrypt.sh
```

### Decryption Fails

**Error**: `bad decrypt`

Possible causes:
- Wrong password/key
- Corrupted encrypted file
- File not encrypted with this system

```bash
# Verify file is encrypted
file backups/2024-01-15_03-00-01/backup.sql.gz.enc
# Should show: data (not recognized as SQL)
```

### Restore Fails

**Error**: `Backup verification failed`

```bash
# Check if backup file is corrupted
gunzip -t backups/2024-01-15_03-00-01/backup.sql.gz

# Try different backup
bash scripts/rollback-db.sh 2
```

---

## 🔒 Security Best Practices

### Key Management

- **Never commit keys** to version control
- **Use different keys** for different environments
- **Rotate keys regularly** (every 6-12 months)
- **Backup keys securely** (separate from backups)
- **Use hardware security modules** for production

### Access Control

- **Limit admin access** to backup operations
- **Use strong passwords** for admin accounts
- **Enable 2FA** for admin users
- **Log all admin actions** for audit trails

### Network Security

- **Use SSL/TLS** for database connections
- **Encrypt data in transit** and at rest
- **Firewall restrictions** on database ports
- **VPN access** for admin operations

### Backup Security

- **Encrypt all backups** before storage
- **Use secure storage** (encrypted drives, cloud with encryption)
- **Test restores regularly** (quarterly minimum)
- **Monitor backup success** with alerts
- **Version control** your backup scripts

### Emergency Preparedness

- **Document restore procedures** clearly
- **Test disaster scenarios** regularly
- **Maintain backup contact lists**
- **Have offline backup access** methods
- **Plan for various failure scenarios**

---

## 🚨 Emergency Procedures

### Complete Data Loss Scenario

1. **Stop all services** to prevent further data corruption
2. **Assess damage** - determine what data is lost
3. **Identify restore point** - choose most recent valid backup
4. **Prepare environment** - ensure backup scripts work
5. **Decrypt backup** - use proper decryption key
6. **Restore database** - follow restore procedures
7. **Verify integrity** - check application functionality
8. **Resume operations** - bring services back online
9. **Document incident** - update runbooks and procedures

### Rapid Response Checklist

- [ ] **Stop application** (`pm2 stop clientlabs`)
- [ ] **Confirm backup availability** (`ls backups/`)
- [ ] **Decrypt latest backup** (`bash scripts/decrypt.sh`)
- [ ] **Backup current state** (if possible)
- [ ] **Restore database** (`bash scripts/rollback-db.sh 1`)
- [ ] **Verify application** (`npm run dev`)
- [ ] **Resume services** (`pm2 restart clientlabs`)
- [ ] **Notify stakeholders** (email/Slack alerts)
- [ ] **Document lessons learned**

### Communication Plan

**Internal Communication:**
- DevOps team notification
- Incident response team activation
- Status updates every 15 minutes

**External Communication:**
- Customer-facing status page updates
- Email notifications for service disruptions
- Social media updates if major incident

### Recovery Time Objectives

- **RTO (Recovery Time Objective)**: 1 hour
- **RPO (Recovery Point Objective)**: 1 hour (backup frequency)
- **Data Loss Tolerance**: Maximum 1 hour of data

---

## 📚 Additional Resources

### Tools & Dependencies

- **OpenSSL**: For encryption/decryption operations
- **PostgreSQL/MySQL clients**: For database operations
- **cron**: For automated backup scheduling
- **AWS CLI**: For cloud storage integration

### File Locations

```
/backups/                          # Backup storage root
├── 2024-01-15_03-00-01/          # Individual backup directory
│   ├── backup.sql.gz.enc         # Encrypted backup (secure)
│   ├── encryption.json           # Encryption metadata
│   ├── metadata.json             # Backup information
│   └── decryption.json           # Decryption logs (after decrypt)
├── backup.log                    # Backup operation logs
├── encrypt.log                   # Encryption operation logs
├── decrypt.log                   # Decryption operation logs
└── backup-log.json              # Backup history index
```

### Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:pass@host:5432/dbname
BACKUP_SECRET=64-character-hex-key

# Optional
S3_BACKUP_BUCKET=clientlabs-backups
AWS_REGION=us-east-1
S3_BACKUP_PREFIX=database
```

### API Endpoints

- `POST /api/admin/backup` - Create encrypted backup
- `GET /api/admin/backup` - List backup logs

### Script Permissions

```bash
chmod +x scripts/backup.sh
chmod +x scripts/encrypt.sh
chmod +x scripts/decrypt.sh
chmod +x scripts/setup-cron.sh
chmod +x scripts/test-backup-system.sh
```

---

*This encrypted backup system provides **enterprise-grade security** with **military-strength encryption**. Regular testing and proper key management are essential for reliable disaster recovery.*

**Remember: Your data is only as secure as your backup encryption keys! 🔐**