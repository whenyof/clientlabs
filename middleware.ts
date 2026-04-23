import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

/**
 * Next.js Middleware: Auth + Rate Limiting.
 * - API routes → rate limit 60 req/min por IP (solo si Upstash está configurado)
 * - Unauthenticated → /auth
 * - Admin routes → require ADMIN role
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── Rate Limiting for API routes (solo en producción con Redis configurado) ──
  if (
    pathname.startsWith("/api/") &&
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous"

    try {
      const { Ratelimit } = await import("@upstash/ratelimit")
      const { Redis } = await import("@upstash/redis")

      const rl = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(60, "1 m"),
        prefix: "clientlabs:ratelimit",
      })

      const { success, limit, reset, remaining } = await rl.limit(ip)

      if (!success) {
        return NextResponse.json(
          { error: "Demasiadas solicitudes. Inténtalo de nuevo en un momento." },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
              "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
            },
          }
        )
      }

      const response = NextResponse.next()
      response.headers.set("X-RateLimit-Limit", limit.toString())
      response.headers.set("X-RateLimit-Remaining", remaining.toString())
      return response
    } catch (e) {
      // Fail-open: si Redis cae, dejamos pasar
      console.error("Rate limit error:", e instanceof Error ? e.message : e)
      return NextResponse.next()
    }
  }

  // ── Public routes (no auth required) ──
  if (
    pathname.startsWith("/scan") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/waitlist") ||
    pathname.startsWith("/api/register") ||
    pathname.startsWith("/whitelist") ||
    pathname.startsWith("/preview") ||
    pathname === "/"
  ) {
    return NextResponse.next()
  }

  // ── Auth check ──
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (!token) {
    return NextResponse.redirect(new URL("/auth", req.url))
  }

  // ── Admin routes ──
  if (pathname.startsWith("/admin")) {
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/perfil/:path*",
    "/scan/:path*",
    "/api/:path*",
  ],
}
