"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function OtherBillingPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/dashboard/finance?view=billing")
  }, [router])
  return null
}
