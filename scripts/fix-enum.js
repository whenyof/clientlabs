const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixEnum() {
  console.log('🔧 Converting enum to string type...')

  try {
    // Drop the enum constraint and change to text
    await prisma.$executeRaw`
      ALTER TABLE "User" ALTER COLUMN "plan" TYPE TEXT;
    `

    // Update enum values to string values
    await prisma.$executeRaw`
      UPDATE "User" SET "plan" = 'TRIAL' WHERE "plan" = 'TRIAL';
    `
    await prisma.$executeRaw`
      UPDATE "User" SET "plan" = 'STARTER' WHERE "plan" = 'STARTER';
    `
    await prisma.$executeRaw`
      UPDATE "User" SET "plan" = 'PRO' WHERE "plan" = 'PRO';
    `

    console.log('✅ Enum conversion completed!')
  } catch (error) {
    console.error('❌ Enum conversion failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

fixEnum()