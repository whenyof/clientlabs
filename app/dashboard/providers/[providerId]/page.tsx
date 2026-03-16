import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Provider360View } from "@/modules/providers/components/Provider360View"

type PageProps = { params: Promise<{ providerId: string }> }

async function getProvider(providerId: string, userId: string) {
    const provider = await prisma.provider.findFirst({
        where: { id: providerId, userId },
        include: {
            payments: { orderBy: { paymentDate: "desc" }, take: 1 },
            tasks: { where: { status: "PENDING" } },
            _count: { select: { payments: true, tasks: true } },
        },
    })
    return provider
}

export default async function Provider360Page({ params }: PageProps) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) redirect("/auth/signin")

    const { providerId } = await params
    const provider = await getProvider(providerId, session.user.id)
    if (!provider) notFound()

    return <Provider360View initialProvider={provider as any} />
}
