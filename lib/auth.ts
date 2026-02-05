import { PrismaAdapter } from "@auth/prisma-adapter"
import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user?.password) return null

        const matches = await bcrypt.compare(
          credentials.password,
          user.password
        )
        if (!matches) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // 🚀 HARDENING: Manejo de errores de base de datos para evitar loops
      try {
        // En el primer login, persistimos o recuperamos el usuario
        if (user) {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: {
              id: true,
              role: true,
              plan: true,
              onboardingCompleted: true,
              selectedSector: true,
              name: true,
              email: true,
              image: true,
            }
          })

          if (!dbUser) {
            // Caso especial: Creación de usuario (Google login nuevo)
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || null,
                image: user.image || null,
                role: "USER",
                plan: "FREE",
                onboardingCompleted: false,
              },
            })
            token.userId = newUser.id
            token.role = newUser.role
            token.onboardingCompleted = false
          } else {
            token.userId = dbUser.id
            token.role = dbUser.role
            token.plan = dbUser.plan
            token.onboardingCompleted = dbUser.onboardingCompleted
            token.selectedSector = dbUser.selectedSector
          }
        }

        // ✅ OPTIMIZACIÓN: Solo volver a consultar la DB si faltan datos críticos
        // o si se dispara una actualización manual (update session)
        if (!token.userId || trigger === "update") {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: {
              id: true,
              role: true,
              plan: true,
              onboardingCompleted: true,
              selectedSector: true,
            }
          })
          if (dbUser) {
            token.userId = dbUser.id
            token.role = dbUser.role
            token.plan = dbUser.plan
            token.onboardingCompleted = dbUser.onboardingCompleted
            token.selectedSector = dbUser.selectedSector
          }
        }

        return token
      } catch (error) {
        console.error("❌ Auth JWT Callback Error:", error)
        // Devolvemos el token actual para no romper la sesión si la DB falla temporalmente
        return token
      }
    },

    async session({ session, token }) {
      if (token.error === "UserNotFound") {
        // Force logout if user doesn't exist in DB
        return { ...session, user: undefined }
      }

      if (session.user) {
        // ✅ Expose REAL DB data in session
        session.user.id = (token.userId || token.sub) as string
        session.user.role = token.role as "USER" | "ADMIN"
        session.user.plan = token.plan as "FREE" | "PRO" | "ENTERPRISE"
        session.user.onboardingCompleted = token.onboardingCompleted as boolean
        session.user.selectedSector = token.selectedSector as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.image = token.picture as string
      }

      return session
    },

    async signIn() {
      // ✅ User persistence is handled in the JWT callback
      return true
    },

    async redirect({ url, baseUrl }) {
      // ✅ Allow callback URLs within the app
      if (url.startsWith(baseUrl)) return url

      // ✅ Default redirect - middleware will handle the rest
      // Middleware will check:
      // - If admin → allow /admin access
      // - If onboarding incomplete → redirect to /select-sector
      // - Otherwise → allow /dashboard access
      return `${baseUrl}/dashboard`
    },
  },

  pages: {
    signIn: "/auth",
  },

  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  // Add URL for production deployments
  ...(process.env.NEXTAUTH_URL && { url: process.env.NEXTAUTH_URL }),
}