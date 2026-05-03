export const maxDuration = 15

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ApiKeyType } from "@prisma/client"

const SCRIPT_MARKERS = [
  "clientlabs.io/v1/loader.js",
  "clientlabs.io/v1/sdk.js",
  "clientlabsConfig",
]

// Per-provider platform fingerprints (any match = platform confirmed)
const PLATFORM_MARKERS: Record<string, string[]> = {
  web_sdk:   [], // No platform requirement — any site
  wordpress: ["wp-content/", "wp-json", 'content="WordPress'],
  shopify:   ["cdn.shopify.com", "Shopify.theme", "shopify-section"],
  gtm:       ["googletagmanager.com/gtm.js", "gtm.js?id="],
  wix:       ["static.wixstatic.com", "wix.com", "_wix_"],
  webflow:   ["webflow.com", "data-wf-page"],
}

// GTM injects scripts at runtime — static HTML won't have our script, only GTM itself
const PLATFORM_ONLY: Set<string> = new Set(["gtm"])

function isInternalDomain(domain: string): boolean {
  return (
    domain === "localhost" ||
    domain.startsWith("127.") ||
    domain.startsWith("192.168.") ||
    domain.startsWith("10.") ||
    domain.endsWith(".local")
  )
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  let provider = "web_sdk"
  try {
    const body = await req.json()
    if (typeof body?.provider === "string") provider = body.provider
  } catch { /* body is optional */ }

  const apiKey = await prisma.apiKey.findFirst({
    where: { userId, type: ApiKeyType.public, revoked: false },
    orderBy: { createdAt: "desc" },
    select: { domain: true },
  })

  if (!apiKey?.domain) {
    return NextResponse.json({ detected: false, reason: "no_domain_configured" })
  }

  const domain = apiKey.domain

  if (isInternalDomain(domain)) {
    return NextResponse.json({ detected: false, domain, reason: "domain_unreachable" })
  }

  const url = `https://${domain}`

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)

    let res: Response
    try {
      res = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": "ClientLabs-Verifier/1.0 (+https://clientlabs.io)" },
        redirect: "follow",
      })
    } finally {
      clearTimeout(timeout)
    }

    if (!res.ok) {
      return NextResponse.json({ detected: false, domain, url, reason: "domain_unreachable" })
    }

    const html = await res.text()

    // 1. Check platform markers (if provider has any)
    const platformMarkers = PLATFORM_MARKERS[provider] ?? []
    if (platformMarkers.length > 0) {
      const platformFound = platformMarkers.some((m) => html.includes(m))
      if (!platformFound) {
        return NextResponse.json({ detected: false, domain, url, reason: "platform_mismatch" })
      }
    }

    // 2. For platform-only providers (GTM), platform presence = success
    const detected = PLATFORM_ONLY.has(provider)
      ? true
      : SCRIPT_MARKERS.some((m) => html.includes(m))

    const reason = PLATFORM_ONLY.has(provider)
      ? "platform_found"
      : detected
      ? "script_found"
      : "script_not_found"

    // 3. Persist verification state to DB so it survives navigation
    if (detected) {
      await prisma.integration.updateMany({
        where: { userId, type: "web", provider },
        data: { health: "verified", lastSync: new Date() },
      })
    }

    return NextResponse.json({ detected, domain, url, reason })
  } catch {
    return NextResponse.json({ detected: false, domain, url, reason: "domain_unreachable" })
  }
}
