import { PrismaAdapter } from "@auth/prisma-adapter"
import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
  },

  providers: [
    // ─────────────────────────────────────────────
    // GOOGLE
    // ─────────────────────────────────────────────
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    })

    // ─────────────────────────────────────────────
    // CREDENTIALS (EMAIL + PASSWORD)
    // ─────────────────────────────────────────────
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) return null

        const valid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          plan: user.plan,
          onboardingCompleted: user.onboardingCompleted,
          selectedSector: user.selectedSector,
        }
      },
    }),
  ],

  callbacks: {
    // ─────────────────────────────────────────────
    // SIGN IN
    // PrismaAdapter se encarga de:
    // - crear User
    // - crear Account
    // - linking Google automáticamente
    // ─────────────────────────────────────────────
    async signIn({ user }) {
      if (!user?.email) return false
      return true
    },

    // ─────────────────────────────────────────────
    // JWT: solo leer datos (Credentials ya trae todo; Google viene del adapter sin onboarding)
    // Para Google, hidratar desde BD para que session refleje el estado real.
    // ─────────────────────────────────────────────
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id
        token.name = user.name
        token.email = user.email
        token.picture = user.image
        const fromDb = user as { role?: string; plan?: string; onboardingCompleted?: boolean; selectedSector?: string | null }
        if (fromDb.role != null && fromDb.plan != null && typeof fromDb.onboardingCompleted === "boolean") {
          token.role = fromDb.role as "USER" | "ADMIN"
          token.plan = fromDb.plan as "FREE" | "PRO" | "ENTERPRISE"
          token.onboardingCompleted = fromDb.onboardingCompleted
          token.selectedSector = fromDb.selectedSector ?? null
        } else {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true, plan: true, onboardingCompleted: true, selectedSector: true },
          })
          if (dbUser) {
            token.role = dbUser.role as "USER" | "ADMIN"
            token.plan = dbUser.plan as "FREE" | "PRO" | "ENTERPRISE"
            token.onboardingCompleted = dbUser.onboardingCompleted
            token.selectedSector = dbUser.selectedSector ?? null
          }
        }
      }
      return token
    },

    // ─────────────────────────────────────────────
    // SESSION
    // ─────────────────────────────────────────────
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string
        session.user.role = token.role as "USER" | "ADMIN"
        session.user.plan = token.plan as "FREE" | "PRO" | "ENTERPRISE"
        session.user.onboardingCompleted =
          token.onboardingCompleted as boolean
        session.user.selectedSector = token.selectedSector as string | null
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.image = token.picture as string | null
      }

      return session
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url
      return `${baseUrl}/dashboard`
    },
  },

  pages: {
    signIn: "/auth",
  },

  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
}