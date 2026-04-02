import { prisma } from "@/lib/prisma"
import { safePrismaQuery } from "@infra/database/prisma"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ClientsView } from "@domains/clients/components/ClientsView"

type SearchParams = Promise<{
    status?: string
    search?: string
    sortBy?: string
    sortOrder?: string
    filter?: "active" | "vip" | "inactive" | "revenue" | "followup"
}>

export default async function ClientsPage({
    searchParams: searchParamsPromise,
}: {
    searchParams: SearchParams
}) {
    const session = await getServerSession(authOptions)
    const searchParams = await searchParamsPromise

    if (!session?.user?.id) {
        redirect("/auth")
    }

    const userId = session.user.id

    /* ---------------- WHERE ---------------- */
    const where: any = {
        userId,
    }

    // Status filter
    if (searchParams.status && searchParams.status !== "all") {
        where.status = searchParams.status
    }

    // Search filter
    if (searchParams.search) {
        where.OR = [
            { name: { contains: searchParams.search, mode: "insensitive" } },
            { email: { contains: searchParams.search, mode: "insensitive" } },
            { phone: { contains: searchParams.search, mode: "insensitive" } },
        ]
    }

    /* ---------------- SORT ---------------- */
    const sortBy = searchParams.sortBy || "createdAt"
    const sortOrder = (searchParams.sortOrder || "desc") as "asc" | "desc"

    let orderBy: any = { createdAt: "desc" }
    if (sortBy === "name") {
        orderBy = { name: sortOrder }
    } else if (sortBy === "totalSpent") {
        orderBy = { totalSpent: sortOrder }
    } else if (sortBy === "createdAt") {
        orderBy = { createdAt: sortOrder }
    }

    /* ---------------- DATA ---------------- */
    let clients = await safePrismaQuery(() => prisma.client.findMany({
        where,
        orderBy,
        include: {
            Task: {
                where: { status: "PENDING" },
                select: { id: true }
            },
            Sale: { select: { id: true }, take: 1 }
        },
        take: 100,
    }))

    const allClients = await safePrismaQuery(() => prisma.client.findMany({
        where: { userId },
        select: {
            id: true,
            totalSpent: true,
            updatedAt: true,
            createdAt: true,
            status: true,
            notes: true,
            Task: {
                where: { status: "PENDING" },
                select: { id: true }
            }
        },
    }))

    return (
        <div className="space-y-6">
            <ClientsView
                initialClients={clients as any}
                allClientsBase={allClients as any}
                serverNow={new Date().toISOString()}
                currentFilters={{
                    status: searchParams.status || "all",
                    search: searchParams.search || "",
                    sortBy: searchParams.sortBy || "createdAt",
                    sortOrder: searchParams.sortOrder || "desc",
                }}
            />
        </div>
    );
}
