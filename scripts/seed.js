const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedDatabase() {
  console.log('🌱 Starting database seeding...')

  try {
    // Get the first user from the database (you should replace this with actual user logic)
    const user = await prisma.user.findFirst()
    if (!user) {
      console.log('❌ No users found in database. Please create a user first.')
      return
    }

    console.log(`Creating pipeline stages for user: ${user.id}`)

    // Create default pipeline stages
    const stages = [
      {
        name: 'New',
        order: 0,
        color: '#6366f1',
      },
      {
        name: 'Contacted',
        order: 1,
        color: '#f59e0b',
      },
      {
        name: 'Qualified',
        order: 2,
        color: '#10b981',
      },
      {
        name: 'Proposal',
        order: 3,
        color: '#8b5cf6',
      },
      {
        name: 'Closed',
        order: 4,
        color: '#ef4444',
      }
    ]

    for (const stage of stages) {
      await prisma.pipelineStage.upsert({
        where: {
          userId_order: {
            userId: user.id,
            order: stage.order
          }
        },
        update: {},
        create: {
          userId: user.id,
          ...stage
        }
      })
    }

    console.log('✅ Pipeline stages created successfully')

    // Note: Sample leads creation skipped - existing Lead model has complex schema
    // You can create leads through the UI or API instead

    console.log('🎉 Database seeding completed!')
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seedDatabase()