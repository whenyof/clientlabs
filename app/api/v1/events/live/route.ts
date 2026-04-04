export const maxDuration = 10
/**
 * GET /api/v1/events/live
 * Disabled — SSE long-polling kept Vercel Fluid Memory provisioned indefinitely.
 * Clients should use polling instead.
 */

export const dynamic = "force-dynamic"

export async function GET() {
  return new Response(JSON.stringify({ error: "Use polling instead" }), {
    status: 410,
    headers: { "Content-Type": "application/json" },
  })
}
