import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock de Prisma ANTES de importar el servicio (vi.hoisted evita el problema de hoisting)
const prismaMock = vi.hoisted(() => ({
  waitlistEntry: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    count: vi.fn(),
  },
}))
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }))

import { generateReferralCode, generatePanelToken, isUniqueConstraintError } from "@/lib/waitlist/tokens"
import { maskEmail } from "@/lib/waitlist/mask-email"
import { joinWaitlist, confirmByPanelToken } from "@/lib/waitlist/service"

beforeEach(() => {
  vi.clearAllMocks()
})

describe("tokens", () => {
  it("referralCode: 8 chars, sin caracteres ambiguos", () => {
    for (let i = 0; i < 500; i++) {
      const code = generateReferralCode()
      expect(code).toHaveLength(8)
      expect(code).not.toMatch(/[0O1lIo]/)
      expect(code).toMatch(/^[A-Za-z2-9]+$/)
    }
  })

  it("panelToken: >=32 chars urlsafe", () => {
    for (let i = 0; i < 500; i++) {
      const token = generatePanelToken()
      expect(token.length).toBeGreaterThanOrEqual(32)
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/)
    }
  })

  it("sin repeticiones en 1000 generaciones", () => {
    const codes = new Set(Array.from({ length: 1000 }, () => generatePanelToken()))
    expect(codes.size).toBe(1000)
  })

  it("detecta P2002 como colisión unique", () => {
    expect(isUniqueConstraintError({ code: "P2002" })).toBe(true)
    expect(isUniqueConstraintError(new Error("otro"))).toBe(false)
    expect(isUniqueConstraintError(null)).toBe(false)
  })
})

describe("maskEmail", () => {
  it("enmascara el local conservando 2 chars", () => {
    expect(maskEmail("juan@gmail.com")).toBe("ju***@gmail.com")
  })
  it("local corto conserva 1 char", () => {
    expect(maskEmail("ab@x.com")).toBe("a***@x.com")
    expect(maskEmail("a@x.com")).toBe("a***@x.com")
  })
  it("nunca devuelve el email completo ni revienta sin @", () => {
    expect(maskEmail("sinarroba")).toBe("***")
    expect(maskEmail("maria.lopez@empresa.es")).not.toContain("maria.lopez@")
  })
})

describe("joinWaitlist", () => {
  it("alta nueva con ref válido → atribuye referredById", async () => {
    prismaMock.waitlistEntry.findUnique
      .mockResolvedValueOnce({ id: "referrer-1", email: "ana@x.com" }) // por referralCode
      .mockResolvedValueOnce(null) // por email (no existe)
    prismaMock.waitlistEntry.create.mockResolvedValueOnce({})

    const result = await joinWaitlist({ email: "Nuevo@X.com", ref: "ABCD2345" })
    expect(result.status).toBe("created")
    expect(prismaMock.waitlistEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ email: "nuevo@x.com", referredById: "referrer-1" }),
      })
    )
  })

  it("ref inexistente → sin atribución, el alta sigue", async () => {
    prismaMock.waitlistEntry.findUnique
      .mockResolvedValueOnce(null) // referralCode no existe
      .mockResolvedValueOnce(null) // email no existe
    prismaMock.waitlistEntry.create.mockResolvedValueOnce({})

    const result = await joinWaitlist({ email: "b@x.com", ref: "NOEXISTE" })
    expect(result.status).toBe("created")
    expect(prismaMock.waitlistEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ referredById: null }) })
    )
  })

  it("auto-referido (mismo email) → atribución bloqueada", async () => {
    prismaMock.waitlistEntry.findUnique
      .mockResolvedValueOnce({ id: "yo-1", email: "yo@x.com" }) // referrer soy yo
      .mockResolvedValueOnce(null)
    prismaMock.waitlistEntry.create.mockResolvedValueOnce({})

    await joinWaitlist({ email: "YO@x.com ", ref: "MICODIGO" })
    expect(prismaMock.waitlistEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ referredById: null }) })
    )
  })

  it("email duplicado confirmado → already_confirmed, sin create", async () => {
    prismaMock.waitlistEntry.findUnique.mockResolvedValueOnce({
      id: "e1",
      confirmedAt: new Date(),
      panelToken: "tok",
    })
    const result = await joinWaitlist({ email: "dup@x.com" })
    expect(result.status).toBe("already_confirmed")
    expect(prismaMock.waitlistEntry.create).not.toHaveBeenCalled()
  })

  it("email duplicado sin confirmar → already_unconfirmed con su panelToken", async () => {
    prismaMock.waitlistEntry.findUnique.mockResolvedValueOnce({
      id: "e1",
      confirmedAt: null,
      panelToken: "token-existente-123456789012345678",
    })
    const result = await joinWaitlist({ email: "dup@x.com" })
    expect(result).toEqual({
      status: "already_unconfirmed",
      panelToken: "token-existente-123456789012345678",
      email: "dup@x.com",
    })
    expect(prismaMock.waitlistEntry.create).not.toHaveBeenCalled()
  })

  it("colisión de token (P2002) → reintenta y crea", async () => {
    prismaMock.waitlistEntry.findUnique
      .mockResolvedValueOnce(null) // email no existe (pre-check)
      .mockResolvedValueOnce(null) // tras P2002: no fue carrera de email
    prismaMock.waitlistEntry.create
      .mockRejectedValueOnce({ code: "P2002" })
      .mockResolvedValueOnce({})

    const result = await joinWaitlist({ email: "c@x.com" })
    expect(result.status).toBe("created")
    expect(prismaMock.waitlistEntry.create).toHaveBeenCalledTimes(2)
  })
})

describe("confirmByPanelToken", () => {
  it("primera confirmación → setea confirmedAt", async () => {
    prismaMock.waitlistEntry.findUnique.mockResolvedValueOnce({ id: "e1", confirmedAt: null })
    prismaMock.waitlistEntry.updateMany.mockResolvedValueOnce({ count: 1 })

    const result = await confirmByPanelToken("tok-123456789012345678901234")
    expect(result).toEqual({ panelToken: "tok-123456789012345678901234", justConfirmed: true })
    expect(prismaMock.waitlistEntry.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "e1", confirmedAt: null } })
    )
  })

  it("confirmación repetida → idempotente, OK sin update", async () => {
    prismaMock.waitlistEntry.findUnique.mockResolvedValueOnce({ id: "e1", confirmedAt: new Date() })
    const result = await confirmByPanelToken("tok-123456789012345678901234")
    expect(result?.justConfirmed).toBe(false)
    expect(prismaMock.waitlistEntry.updateMany).not.toHaveBeenCalled()
  })

  it("token inexistente → null (la ruta redirige a página neutra)", async () => {
    prismaMock.waitlistEntry.findUnique.mockResolvedValueOnce(null)
    expect(await confirmByPanelToken("no-existe-123456789012345678")).toBeNull()
  })
})
