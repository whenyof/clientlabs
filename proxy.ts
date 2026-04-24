import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

/**
 * Next.js 16 Proxy (antes: middleware).
 * - API routes → rate limit 60 req/min por IP (solo si Upstash está configurado)
 * - Unauthenticated → /auth
 * - Admin routes → require ADMIN role
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── Rate Limiting — solo si Upstash está configurado (no aplica en local sin Redis) ──
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
      // Fail-open: si Redis falla, dejamos pasar
      console.error("Rate limit error:", e instanceof Error ? e.message : e)
      return NextResponse.next()
    }
  }

  // ── Rutas públicas (sin autenticación) ──
  if (
    pathname === "/" ||
    pathname.startsWith("/scan") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/plan") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/waitlist") ||
    pathname.startsWith("/api/register") ||
    pathname.startsWith("/whitelist") ||
    pathname.startsWith("/preview") ||
    pathname.startsWith("/precios") ||
    pathname.startsWith("/producto") ||
    pathname.startsWith("/soluciones") ||
    pathname.startsWith("/recursos") ||
    pathname.startsWith("/contacto") ||
    pathname.startsWith("/blog") ||
    pathname.startsWith("/changelog") ||
    pathname.startsWith("/demo") ||
    pathname.startsWith("/embajadores") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/cookies") ||
    pathname.startsWith("/legal") ||
    pathname.startsWith("/seguridad") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|woff|woff2)$/)
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
  if (pathname.startsWith("/admin") && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
