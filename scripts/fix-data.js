const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixData() {
  console.log('🔧 Fixing database data for schema changes...')

  try {
    // Convert enum values to strings
    console.log('Converting plan enum values to strings...')
    await prisma.$executeRaw`
      UPDATE "User" SET "plan" = 'TRIAL' WHERE "plan"::text = 'TRIAL';
    `
    await prisma.$executeRaw`
      UPDATE "User" SET "plan" = 'STARTER' WHERE "plan"::text = 'STARTER';
    `
    await prisma.$executeRaw`
      UPDATE "User" SET "plan" = 'PRO' WHERE "plan"::text = 'PRO';
    `

    console.log('✅ Data conversion completed!')
  } catch (error) {
    console.error('❌ Data conversion failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

fixData()