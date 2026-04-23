import { describe, it, expect } from "vitest"
import {
  hasFeature,
  getLimit,
  isAtLimit,
  planAtLeast,
  requiredPlanFor,
  upgradeMessage,
} from "@/lib/plan-gates"

describe("hasFeature", () => {
  it("FREE no tiene ai", () => {
    expect(hasFeature("FREE", "ai")).toBe(false)
  })

  it("PRO tiene ai", () => {
    expect(hasFeature("PRO", "ai")).toBe(true)
  })

  it("BUSINESS tiene aiPredictions", () => {
    expect(hasFeature("BUSINESS", "aiPredictions")).toBe(true)
  })

  it("PRO no tiene aiPredictions", () => {
    expect(hasFeature("PRO", "aiPredictions")).toBe(false)
  })

  it("FREE tiene leads (base)", () => {
    expect(hasFeature("FREE", "leads")).toBe(true)
  })

  it("FREE no tiene automations", () => {
    expect(hasFeature("FREE", "automations")).toBe(false)
  })

  it("BUSINESS tiene emailMarketing", () => {
    expect(hasFeature("BUSINESS", "emailMarketing")).toBe(true)
  })

  it("PRO no tiene emailMarketing", () => {
    expect(hasFeature("PRO", "emailMarketing")).toBe(false)
  })
})

describe("getLimit", () => {
  it("FREE maxLeadsTotal es 50", () => {
    expect(getLimit("FREE", "maxLeadsTotal")).toBe(50)
  })

  it("PRO maxLeadsTotal es Infinity", () => {
    expect(getLimit("PRO", "maxLeadsTotal")).toBe(Infinity)
  })

  it("FREE maxClients es 20", () => {
    expect(getLimit("FREE", "maxClients")).toBe(20)
  })

  it("BUSINESS maxActiveAutomations es Infinity", () => {
    expect(getLimit("BUSINESS", "maxActiveAutomations")).toBe(Infinity)
  })

  it("FREE maxActiveAutomations es 0", () => {
    expect(getLimit("FREE", "maxActiveAutomations")).toBe(0)
  })

  it("PRO maxActiveAutomations es 5", () => {
    expect(getLimit("PRO", "maxActiveAutomations")).toBe(5)
  })
})

describe("isAtLimit", () => {
  it("FREE con 50 leads está en el límite", () => {
    expect(isAtLimit("FREE", "maxLeadsTotal", 50)).toBe(true)
  })

  it("FREE con 49 leads NO está en el límite", () => {
    expect(isAtLimit("FREE", "maxLeadsTotal", 49)).toBe(false)
  })

  it("PRO con 10000 leads NO está en el límite", () => {
    expect(isAtLimit("PRO", "maxLeadsTotal", 10_000)).toBe(false)
  })

  it("FREE con 0 leads NO está en el límite", () => {
    expect(isAtLimit("FREE", "maxLeadsTotal", 0)).toBe(false)
  })

  it("FREE con 51 leads supera el límite", () => {
    expect(isAtLimit("FREE", "maxLeadsTotal", 51)).toBe(true)
  })
})

describe("planAtLeast", () => {
  it("FREE >= FREE", () => {
    expect(planAtLeast("FREE", "FREE")).toBe(true)
  })

  it("PRO >= FREE", () => {
    expect(planAtLeast("PRO", "FREE")).toBe(true)
  })

  it("PRO >= PRO", () => {
    expect(planAtLeast("PRO", "PRO")).toBe(true)
  })

  it("BUSINESS >= PRO", () => {
    expect(planAtLeast("BUSINESS", "PRO")).toBe(true)
  })

  it("FREE NO >= PRO", () => {
    expect(planAtLeast("FREE", "PRO")).toBe(false)
  })

  it("FREE NO >= BUSINESS", () => {
    expect(planAtLeast("FREE", "BUSINESS")).toBe(false)
  })

  it("PRO NO >= BUSINESS", () => {
    expect(planAtLeast("PRO", "BUSINESS")).toBe(false)
  })
})

describe("requiredPlanFor", () => {
  it("leads requiere FREE", () => {
    expect(requiredPlanFor("leads")).toBe("FREE")
  })

  it("ai requiere PRO", () => {
    expect(requiredPlanFor("ai")).toBe("PRO")
  })

  it("automations requiere PRO", () => {
    expect(requiredPlanFor("automations")).toBe("PRO")
  })

  it("webhooks requiere BUSINESS", () => {
    expect(requiredPlanFor("webhooks")).toBe("BUSINESS")
  })

  it("api requiere BUSINESS", () => {
    expect(requiredPlanFor("api")).toBe("BUSINESS")
  })

  it("emailMarketing requiere BUSINESS", () => {
    expect(requiredPlanFor("emailMarketing")).toBe("BUSINESS")
  })

  it("verifactu requiere BUSINESS", () => {
    expect(requiredPlanFor("verifactu")).toBe("BUSINESS")
  })
})

describe("upgradeMessage", () => {
  it("retorna string para ai", () => {
    const msg = upgradeMessage("ai")
    expect(typeof msg).toBe("string")
    expect(msg.length).toBeGreaterThan(10)
  })

  it("menciona Pro para automations", () => {
    const msg = upgradeMessage("automations")
    expect(msg.toLowerCase()).toMatch(/pro/)
  })

  it("menciona Business para webhooks", () => {
    const msg = upgradeMessage("webhooks")
    expect(msg.toLowerCase()).toMatch(/business/)
  })

  it("retorna fallback para features sin mensaje custom", () => {
    const msg = upgradeMessage("csvExport")
    expect(typeof msg).toBe("string")
    expect(msg.length).toBeGreaterThan(5)
  })
})
