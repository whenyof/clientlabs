"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"

/**
 * /dashboard/automations/[id]
 *
 * Redirects to the automations list with the detail panel open.
 * No full-page layout jump — the list stays visible.
 */
export default function AutomationDetailRedirect() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    useEffect(() => {
        router.replace(`/dashboard/automations?detail=${id}`)
    }, [id, router])

    return null
}
