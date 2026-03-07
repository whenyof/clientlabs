import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ApiKeyType } from "@prisma/client"
import { ConnectView } from "./ConnectView"
import { ConnectStatus } from "@/components/connect/ConnectStatusCard"

export default async function WebConnectPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) redirect("/login")

    const userId = session.user.id

    // 🛡️ Obtener última llave pública activa para este usuario (Web SDK Core)
    const apiKey = await prisma.apiKey.findFirst({
        where: {
            userId,
            type: ApiKeyType.public,
            revoked: false
        },
        orderBy: { createdAt: "desc" }
    })

    // Integrations DB 
    const integrations = await prisma.integration.findMany({
        where: {
            userId,
            type: "web"
        },
        select: {
            id: true,
            type: true,
            provider: true,
            status: true,
            config: true,
            health: true,
            lastSync: true
        }
    })

    // ⛓️ Calcular estado inicial del canal web principal SDK
    let coreStatus: ConnectStatus = "setup_required"
    if (apiKey && apiKey.domain) {
        coreStatus = apiKey.lastUsed ? "connected" : "waiting"
    }

    return (
        <ConnectView
            coreStatus={coreStatus}
            initialDomain={apiKey?.domain}
            lastUsed={apiKey?.lastUsed}
            rawKeyHint={apiKey?.id} // Only for hints, not raw
            integrations={integrations}
        />
    )
}
