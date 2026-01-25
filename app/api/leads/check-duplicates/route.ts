import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { emails, phones } = await request.json()

        // Find existing leads with matching email or phone
        const duplicates = await prisma.lead.findMany({
            where: {
                userId: session.user.id,
                OR: [
                    emails && emails.length > 0 ? {
                        email: {
                            in: emails.map((e: string) => e.toLowerCase())
                        }
                    } : {},
                    phones && phones.length > 0 ? {
                        phone: {
                            in: phones
                        }
                    } : {}
                ].filter(obj => Object.keys(obj).length > 0)
            },
            select: {
                email: true,
                phone: true
            }
        })

        return NextResponse.json({ duplicates })
    } catch (error) {
        console.error("Duplicate check error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
