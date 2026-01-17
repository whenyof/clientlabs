export async function POST(request: Request) {
  // Intentionally minimal to avoid blocking render
  // Metrics can be forwarded to analytics later
  void request.json().catch(() => null)
  return new Response(null, { status: 204 })
}


