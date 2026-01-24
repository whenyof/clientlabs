import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create default plans
  console.log('Creating default plans...')

  const plans = [
    {
      name: 'FREE',
      description: 'Plan básico gratuito',
      isPublic: true,
      price: 0,
      features: ['Hasta 100 leads', '1 usuario', 'Soporte básico']
    },
    {
      name: 'PRO',
      description: 'Plan profesional completo',
      isPublic: true,
      price: 29.99,
      features: ['Leads ilimitados', 'Hasta 5 usuarios', 'Automatizaciones', 'Soporte prioritario']
    },
    {
      name: 'ENTERPRISE',
      description: 'Plan empresarial avanzado',
      isPublic: true,
      price: 99.99,
      features: ['Todo ilimitado', 'Usuarios ilimitados', 'API completa', 'Soporte 24/7', 'Implementación dedicada']
    }
  ]

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: {},
      create: plan
    })
  }

  console.log('✅ Default plans created successfully')

  // NOTE: No demo users created
  // The first real user to sign up will automatically get ADMIN role
  // This ensures we can test the real user creation flow

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })