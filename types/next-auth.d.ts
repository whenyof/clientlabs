import { PlanType } from "@prisma/client"

declare module "next-auth" {
  interface User {
    id: string
    plan: PlanType
    role: "USER" | "ADMIN"
    onboardingCompleted: boolean
    selectedSector: string | null
  }
  interface Session {
    user: {
      id: string
      plan: PlanType
      role: "USER" | "ADMIN"
      onboardingCompleted: boolean
      selectedSector: string | null
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string
    plan: PlanType
    role: "USER" | "ADMIN"
    onboardingCompleted: boolean
    selectedSector: string | null
  }
}
