import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const maxDuration = 15

export async function GET() {
  const results: Record<string, unknown> = {}

  // Test 1: conexión DB
  try {
    const count = await prisma.waitlistEntry.count()
    results.db = { ok: true, count }
  } catch (e) {
    results.db = { ok: false, error: String(e) }
  }

  // Test 2: RESEND_API_KEY existe
  results.resend_key = {
    exists: !!process.env.RESEND_API_KEY,
    prefix: process.env.RESEND_API_KEY?.slice(0, 8),
  }

  // Test 3: llamada a Resend
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ClientLabs <hola@clientlabs.io>",
        to: "iyanrimada@gmail.com",
        subject: "Test diagnóstico",
        html: "<p>Test</p>",
      }),
    })
    clearTimeout(timeout)
    const data = await res.json()
    results.resend = { ok: res.ok, status: res.status, data }
  } catch (e) {
    results.resend = { ok: false, error: String(e) }
  }

  return NextResponse.json(results)
}
