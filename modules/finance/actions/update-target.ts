"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateMonthlyRevenueTarget(newTarget: number) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const userId = session.user.id

    await prisma.user.update({
        where: { id: userId },
        data: {
            monthlyRevenueTarget: newTarget
        }
    })

    revalidatePath("/dashboard")
    return { success: true }
}
