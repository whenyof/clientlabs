import { prisma } from "../lib/prisma"

async function resetTarget() {
    const user = await prisma.user.findFirst()
    if (!user) {
        console.log("No user found")
        return
    }

    console.log("Found user:", user.email)

    const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
            monthlyRevenueTarget: 0
        }
    })

    console.log("Reset target to:", updated.monthlyRevenueTarget)
}

resetTarget().catch(console.error)
