import { z } from "zod"

// ── Base schemas ─────────────────────────────────────────────────────────────

export const emailSchema = z.string().email("Email no válido").max(255)

export const phoneSchema = z
  .string()
  .regex(/^[+]?[\d\s()-]{6,20}$/, "Teléfono no válido")
  .optional()

export const nameSchema = z.string().min(1, "Nombre requerido").max(200).trim()

export const textSchema = z.string().max(5000).trim()

export const idSchema = z.string().uuid("ID no válido")

// ── Form schemas ──────────────────────────────────────────────────────────────

export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z.string().min(1, "Asunto requerido").max(200).trim(),
  message: textSchema,
})

export const leadFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  company: z.string().max(200).trim().optional(),
  source: z.string().max(100).optional(),
})

export const newsletterSchema = z.object({
  email: emailSchema,
})

// ── Helper ────────────────────────────────────────────────────────────────────

export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data)
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Datos no válidos",
    }
  }
  return { success: true, data: result.data }
}
