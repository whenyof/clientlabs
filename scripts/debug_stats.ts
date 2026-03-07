import { prisma } from "../lib/prisma"

async function debugStats() {
    const user = await prisma.user.findFirst()
    if (!user) {
        console.log("No user found")
        return
    }
    const userId = user.id
    console.log("Debugging stats for user:", userId)

    try {
        const results = await Promise.all([
            prisma.transaction.aggregate({
                where: { userId, type: 'INCOME', status: 'COMPLETED' },
                _sum: { amount: true },
            }),
            prisma.user.findUnique({
                where: { id: userId },
                select: { monthlyRevenueTarget: true }
            }),
        ])
        console.log("Queries succeeded!")
        console.log("User Target:", results[1]?.monthlyRevenueTarget)
    } catch (error) {
        console.error("Query failed:", error)
    }
}

debugStats().catch(console.error)
