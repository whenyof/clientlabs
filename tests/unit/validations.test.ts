import { describe, it, expect } from "vitest"
import { emailSchema, nameSchema, contactFormSchema, leadFormSchema, validateInput } from "@/lib/validations"

describe("emailSchema", () => {
  it("email válido pasa", () => {
    expect(emailSchema.safeParse("user@example.com").success).toBe(true)
  })

  it("email sin @ falla", () => {
    expect(emailSchema.safeParse("userexample.com").success).toBe(false)
  })

  it("email vacío falla", () => {
    expect(emailSchema.safeParse("").success).toBe(false)
  })

  it("email con subdominio pasa", () => {
    expect(emailSchema.safeParse("user@mail.empresa.es").success).toBe(true)
  })

  it("email con más de 255 caracteres falla", () => {
    const long = "a".repeat(250) + "@x.com"
    expect(emailSchema.safeParse(long).success).toBe(false)
  })
})

describe("nameSchema", () => {
  it("nombre normal pasa", () => {
    expect(nameSchema.safeParse("Juan García").success).toBe(true)
  })

  it("nombre vacío falla", () => {
    const result = nameSchema.safeParse("")
    expect(result.success).toBe(false)
  })

  it("nombre con >200 chars falla", () => {
    const long = "A".repeat(201)
    expect(nameSchema.safeParse(long).success).toBe(false)
  })

  it("nombre con exactamente 200 chars pasa", () => {
    const exact = "A".repeat(200)
    expect(nameSchema.safeParse(exact).success).toBe(true)
  })

  it("nombre con 1 char pasa", () => {
    expect(nameSchema.safeParse("A").success).toBe(true)
  })
})

describe("contactFormSchema", () => {
  const validContact = {
    name: "Ana López",
    email: "ana@empresa.es",
    subject: "Consulta sobre precios",
    message: "Quiero más información sobre el plan Pro.",
  }

  it("datos válidos pasan", () => {
    expect(contactFormSchema.safeParse(validContact).success).toBe(true)
  })

  it("sin email falla", () => {
    const { email: _e, ...rest } = validContact
    expect(contactFormSchema.safeParse(rest).success).toBe(false)
  })

  it("sin asunto falla", () => {
    const { subject: _s, ...rest } = validContact
    expect(contactFormSchema.safeParse(rest).success).toBe(false)
  })

  it("asunto vacío falla", () => {
    expect(contactFormSchema.safeParse({ ...validContact, subject: "" }).success).toBe(false)
  })
})

describe("leadFormSchema", () => {
  const validLead = {
    name: "Carlos Martínez",
    email: "carlos@pyme.es",
    phone: "+34 600 123 456",
    company: "Martínez Consulting",
  }

  it("lead válido pasa", () => {
    expect(leadFormSchema.safeParse(validLead).success).toBe(true)
  })

  it("email es requerido — sin email falla", () => {
    const { email: _e, ...rest } = validLead
    expect(leadFormSchema.safeParse(rest).success).toBe(false)
  })

  it("sin teléfono pasa (es opcional)", () => {
    const { phone: _p, ...rest } = validLead
    expect(leadFormSchema.safeParse(rest).success).toBe(true)
  })

  it("email inválido falla", () => {
    expect(leadFormSchema.safeParse({ ...validLead, email: "noesemail" }).success).toBe(false)
  })

  it("SQL injection se acepta como string (Prisma lo sanitiza)", () => {
    const sqlPayload = { ...validLead, name: "'; DROP TABLE users;--" }
    const result = leadFormSchema.safeParse(sqlPayload)
    // El schema acepta el string — la protección está en Prisma con template literals
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe("'; DROP TABLE users;--")
    }
  })

  it("nombre vacío falla", () => {
    expect(leadFormSchema.safeParse({ ...validLead, name: "" }).success).toBe(false)
  })
})

describe("validateInput helper", () => {
  it("retorna success:true con data para input válido", () => {
    const result = validateInput(emailSchema, "ok@test.com")
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toBe("ok@test.com")
    }
  })

  it("retorna success:false con error para input inválido", () => {
    const result = validateInput(emailSchema, "noemail")
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(typeof result.error).toBe("string")
      expect(result.error.length).toBeGreaterThan(0)
    }
  })
})
