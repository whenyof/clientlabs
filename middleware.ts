import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

/**
 * Next.js Middleware: Auth + Rate Limiting.
 * - API routes → rate limit 60 req/min por IP (solo si Upstash está configurado)
 * - Rutas públicas → pasan sin autenticación
 * - Unauthenticated en rutas privadas → /auth
 * - Admin routes → require ADMIN role
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── Stripe webhook — bypass rate limiting ──
  if (pathname === "/api/stripe/webhook") {
    return NextResponse.next()
  }

  // ── Rate Limiting — solo si Upstash está configurado ──
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
    // Raíz y variantes de landing
    pathname === "/" ||
    pathname.startsWith("/whitelist") ||
    pathname.startsWith("/preview") ||
    pathname.startsWith("/demo") ||

    // SEO técnico — crítico para indexación
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/llms.txt" ||
    pathname.startsWith("/opengraph-image") ||

    // Marketing / páginas públicas
    pathname.startsWith("/precios") ||
    pathname.startsWith("/producto") ||
    pathname.startsWith("/soluciones") ||
    pathname.startsWith("/recursos") ||
    pathname.startsWith("/features") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/contacto") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/changelog") ||
    pathname.startsWith("/blog") ||
    pathname.startsWith("/seguridad") ||
    pathname.startsWith("/docs") ||
    pathname.startsWith("/wordpress-plugin") ||
    pathname.startsWith("/embajadores") ||

    // Legal
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/cookies") ||
    pathname.startsWith("/legal") ||

    // Auth y registro
    pathname.startsWith("/auth") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/verify") ||
    pathname.startsWith("/plan") ||

    // Tokens públicos y rutas de acceso directo
    pathname.startsWith("/f/") ||      // public forms
    pathname.startsWith("/r/") ||      // redirect shortlinks
    pathname.startsWith("/scan") ||
    pathname.startsWith("/newsletter/") ||
    pathname.startsWith("/invite/") ||
    pathname.startsWith("/meeting/") ||

    // APIs públicas (SDK, ingest, formularios)
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/waitlist") ||
    pathname.startsWith("/api/register") ||
    pathname.startsWith("/api/ingest") ||
    pathname.startsWith("/api/v1/") ||
    pathname.startsWith("/api/track") ||
    pathname.startsWith("/api/forms/") ||
    pathname.startsWith("/api/cron/") ||

    // Assets
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|woff|woff2|txt|xml|json)$/)
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
