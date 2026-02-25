"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"

/**
 * Dashboard button that appears only for authenticated users
 * Redirects based on user role and onboarding status
 */
export function DashboardButton() {
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
 className="
 px-5 py-2 rounded-full
 bg-[var(--bg-card)] 
 border border-[var(--border-subtle)]
 text-sm font-semibold text-[var(--text-primary)]
 shadow-sm shadow-sm
 hover:opacity-90 hover:shadow-sm transition
 "
 >
 Ir al dashboard
 </Link>
 )
}
