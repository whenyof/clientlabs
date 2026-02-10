import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

/**
 * Middleware: ONLY auth. No onboarding logic here (avoids JWT/DB desync and redirect loops).
 * - Unauthenticated → /auth
 * - Admin routes → require ADMIN role
 * Onboarding is enforced in dashboard layout (server, DB-backed).
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next()
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (!token) {
    return NextResponse.redirect(new URL("/auth", req.url))
  }

  if (pathname.startsWith("/admin")) {
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/onboarding/:path*"],
}