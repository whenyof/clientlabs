"use client"

import { usePathname } from "next/navigation"
import { AiFloatingAssistant } from "@/components/AiFloatingAssistant"

const PUBLIC_PREFIXES = ["/", "/preview", "/whitelist", "/terms", "/privacy", "/cookies", "/legal", "/login", "/register"]

function isPublicRoute(pathname: string): boolean {
  // Exact match for "/" or starts with a known public prefix followed by "/" or end
  return PUBLIC_PREFIXES.some((prefix) =>
    prefix === "/"
      ? pathname === "/"
      : pathname === prefix || pathname.startsWith(prefix + "/")
  )
}

export function ConditionalAiAssistant() {
  const pathname = usePathname()
  if (isPublicRoute(pathname)) return null
  return <AiFloatingAssistant />
}
