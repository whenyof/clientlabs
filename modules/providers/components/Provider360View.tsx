"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ProviderSidePanel } from "./ProviderSidePanel"

type Provider = {
    id: string
    name: string
    type: string | null
    monthlyCost: number | null
    status: string
    dependencyLevel: string
    operationalState: string
    isCritical: boolean
    contactEmail?: string | null
    contactPhone?: string | null
    website?: string | null
    notes?: string | null
    affectedArea?: string | null
    lastOrderDate?: Date | null
    hasAlternative?: boolean
    createdAt: Date
    updatedAt: Date
    payments?: unknown[]
    tasks?: unknown[]
    _count?: { payments: number; tasks: number }
}

type Provider360ViewProps = {
    initialProvider: Provider
}

export function Provider360View({ initialProvider }: Provider360ViewProps) {
    const router = useRouter()
    const handleUpdate = () => router.refresh()

    return (
        <div className="min-h-[60vh]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 space-y-4">
                {/* Topbar: solo enlace de vuelta */}
                <nav>
                    <Link
                        href="/dashboard/providers"
                        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver al listado de proveedores
                    </Link>
                </nav>
                <ProviderSidePanel
                    provider={initialProvider}
                    open={true}
                    onClose={() => router.push("/dashboard/providers")}
                    onUpdate={handleUpdate}
                    embeddedInPage={true}
                />
            </div>
        </div>
    )
}
