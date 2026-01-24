import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user?: {
      id: string
      role?: "USER" | "ADMIN"
      plan?: "FREE" | "PRO" | "ENTERPRISE"
      onboardingCompleted?: boolean
      selectedSector?: string | null
      sector?: string | null
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string
    role?: "USER" | "ADMIN"
    plan?: "FREE" | "PRO" | "ENTERPRISE"
    onboardingCompleted?: boolean
    selectedSector?: string | null
    sector?: string | null
    error?: "UserNotFound"
  }
}
