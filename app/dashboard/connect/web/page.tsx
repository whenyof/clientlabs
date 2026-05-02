import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ApiKeyType } from "@prisma/client"
import { decrypt } from "@/lib/security/encryption"
import { ConnectView } from "./ConnectView"
import { ConnectStatus } from "@/components/connect/ConnectStatusCard"

export default async function WebConnectPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) redirect("/login")

    const userId = session.user.id

    const apiKey = await prisma.apiKey.findFirst({
        where: { userId, type: ApiKeyType.public, revoked: false },
        orderBy: { createdAt: "desc" },
        select: { id: true, domain: true, lastUsed: true, encryptedKey: true },
    })

    const integrations = await prisma.integration.findMany({
        where: { userId, type: "web" },
        select: { id: true, type: true, provider: true, status: true, config: true, health: true, lastSync: true },
    })

    let coreStatus: ConnectStatus = "setup_required"
    if (apiKey?.domain) {
        coreStatus = apiKey.lastUsed ? "connected" : "waiting"
    }

    let rawPublicKey: string | null = null
    if (apiKey?.encryptedKey) {
        try {
            rawPublicKey = decrypt(apiKey.encryptedKey)
        } catch {
            rawPublicKey = null
        }
    }

    return (
        <ConnectView
            coreStatus={coreStatus}
            initialDomain={apiKey?.domain}
            lastUsed={apiKey?.lastUsed}
            rawKeyHint={rawPublicKey}
            integrations={integrations}
        />
    )
}
