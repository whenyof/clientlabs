import { PrismaAdapter } from "@next-auth/prisma-adapter"
import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { recordSession } from "@/lib/auth/session-tracking"
import { checkDistributedRateLimit } from "@/lib/security/distributedRateLimiter"
import { isLaunchLocked, isLaunchAllowed, LAUNCH_LOCKED_MESSAGE } from "@/lib/launch-lock"

export const authOptions: NextAuthOptions = {
 adapter: PrismaAdapter(prisma),

 session: {
 strategy: "jwt",
 maxAge: 7 * 24 * 60 * 60, // 7 días (el default de NextAuth son 30 días)
 },
 jwt: {
 maxAge: 7 * 24 * 60 * 60, // 7 días
 },

 providers: [
 // ─────────────────────────────────────────────
 // GOOGLE
 // ─────────────────────────────────────────────
 GoogleProvider({
 clientId: process.env.GOOGLE_CLIENT_ID!,
 clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
 allowDangerousEmailAccountLinking: true,
 }),

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

 const normalizedEmail = credentials.email.toLowerCase().trim()

 // Cierre de pre-lanzamiento: solo la allowlist puede entrar hasta el 1 de julio.
 if (isLaunchLocked() && !isLaunchAllowed(normalizedEmail)) {
 throw new Error(LAUNCH_LOCKED_MESSAGE)
 }

 // Dedicated per-account brute-force limit: 5 attempts / 15 min.
 // checkDistributedRateLimit is fail-CLOSED (denies if Redis is down),
 // which is the desired behaviour for the auth perimeter.
 const rl = await checkDistributedRateLimit(`auth:login:${normalizedEmail}`, 5, 15 * 60)
 if (!rl.allowed) {
 throw new Error("Demasiados intentos de inicio de sesión. Inténtalo de nuevo en unos minutos.")
 }

 const user = await prisma.user.findUnique({
 where: { email: normalizedEmail },
 })

 if (!user || !user.password) return null

 const valid = await bcrypt.compare(
 credentials.password,
 user.password
 )

 if (!valid) return null

 // Block login until the email is verified (A-03 / M-01).
 // Surface an actionable message (instead of the generic failure) so users
 // who never received the verification email aren't stranded — the login UI
 // detects this and offers "resend verification". We accept the minor
 // user-enumeration tradeoff here on purpose (B2B). (Reverts M3.)
 if (!user.emailVerified) {
 throw new Error("Verifica tu email para entrar. Revisa tu bandeja de entrada y la carpeta de spam.")
 }

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
 // Cierre de pre-lanzamiento: backstop para Google (Credentials ya se bloquea en
 // authorize). Solo la allowlist entra hasta el 1 de julio.
 if (isLaunchLocked() && !isLaunchAllowed(user.email)) return false
 // Track last login timestamp (IP/UA captured in JWT callback via headers)
 await prisma.user.update({
   where: { id: user.id },
   data: { lastLoginAt: new Date() },
 }).catch(() => {})
 return true
 },

 // ─────────────────────────────────────────────
 // JWT: solo leer datos (Credentials ya trae todo; Google viene del adapter sin onboarding)
 // Para Google, hidratar desde BD para que session refleje el estado real.
 // ─────────────────────────────────────────────
 async jwt({ token, user, trigger }) {
 if (user) {
 token.userId = user.id
 token.name = user.name
 token.email = user.email
 token.picture = user.image
 const fromDb = user as { role?: string; plan?: string; onboardingCompleted?: boolean; selectedSector?: string | null }
 if (fromDb.role != null && fromDb.plan != null && typeof fromDb.onboardingCompleted === "boolean") {
 token.role = fromDb.role as "USER" | "ADMIN"
 token.plan = fromDb.plan as "FREE" | "TRIAL" | "PRO" | "BUSINESS"
 token.onboardingCompleted = fromDb.onboardingCompleted
 token.selectedSector = fromDb.selectedSector ?? null
 } else {
 const dbUser = await prisma.user.findUnique({
 where: { id: user.id },
 select: { role: true, plan: true, onboardingCompleted: true, selectedSector: true, twoFactorEnabled: true },
 })
 if (dbUser) {
 token.role = dbUser.role as "USER" | "ADMIN"
 token.plan = dbUser.plan as "FREE" | "TRIAL" | "STARTER" | "PRO" | "BUSINESS"
 token.onboardingCompleted = dbUser.onboardingCompleted
 token.selectedSector = dbUser.selectedSector ?? null
 token.twoFactorEnabled = dbUser.twoFactorEnabled
 }
 }
 // On fresh sign-in, 2FA is not yet verified
 token.twoFactorVerified = false
 return token
 }

 // On update trigger (after 2FA verify page succeeds)
 if (trigger === "update" && token.userId) {
 token.twoFactorVerified = true
 }

 // Subsequent session refreshes — re-read mutable fields from DB
 if (token.userId) {
 const dbUser = await prisma.user.findUnique({
 where: { id: token.userId as string },
 select: { role: true, plan: true, name: true, onboardingCompleted: true, selectedSector: true, twoFactorEnabled: true },
 })
 if (dbUser) {
 token.role = dbUser.role as "USER" | "ADMIN"
 token.plan = dbUser.plan as "FREE" | "TRIAL" | "STARTER" | "PRO" | "BUSINESS"
 token.name = dbUser.name ?? token.name
 token.onboardingCompleted = dbUser.onboardingCompleted
 token.selectedSector = dbUser.selectedSector ?? null
 token.twoFactorEnabled = dbUser.twoFactorEnabled
 }
 }

 // Register/refresh session record (best-effort, non-blocking)
 if (token.jti && token.userId) {
   recordSession(token.userId as string, token.jti, null, null).catch(() => {})
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
 session.user.plan = token.plan as "FREE" | "TRIAL" | "STARTER" | "PRO" | "BUSINESS"
 session.user.onboardingCompleted =
 token.onboardingCompleted as boolean
 session.user.selectedSector = token.selectedSector as string | null
 session.user.name = token.name as string
 session.user.email = token.email as string
 session.user.image = token.picture as string | null
 session.user.twoFactorEnabled = (token.twoFactorEnabled as boolean) ?? false
 }
 session.jti = token.jti
 session.twoFactorVerified = (token.twoFactorVerified as boolean) ?? false

 return session
 },

 async redirect({ url, baseUrl }) {
 if (url.startsWith(baseUrl)) return url
 return `${baseUrl}/dashboard`
 },
 },

 // ─────────────────────────────────────────────
 // EVENTS
 // createUser fires only for new OAuth users (PrismaAdapter).
 // Email users are created manually in /api/register with plan=TRIAL already set.
 // ─────────────────────────────────────────────
 events: {
 async createUser({ user }) {
 if (!user?.id) return
 const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
 await prisma.user.update({
 where: { id: user.id },
 data: {
 plan: "TRIAL",
 isTrial: true,
 planExpiresAt: trialEndsAt,
 onboardingCompleted: false,
 },
 })
 },
 },

 pages: {
 signIn: "/auth",
 newUser: "/plan",
 },

 secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
}