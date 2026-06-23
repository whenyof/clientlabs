import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ClientsView } from "@domains/clients/components/ClientsView"
import { getClientsView } from "@/modules/clients/services/getClientsView"

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
    const serverNow = new Date()

    const currentFilters = {
        status: searchParams.status || "all",
        search: searchParams.search || "",
        sortBy: searchParams.sortBy || "createdAt",
        sortOrder: searchParams.sortOrder || "desc",
    }

    // Página 1 + agregados calculados EN SERVER (no se envían todas las filas).
    const initialData = await getClientsView(
        userId,
        {
            status: currentFilters.status,
            search: currentFilters.search,
            sortBy: currentFilters.sortBy,
            sortOrder: currentFilters.sortOrder as "asc" | "desc",
            offset: 0,
        },
        serverNow,
    )

    return (
        <div className="space-y-6">
            <ClientsView
                initialData={initialData as any}
                serverNow={serverNow.toISOString()}
                currentFilters={currentFilters}
            />
        </div>
    );
}
