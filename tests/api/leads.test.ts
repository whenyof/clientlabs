import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}))

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    lead: {
      count: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    activity: {
      create: vi.fn().mockResolvedValue({}),
    },
    automationTrigger: { findMany: vi.fn().mockResolvedValue([]) },
  },
}))

vi.mock("@/lib/redis-cache", () => ({
  invalidateCachedData: vi.fn(),
  getCachedData: vi.fn().mockResolvedValue(null),
  setCachedData: vi.fn(),
}))

vi.mock("@/lib/scoring/updateLeadScore", () => ({
  updateLeadScore: vi.fn(),
}))

vi.mock("@/lib/automations/engine", () => ({
  runAutomation: vi.fn().mockResolvedValue(undefined),
}))

// Mock api-gate directamente para controlar respuestas del gate
vi.mock("@/lib/api-gate", () => ({
  gateLimit: vi.fn(),
  gateFeature: vi.fn(),
}))

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(body?: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  })
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("POST /api/leads", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("sin autenticación → 401", async () => {
    const { getServerSession } = await import("next-auth")
    vi.mocked(getServerSession).mockResolvedValue(null)

    const { gateLimit } = await import("@/lib/api-gate")
    const { NextResponse } = await import("next/server")
    vi.mocked(gateLimit).mockResolvedValue({
      allowed: false,
      plan: "FREE",
      userId: "",
      error: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    })

    const { POST } = await import("@/app/api/leads/route")
    const res = await POST(makeRequest({ name: "Test" }))
    expect(res.status).toBe(401)
  })

  it("con auth y body vacío → 400 (validación Zod)", async () => {
    const { getServerSession } = await import("next-auth")
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-1", plan: "FREE", email: "u@test.com" },
      expires: "",
    })

    const { gateLimit } = await import("@/lib/api-gate")
    vi.mocked(gateLimit).mockResolvedValue({
      allowed: true,
      plan: "FREE",
      userId: "user-1",
    })

    const { POST } = await import("@/app/api/leads/route")
    const req = new NextRequest("http://localhost/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it("FREE con 50 leads existentes → 403 (límite plan)", async () => {
    const { getServerSession } = await import("next-auth")
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-1", plan: "FREE", email: "u@test.com" },
      expires: "",
    })

    const { gateLimit } = await import("@/lib/api-gate")
    const { NextResponse } = await import("next/server")
    vi.mocked(gateLimit).mockResolvedValue({
      allowed: false,
      plan: "FREE",
      userId: "user-1",
      error: NextResponse.json(
        { error: "Límite de leads alcanzado", currentPlan: "FREE", upgradeUrl: "/precios" },
        { status: 403 }
      ),
    })

    const { POST } = await import("@/app/api/leads/route")
    const res = await POST(makeRequest({ name: "Nuevo Lead", email: "nuevo@test.com" }))
    expect(res.status).toBe(403)

    const body = await res.json()
    expect(body).toHaveProperty("upgradeUrl")
  })

  it("PRO con body válido → 200/201", async () => {
    const { getServerSession } = await import("next-auth")
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-pro", plan: "PRO", email: "pro@test.com" },
      expires: "",
    })

    const { gateLimit } = await import("@/lib/api-gate")
    vi.mocked(gateLimit).mockResolvedValue({
      allowed: true,
      plan: "PRO",
      userId: "user-pro",
      remaining: Infinity,
    })

    const createdLead = {
      id: "lead-1",
      name: "Test Lead",
      email: "lead@test.com",
      phone: null,
      company: null,
      source: "Web",
      budget: null,
      notes: null,
      userId: "user-pro",
      status: "NEW",
      leadStatus: "NEW",
      temperature: "WARM",
      score: 0,
      stage: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const { prisma } = await import("@/lib/prisma")
    vi.mocked(prisma.lead.create).mockResolvedValue(createdLead as any)
    vi.mocked(prisma.lead.findUnique).mockResolvedValue(createdLead as any)

    const { POST } = await import("@/app/api/leads/route")
    const res = await POST(makeRequest({ name: "Test Lead", email: "lead@test.com" }))
    expect([200, 201]).toContain(res.status)
  })
})
