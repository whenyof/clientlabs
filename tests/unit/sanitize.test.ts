import { describe, it, expect } from "vitest"
import { sanitizeHtml, sanitizeInput, stripScripts } from "@/lib/sanitize"

describe("sanitizeHtml", () => {
  it("escapa tags script", () => {
    const result = sanitizeHtml("<script>alert('xss')</script>")
    expect(result).not.toContain("<script>")
    expect(result).not.toContain("</script>")
    expect(result).toContain("&lt;script&gt;")
  })

  it("escapa img con onerror", () => {
    const result = sanitizeHtml('<img onerror="alert(1)">')
    expect(result).not.toContain("<img")
    expect(result).toContain("&lt;img")
  })

  it("escapa javascript: protocol", () => {
    const result = sanitizeHtml("javascript:alert(1)")
    // El texto queda pero < > " ' / están escapados
    expect(result).not.toContain("<")
    expect(result).not.toContain(">")
  })

  it("texto normal no cambia caracteres normales", () => {
    const input = "Hola mundo"
    const result = sanitizeHtml(input)
    expect(result).toBe("Hola mundo")
  })

  it("string vacío no produce error", () => {
    expect(() => sanitizeHtml("")).not.toThrow()
    expect(sanitizeHtml("")).toBe("")
  })

  it("escapa comillas dobles", () => {
    const result = sanitizeHtml('"valor"')
    expect(result).toContain("&quot;")
    expect(result).not.toContain('"')
  })

  it("escapa comillas simples", () => {
    const result = sanitizeHtml("it's")
    expect(result).toContain("&#x27;")
  })

  it("escapa ampersand", () => {
    const result = sanitizeHtml("A & B")
    expect(result).toContain("&amp;")
    expect(result).not.toBe("A & B")
  })
})

describe("sanitizeInput", () => {
  it("sanitiza strings directamente", () => {
    const result = sanitizeInput("<b>bold</b>")
    expect(result).not.toContain("<b>")
  })

  it("sanitiza propiedades de un objeto", () => {
    const result = sanitizeInput({ name: "<script>xss</script>", value: "ok" })
    expect(result.name).not.toContain("<script>")
    expect(result.value).toBe("ok")
  })

  it("sanitiza arrays de strings", () => {
    const result = sanitizeInput(["<img>", "normal"])
    expect(result[0]).not.toContain("<img>")
    expect(result[1]).toBe("normal")
  })

  it("pasa números sin cambios", () => {
    expect(sanitizeInput(42)).toBe(42)
  })

  it("pasa null/undefined sin error", () => {
    expect(() => sanitizeInput(null)).not.toThrow()
    expect(() => sanitizeInput(undefined)).not.toThrow()
  })
})

describe("stripScripts", () => {
  it("elimina tags script completos", () => {
    const result = stripScripts('<script>alert("xss")</script>texto')
    expect(result).not.toContain("<script>")
    expect(result).toContain("texto")
  })

  it("elimina atributos on*", () => {
    const result = stripScripts('<div onclick="alert(1)">content</div>')
    expect(result).not.toContain('onclick="alert(1)"')
  })

  it("texto limpio no cambia", () => {
    const clean = "Texto limpio sin scripts"
    expect(stripScripts(clean)).toBe(clean)
  })
})
