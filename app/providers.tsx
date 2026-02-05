"use client"
import { SessionProvider } from "next-auth/react"
import { AssistantProvider } from "@/context/AssistantContext"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AssistantProvider>
        {children}
      </AssistantProvider>
    </SessionProvider>
  )
}