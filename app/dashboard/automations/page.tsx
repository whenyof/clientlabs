"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

/** Legacy route — redirects to the canonical Spanish implementation */
export default function AutomationsRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/dashboard/automatizaciones")
  }, [router])
  return null
}
