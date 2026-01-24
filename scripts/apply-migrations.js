const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function applyMigrations() {
  console.log('🚀 Applying CRM database migrations...')

  try {
    // Add role column to User table
    console.log('Adding role column to User table...')
    await prisma.$executeRaw`
      ALTER TABLE "User"
      ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'ADMIN';
    `

    // Update existing users to have ADMIN role
    await prisma.$executeRaw`
      UPDATE "User" SET "role" = 'ADMIN' WHERE "role" IS NULL;
    `

    // Add stageId column to Lead table
    console.log('Adding stageId column to Lead table...')
    await prisma.$executeRaw`
      ALTER TABLE "Lead"
      ADD COLUMN IF NOT EXISTS "stageId" TEXT;
    `

    // Add index for stageId
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Lead_stageId_idx" ON "Lead"("stageId");
    `

    console.log('✅ Migrations applied successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

applyMigrations()