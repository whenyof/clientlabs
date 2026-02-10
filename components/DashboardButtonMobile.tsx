"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"

/**
 * Mobile version of DashboardButton
 * Used in the mobile menu with different styling
 */
export function DashboardButtonMobile({ onClick }: { onClick?: () => void }) {
    const { data: session, status } = useSession()

    // Don't render during loading or if not authenticated
    if (status === "loading" || !session?.user) {
        return null
    }

    // Determine redirect URL based on user state
    const getDashboardUrl = () => {
        const user = session.user

        // Safety check (TypeScript)
        if (!user) return "/dashboard"

        // Admin users go to admin panel
        if (user.role === "ADMIN") {
            return "/admin"
        }

        // Users who haven't completed onboarding go to sector selection
        if (user.onboardingCompleted === false) {
            return "/onboarding/sector"
        }

        // Regular users go to dashboard
        return "/dashboard"
    }

    const dashboardUrl = getDashboardUrl()

    return (
        <Link
            href={dashboardUrl}
            onClick={onClick}
            className="block px-6 py-3 font-semibold text-white bg-gradient-to-r from-purple-500/90 via-indigo-500/90 to-blue-500/90"
        >
            Ir al dashboard
        </Link>
    )
}
