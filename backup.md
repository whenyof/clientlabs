# 🛡️ ClientLabs Database Backup & Recovery Guide

## 📋 Table of Contents

1. [What is a Database Backup?](#what-is-a-database-backup)
2. [Backup Storage & Organization](#backup-storage--organization)
3. [Manual Backup Execution](#manual-backup-execution)
4. [Automated Backups Setup](#automated-backups-setup)
5. [Database Restoration](#database-restoration)
6. [Real-world Examples](#real-world-examples)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)
9. [Production Checklist](#production-checklist)
10. [Git vs Database Backups](#git-vs-database-backups)

---

## 🤔 What is a Database Backup?

A **database backup** is a copy of your database's data and structure at a specific point in time. Unlike Git (which tracks code changes), backups preserve your application's **live data** - user accounts, transactions, leads, etc.

### Why You Need Backups

- **Data Loss Prevention**: Hardware failures, accidental deletions, cyber attacks
- **Recovery Point**: Restore to a known good state after incidents
- **Compliance**: Legal requirements for data retention
- **Testing**: Safe environment for testing with real data

### What Gets Backed Up

- ✅ All table data (users, leads, transactions, etc.)
- ✅ Database schema and constraints
- ✅ Indexes and performance optimizations
- ✅ Sequences and auto-increment values
- ❌ Environment configuration (handled by your `.env` files)
- ❌ Application code (handled by Git)

---

## 📁 Backup Storage & Organization

### Directory Structure

```
backups/
├── 2024-01-15_03-00-01/          # Backup timestamp
│   ├── backup.sql.gz            # Compressed backup
│   ├── metadata.json            # Backup information
│   └── verification.log         # Integrity check
├── 2024-01-16_03-00-01/
│   └── ...
├── backup.log                   # Operation logs
├── cron.log                     # Automated backup logs
└── rollback.log                 # Restoration logs
```

### File Naming Convention

- **Format**: `YYYY-MM-DD_HH-MM-SS`
- **Example**: `2024-01-15_03-00-01`
- **Why**: Chronological sorting, easy identification

### Retention Policy

- **Automatic Cleanup**: Backups older than 30 days are deleted
- **Manual Retention**: Important backups can be archived separately
- **Storage Estimation**: ~10MB per backup (compressed)

---

## 🚀 Manual Backup Execution

### Quick Backup

```bash
# Navigate to project root
cd /path/to/clientlabs

# Run backup script
bash scripts/backups/backup-db.sh
```

### Dry Run (Testing)

```bash
# Test without creating actual backup
bash scripts/backups/backup-db.sh --dry-run
```

### Expected Output

```bash
✅ Backup completed successfully!
📁 Location: backups/2024-01-15_03-00-01
📊 Size: 8.5MB
📝 Logs: backups/backup.log
```

### Verification

Check the backup was created:

```bash
ls -la backups/
# Should see: 2024-01-15_03-00-01/

# Verify backup integrity
gunzip -c backups/2024-01-15_03-00-01/backup.sql.gz | head -5
# Should show: -- PostgreSQL database dump
```

---

## ⏰ Automated Backups Setup

### Daily Automatic Backups

```bash
# Setup cron job (runs at 3:00 AM daily)
bash scripts/setup-cron.sh

# Expected output:
✅ Cron job setup completed successfully!
⏰ Backup schedule: Daily at 3:00 AM (server time)
```

### Verify Cron Setup

```bash
# Check if cron job is active
crontab -l | grep ClientLabs

# Monitor backup logs
tail -f backups/cron.log
```

### Remove Automatic Backups

```bash
# Remove cron job
bash scripts/setup-cron.sh remove
```

### Testing Cron Setup

```bash
# Test backup script without setting up cron
bash scripts/setup-cron.sh test
```

---

## 🔄 Database Restoration

### List Available Backups

```bash
# Navigate to project root
cd /path/to/clientlabs

# List all backups
bash scripts/rollback-db.sh
```

**Sample Output:**
```
Available backups:

ID  Date/Time              Size       Environment  Name
--- ------------------------ ------------------- ------------ ------------
1   2024-01-15 03:00:01     8.5MB     development   2024-01-15_03-00-01
2   2024-01-14 03:00:01     8.3MB     development   2024-01-14_03-00-01
3   2024-01-13 03:00:01     8.1MB     development   2024-01-13_03-00-01
```

### Restore from Backup

```bash
# Restore backup with ID 1
bash scripts/rollback-db.sh 1
```

**Safety Confirmations:**
```
⚠️  DANGER ZONE
You are about to restore the database from backup:
  Backup: 2024-01-15_03-00-01
  Environment: development

Type 'RESTORE' to confirm: RESTORE
```

### Production Restoration

```bash
# Force restore in production (requires --force)
bash scripts/rollback-db.sh --force 1
```

### Post-Restore Verification

```bash
# Check database connection
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM users;"

# Verify application functionality
npm run dev
# Visit your app and check key features
```

---

## 💡 Real-world Examples

### Scenario 1: Accidental Data Deletion

**Problem**: Developer accidentally deletes all leads during testing.

**Solution**:
```bash
# 1. Stop the application
pm2 stop clientlabs

# 2. Restore from yesterday's backup
bash scripts/rollback-db.sh 1

# 3. Restart application
pm2 restart clientlabs

# 4. Verify data integrity
# Check that leads are restored
```

### Scenario 2: Corrupted Migration

**Problem**: A database migration corrupts user data.

**Solution**:
```bash
# 1. Create emergency backup
bash scripts/backups/backup-db.sh

# 2. Roll back to pre-migration backup
bash scripts/rollback-db.sh --force 2

# 3. Fix migration script
# 4. Re-run migrations
npx prisma migrate dev
```

### Scenario 3: Production Data Recovery

**Problem**: Cyber attack corrupts production database.

**Solution**:
```bash
# 1. Scale down application
kubectl scale deployment clientlabs --replicas=0

# 2. Restore from latest backup
bash scripts/rollback-db.sh --force 1

# 3. Verify data integrity
# 4. Scale up application
kubectl scale deployment clientlabs --replicas=3

# 5. Notify users about temporary downtime
```

---

## 🔧 Troubleshooting

### Backup Fails

**Error**: `Cannot connect to database`

```bash
# Check database URL
cat .env.local | grep DATABASE_URL

# Test connection manually
psql "$DATABASE_URL" -c "SELECT 1;"

# Verify PostgreSQL is running
brew services list | grep postgres
```

**Error**: `Permission denied`

```bash
# Make scripts executable
chmod +x scripts/backups/backup-db.sh
chmod +x scripts/rollback-db.sh
```

### Restore Fails

**Error**: `Backup verification failed`

```bash
# Check if backup file is corrupted
gunzip -t backups/2024-01-15_03-00-01/backup.sql.gz

# If corrupted, try previous backup
bash scripts/rollback-db.sh 2
```

**Error**: `Production environment detected`

```bash
# Use force flag for production
bash scripts/rollback-db.sh --force 1
```

### Cron Issues

**Problem**: Backups not running automatically

```bash
# Check cron is running
brew services list | grep cron

# Check cron jobs
crontab -l

# Test backup script manually
bash scripts/backups/backup-db.sh --dry-run
```

**Problem**: Cron logs show errors

```bash
# Check cron logs
tail -f backups/cron.log

# Common issue: PATH not set in cron
# Edit crontab to include full paths
crontab -e
```

---

## 📋 Best Practices

### Backup Strategy

- **Daily Backups**: Capture business changes
- **Before Deployments**: Backup before schema changes
- **Off-site Storage**: Consider cloud storage for critical backups
- **Test Restorations**: Regularly test restore procedures

### Security

- **Environment Variables**: Never commit database credentials
- **Access Control**: Limit who can run backup/restore operations
- **Encryption**: Consider encrypting sensitive backup data
- **Network Security**: Use SSL for database connections

### Monitoring

- **Log Analysis**: Regularly review backup logs
- **Alerting**: Set up alerts for backup failures
- **Storage Monitoring**: Monitor backup storage usage
- **Performance Impact**: Schedule backups during low-traffic periods

### Documentation

- **Runbook**: Keep disaster recovery procedures updated
- **Contact List**: Maintain list of stakeholders for incidents
- **Change Log**: Document all backup/recovery operations
- **Testing Records**: Keep records of successful restore tests

---

## ✅ Production Checklist

### Pre-deployment

- [ ] Backup scripts are executable (`chmod +x`)
- [ ] Environment variables are configured
- [ ] Database connectivity is tested
- [ ] Backup directory has proper permissions
- [ ] Cron job is configured (if using automation)

### Post-deployment

- [ ] First backup runs successfully
- [ ] Backup logs are monitored
- [ ] Restore procedure is tested (on staging)
- [ ] Team members know backup locations
- [ ] Emergency contacts are documented

### Monitoring

- [ ] Backup success notifications are configured
- [ ] Storage usage is monitored
- [ ] Old backup cleanup is working
- [ ] Log rotation is configured

### Security

- [ ] Database credentials are in environment variables
- [ ] Backup files are not publicly accessible
- [ ] Restore operations require proper authorization
- [ ] SSL is enabled for database connections

---

## 🔄 Git vs Database Backups

| Aspect | Git | Database Backup |
|--------|-----|-----------------|
| **What it saves** | Code, config, schema | Live data, transactions |
| **Purpose** | Version control, collaboration | Data recovery, compliance |
| **Frequency** | Per commit/change | Daily/hourly as needed |
| **Recovery** | Revert code changes | Restore data to point-in-time |
| **Scope** | Development artifacts | Production data |
| **Storage** | Git repository | File system/cloud storage |
| **Retention** | Indefinite | Configurable (30 days default) |

### When to Use Each

**Use Git when:**
- Rolling back code changes
- Managing different environments
- Collaborating on development
- Tracking configuration changes

**Use Database Backups when:**
- Recovering from data loss
- Restoring after incidents
- Compliance requirements
- Testing with production data
- Disaster recovery

---

## 📞 Support & Emergency Contacts

### Emergency Procedures

1. **Stop the application** to prevent further data corruption
2. **Create emergency backup** if possible
3. **Identify restore point** from backup list
4. **Perform restore** with appropriate flags
5. **Verify application functionality**
6. **Notify stakeholders**

### Contact Information

- **Lead Developer**: [Your Name] - [email/phone]
- **DevOps Engineer**: [Name] - [email/phone]
- **Database Admin**: [Name] - [email/phone]
- **Infrastructure Team**: [Slack Channel] - [Phone Number]

### Incident Response

For data-related emergencies:
1. Assess the situation
2. Create incident ticket
3. Follow disaster recovery runbook
4. Communicate with stakeholders
5. Document lessons learned

---

*This document is maintained by the ClientLabs DevOps team. Last updated: January 2025*

---

## 📚 Additional Resources

- [PostgreSQL Backup Documentation](https://www.postgresql.org/docs/current/backup.html)
- [Prisma Migrate Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Database Disaster Recovery Best Practices](https://www.postgresql.org/docs/current/different-replication-solutions.html)

---

*Remember: **Backups are your safety net**. Regular testing and proper procedures are essential for reliable disaster recovery.*