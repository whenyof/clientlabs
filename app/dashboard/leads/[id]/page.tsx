import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { LeadHeader } from "@/modules/leads/components/LeadHeader"
import { LeadMetrics } from "@/modules/leads/components/LeadMetrics"
import { LeadTimeline } from "@/modules/leads/components/LeadTimeline"
import { LeadSidebar } from "@/modules/leads/components/LeadSidebar"

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

    // Basic identity fetch (Server-side)
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
            leadStatus: true,
            score: true,
            source: true,
        },
    })

    if (!lead) {
        notFound()
    }

    return (
        <div key={leadId} className="space-y-8 pb-20 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 animate-in fade-in duration-300">
            <LeadHeader lead={lead} />

            <LeadMetrics leadId={leadId} initialScore={lead.score} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    <LeadTimeline leadId={leadId} />
                </div>

                <aside className="lg:col-span-4 space-y-8">
                    <LeadSidebar leadId={leadId} />
                </aside>
            </div>
        </div>
    )
}
