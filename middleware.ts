import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 🌍 PUBLIC
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

  // 🛡️ ADMIN FIRST
  if (pathname.startsWith("/admin")) {
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
    return NextResponse.next()
  }

  // 🧭 ONBOARDING (NO ADMIN)
  if (
    pathname.startsWith("/dashboard") &&
    token.onboardingCompleted === false
  ) {
    return NextResponse.redirect(new URL("/select-sector", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/select-sector"],
}