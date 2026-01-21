"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { usePathname } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === "loading") return
    if (!session) router.push("/auth")
  }, [session, status, router])

  // Skip wrapper for pixel-perfect layouts (like /dashboard/other)
  if (pathname?.startsWith("/dashboard/other")) {
    return children
  }

  return children
}