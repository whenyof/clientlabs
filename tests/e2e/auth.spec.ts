import { test, expect } from "@playwright/test"

test("página de login carga", async ({ page }) => {
  await page.goto("/auth/login")
  await expect(page.locator("input[type=email], input[name=email]").first()).toBeVisible({
    timeout: 15_000,
  })
})

test("login con credenciales incorrectas muestra error", async ({ page }) => {
  await page.goto("/auth/login")

  await page.locator("input[type=email], input[name=email]").first().fill("noeexiste@test.com")
  await page.locator("input[type=password], input[name=password]").first().fill("wrongpassword123")
  await page.locator("button[type=submit]").first().click()

  // Debe mostrar algún mensaje de error (texto o clase de error)
  await expect(
    page.locator("[role=alert], .error, [data-error], p.text-red, .text-destructive").first()
  ).toBeVisible({ timeout: 10_000 })
})

test("página de registro carga", async ({ page }) => {
  await page.goto("/auth/register")
  await expect(page.locator("input[type=email], input[name=email]").first()).toBeVisible({
    timeout: 15_000,
  })
})

test("rutas de dashboard redirigen a login sin auth", async ({ page }) => {
  await page.goto("/dashboard")
  // Sin sesión debe redirigir al login
  await expect(page).toHaveURL(/login|auth/, { timeout: 10_000 })
})
