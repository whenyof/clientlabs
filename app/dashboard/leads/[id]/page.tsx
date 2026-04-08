import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { LeadPanel } from "@/modules/leads/components/LeadPanel"

export default async function LeadPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        redirect("/auth")
    }

    const { id: leadId } = await params
    const userId = session.user.id

    const lead = await prisma.lead.findFirst({
        where: {
            id: leadId,
            userId,
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
            lastActionAt: true,
            leadStatus: true,
            score: true,
            source: true,
            temperature: true,
            additionalInfo: true,
        },
    })

    if (!lead) {
        notFound()
    }

    return <LeadPanel lead={lead} />
}
