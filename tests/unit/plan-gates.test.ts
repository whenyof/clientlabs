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
  it("STARTER no tiene ai", () => {
    expect(hasFeature("STARTER", "ai")).toBe(false)
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

  it("STARTER tiene leads (base)", () => {
    expect(hasFeature("STARTER", "leads")).toBe(true)
  })

  it("STARTER no tiene automations", () => {
    expect(hasFeature("STARTER", "automations")).toBe(false)
  })

  it("BUSINESS tiene emailMarketing", () => {
    expect(hasFeature("BUSINESS", "emailMarketing")).toBe(true)
  })

  it("PRO tiene emailMarketing", () => {
    expect(hasFeature("PRO", "emailMarketing")).toBe(true)
  })

  it("STARTER tiene verifactu", () => {
    expect(hasFeature("STARTER", "verifactu")).toBe(true)
  })

  it("PRO tiene verifactu", () => {
    expect(hasFeature("PRO", "verifactu")).toBe(true)
  })
})

describe("getLimit", () => {
  it("STARTER maxLeadsTotal es 200", () => {
    expect(getLimit("STARTER", "maxLeadsTotal")).toBe(200)
  })

  it("PRO maxLeadsTotal es Infinity", () => {
    expect(getLimit("PRO", "maxLeadsTotal")).toBe(Infinity)
  })

  it("STARTER maxClients es Infinity", () => {
    expect(getLimit("STARTER", "maxClients")).toBe(Infinity)
  })

  it("BUSINESS maxActiveAutomations es Infinity", () => {
    expect(getLimit("BUSINESS", "maxActiveAutomations")).toBe(Infinity)
  })

  it("STARTER maxActiveAutomations es 0", () => {
    expect(getLimit("STARTER", "maxActiveAutomations")).toBe(0)
  })

  it("PRO maxActiveAutomations es 10", () => {
    expect(getLimit("PRO", "maxActiveAutomations")).toBe(10)
  })

  it("STARTER maxUsers es 1", () => {
    expect(getLimit("STARTER", "maxUsers")).toBe(1)
  })

  it("PRO maxUsers es 5", () => {
    expect(getLimit("PRO", "maxUsers")).toBe(5)
  })

  it("BUSINESS maxUsers es Infinity", () => {
    expect(getLimit("BUSINESS", "maxUsers")).toBe(Infinity)
  })
})

describe("isAtLimit", () => {
  it("STARTER con 200 leads está en el límite", () => {
    expect(isAtLimit("STARTER", "maxLeadsTotal", 200)).toBe(true)
  })

  it("STARTER con 199 leads NO está en el límite", () => {
    expect(isAtLimit("STARTER", "maxLeadsTotal", 199)).toBe(false)
  })

  it("PRO con 10000 leads NO está en el límite", () => {
    expect(isAtLimit("PRO", "maxLeadsTotal", 10_000)).toBe(false)
  })

  it("STARTER con 0 leads NO está en el límite", () => {
    expect(isAtLimit("STARTER", "maxLeadsTotal", 0)).toBe(false)
  })

  it("STARTER con 201 leads supera el límite", () => {
    expect(isAtLimit("STARTER", "maxLeadsTotal", 201)).toBe(true)
  })
})

describe("planAtLeast", () => {
  it("STARTER >= STARTER", () => {
    expect(planAtLeast("STARTER", "STARTER")).toBe(true)
  })

  it("PRO >= STARTER", () => {
    expect(planAtLeast("PRO", "STARTER")).toBe(true)
  })

  it("PRO >= PRO", () => {
    expect(planAtLeast("PRO", "PRO")).toBe(true)
  })

  it("BUSINESS >= PRO", () => {
    expect(planAtLeast("BUSINESS", "PRO")).toBe(true)
  })

  it("STARTER NO >= PRO", () => {
    expect(planAtLeast("STARTER", "PRO")).toBe(false)
  })

  it("STARTER NO >= BUSINESS", () => {
    expect(planAtLeast("STARTER", "BUSINESS")).toBe(false)
  })

  it("PRO NO >= BUSINESS", () => {
    expect(planAtLeast("PRO", "BUSINESS")).toBe(false)
  })
})

describe("requiredPlanFor", () => {
  it("leads requiere STARTER", () => {
    expect(requiredPlanFor("leads")).toBe("STARTER")
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

  it("emailMarketing requiere PRO", () => {
    expect(requiredPlanFor("emailMarketing")).toBe("PRO")
  })

  it("verifactu requiere STARTER", () => {
    expect(requiredPlanFor("verifactu")).toBe("STARTER")
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
