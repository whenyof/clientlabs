import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔄 Iniciando backfill de transacciones...')

    const sales = await prisma.sale.findMany()
    console.log(`📊 Total ventas (Sales) encontradas en DB: ${sales.length}`)

    let createdCount = 0
    let skippedCount = 0

    for (const sale of sales) {
        const existingTx = await prisma.transaction.findFirst({
            where: {
                userId: sale.userId,
                amount: sale.total,
                date: sale.saleDate,
                type: 'INCOME'
            }
        })

        if (existingTx) {
            skippedCount++
            continue
        }

        const txStatus = (sale.status === 'PAID' || sale.status === 'PAGADO') ? 'COMPLETED' : 'PENDING'

        await prisma.transaction.create({
            data: {
                userId: sale.userId,
                type: 'INCOME',
                status: txStatus,
                amount: sale.total,
                date: sale.saleDate,
                concept: `Venta #${sale.id.slice(-6)}`,
                category: 'Ventas',
                paymentMethod: sale.paymentMethod || 'MANUAL',
                clientId: sale.clientId
            }
        })

        createdCount++
    }

    console.log('\n✅ Backfill Finalizado con Éxito')
    console.log('-----------------------------------')
    console.log(`🔍 Total Ventas Revisadas:       ${sales.length}`)
    console.log(`⏭️  Transacciones Ya Existentes:  ${skippedCount} (Skipped)`)
    console.log(`✨ Nuevas Transacciones Creadas: ${createdCount}`)
    console.log('-----------------------------------')
}

main()
    .catch((e) => {
        console.error('❌ Error fatal en backfill:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
