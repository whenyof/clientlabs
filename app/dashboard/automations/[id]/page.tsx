"use client"
import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AutomationDetailRedirect() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  useEffect(() => {
    router.replace(`/dashboard/automatizaciones?detail=${id}`)
  }, [id, router])

  return null
}
