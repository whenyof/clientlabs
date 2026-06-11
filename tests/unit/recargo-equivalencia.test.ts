import { describe, it, expect, vi } from "vitest"

// El engine importa sales.actions (server-only) para otras funciones; aquí solo probamos cálculo puro
vi.mock("@/modules/sales/actions/sales.actions", () => ({ recalculateClientTotalSpent: async () => {} }))
vi.mock("@/modules/invoicing/repositories/invoice.repository", () => ({}))

import { calculateTotals, aggregateLineTotals } from "@/modules/invoicing/engine/invoice.engine"
import { recargoRateForVat, nearestAllowedVatRate, isAllowedVatRate } from "@/modules/invoicing/utils/vatRates"

const LINES = [
  { description: "A", quantity: 2, unitPrice: 100, taxPercent: 21 },
  { description: "B", quantity: 1, unitPrice: 50, taxPercent: 10 },
]

describe("recargo de equivalencia — sin regresión en facturas normales", () => {
  it("sin recargo: totales idénticos al comportamiento histórico", () => {
    const computed = calculateTotals(LINES, "base")
    const { subtotal, taxAmount, total, recargoAmount } = aggregateLineTotals(computed)
    expect(subtotal).toBe(250)
    expect(taxAmount).toBe(47) // 200×0.21 + 50×0.10
    expect(total).toBe(297) // base + IVA, sin recargo
    expect(recargoAmount).toBe(0)
    // El payload no debe ganar claves nuevas: las líneas no llevan recargo
    expect(computed[0]).not.toHaveProperty("recargoRate")
    expect(computed[0]).not.toHaveProperty("recargoAmount")
  })

  it("sin recargo, modo total: misma base/IVA que antes", () => {
    const computed = calculateTotals(
      [{ description: "A", quantity: 1, unitPrice: 0, taxPercent: 21, lineTotal: 121, priceMode: "total" as const }],
      "total"
    )
    expect(computed[0].subtotal).toBe(100)
    expect(computed[0].taxAmount).toBe(21)
    expect(computed[0].total).toBe(121)
  })

  it("con recargo: total = base + IVA + recargo (ejemplo doc Verifacti: 200 + 42 + 10.4)", () => {
    const computed = calculateTotals(
      [{ description: "A", quantity: 1, unitPrice: 200, taxPercent: 21 }],
      "base",
      { recargoEquivalencia: true }
    )
    expect(computed[0].taxAmount).toBe(42)
    expect(computed[0].recargoRate).toBe(5.2)
    expect(computed[0].recargoAmount).toBe(10.4)
    expect(computed[0].total).toBe(252.4)
  })

  it("con recargo multi-tipo: 21→5.2 y 10→1.4", () => {
    const computed = calculateTotals(LINES, "base", { recargoEquivalencia: true })
    const agg = aggregateLineTotals(computed)
    expect(computed[0].recargoAmount).toBe(10.4) // 200 × 5.2%
    expect(computed[1].recargoAmount).toBe(0.7) // 50 × 1.4%
    expect(agg.recargoAmount).toBe(11.1)
    expect(agg.total).toBe(308.1) // 250 + 47 + 11.1
  })

  it("tipos de recargo derivados", () => {
    expect(recargoRateForVat(21)).toBe(5.2)
    expect(recargoRateForVat(10)).toBe(1.4)
    expect(recargoRateForVat(4)).toBe(0.5)
    expect(recargoRateForVat(0)).toBe(0)
  })

  it("whitelist de IVA", () => {
    expect(isAllowedVatRate(21)).toBe(true)
    expect(isAllowedVatRate(7.5)).toBe(true)
    expect(isAllowedVatRate(16)).toBe(false)
    expect(nearestAllowedVatRate(20.99)).toBe(21)
    expect(nearestAllowedVatRate(9.6)).toBe(10)
  })
})
