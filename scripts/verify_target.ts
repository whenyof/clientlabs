import { prisma } from "../lib/prisma"

async function verify() {
    const userId = "clzg6b6v70000mgp7p19m9v58" // Taking a guess or I should find the user
    const user = await prisma.user.findFirst()
    if (!user) {
        console.log("No user found")
        return
    }

    console.log("Found user:", user.email)

    const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
            monthlyRevenueTarget: 40000
        }
    })

    console.log("Updated target to:", updated.monthlyRevenueTarget)
}

verify().catch(console.error)
