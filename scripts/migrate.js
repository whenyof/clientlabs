const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function runMigrations() {
  console.log('🚀 Running CRM database migrations...')

  try {
    // Create enum types if they don't exist
    console.log('Creating enum types...')

    // LeadSource enum
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "LeadSource" AS ENUM('Web', 'Ads', 'Referral', 'Partner', 'Outbound', 'Social', 'Email', 'Other');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `

    // LeadStatus enum (if not exists)
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "LeadStatus" AS ENUM('hot', 'warm', 'cold');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `

    console.log('Creating tables...')

    // Create Activity table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Activity" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "leadId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "metadata" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
      );
    `

    // Create LeadScore table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "LeadScore" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "leadId" TEXT NOT NULL,
        "score" INTEGER NOT NULL,
        "rule" TEXT NOT NULL,
        "points" INTEGER NOT NULL,
        "metadata" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "LeadScore_pkey" PRIMARY KEY ("id")
      );
    `

    // Create PipelineStage table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "PipelineStage" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "order" INTEGER NOT NULL,
        "color" TEXT NOT NULL DEFAULT '#6366f1',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "PipelineStage_pkey" PRIMARY KEY ("id")
      );
    `

    // Create Automation table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Automation" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "trigger" JSONB NOT NULL,
        "actions" JSONB NOT NULL,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "Automation_pkey" PRIMARY KEY ("id")
      );
    `

    // Create AutomationLog table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "AutomationLog" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "automationId" TEXT NOT NULL,
        "leadId" TEXT,
        "action" TEXT NOT NULL,
        "result" TEXT NOT NULL,
        "error" TEXT,
        "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "AutomationLog_pkey" PRIMARY KEY ("id")
      );
    `

    // Create AiInsight table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "AiInsight" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "leadId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "confidence" DECIMAL(65,30) NOT NULL DEFAULT 0.5,
        "metadata" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "AiInsight_pkey" PRIMARY KEY ("id")
      );
    `

    // Add stageId column to Lead table if it doesn't exist
    await prisma.$executeRaw`
      ALTER TABLE "Lead"
      ADD COLUMN IF NOT EXISTS "stageId" TEXT;
    `

    console.log('Creating indexes...')

    // Create indexes
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Activity_userId_idx" ON "Activity"("userId");
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Activity_leadId_idx" ON "Activity"("leadId");
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Activity_createdAt_idx" ON "Activity"("createdAt");
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Activity_type_idx" ON "Activity"("type");
    `

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "LeadScore_userId_idx" ON "LeadScore"("userId");
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "LeadScore_leadId_idx" ON "LeadScore"("leadId");
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "LeadScore_createdAt_idx" ON "LeadScore"("createdAt");
    `

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "PipelineStage_userId_idx" ON "PipelineStage"("userId");
    `
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "PipelineStage_userId_order_key" ON "PipelineStage"("userId", "order");
    `

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Automation_userId_idx" ON "Automation"("userId");
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Automation_active_idx" ON "Automation"("active");
    `

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "AutomationLog_userId_idx" ON "AutomationLog"("userId");
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "AutomationLog_automationId_idx" ON "AutomationLog"("automationId");
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "AutomationLog_leadId_idx" ON "AutomationLog"("leadId");
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "AutomationLog_executedAt_idx" ON "AutomationLog"("executedAt");
    `

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "AiInsight_userId_idx" ON "AiInsight"("userId");
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "AiInsight_leadId_idx" ON "AiInsight"("leadId");
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "AiInsight_type_idx" ON "AiInsight"("type");
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "AiInsight_createdAt_idx" ON "AiInsight"("createdAt");
    `

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Lead_stageId_idx" ON "Lead"("stageId");
    `

    console.log('✅ CRM database migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

runMigrations()