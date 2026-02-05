import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// 🚀 HARDENING: Force Node.js runtime to avoid Edge Runtime / Prisma connection issues
export const runtime = "nodejs"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }