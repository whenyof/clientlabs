import { test, expect } from "@playwright/test"

const PREVIEW_KEY = "clientlabs-preview-2026"

test("landing carga sin errores de consola", async ({ page }) => {
  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })

  await page.goto(`/preview?key=${PREVIEW_KEY}`)
  await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 })
  expect(errors).toHaveLength(0)
})

test("título de la página es correcto", async ({ page }) => {
  await page.goto(`/preview?key=${PREVIEW_KEY}`)
  await expect(page).toHaveTitle(/ClientLabs/)
})

test("navbar links de navegación funcionan", async ({ page }) => {
  await page.goto(`/preview?key=${PREVIEW_KEY}`)

  // Click en Precios
  const preciosLink = page.locator('a[href="/precios"]').first()
  await expect(preciosLink).toBeVisible({ timeout: 10_000 })
  await preciosLink.click()
  await expect(page).toHaveURL(/precios/, { timeout: 10_000 })
})

test("página de precios carga", async ({ page }) => {
  await page.goto("/precios")
  await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 15_000 })
  await expect(page).toHaveTitle(/Precios.*ClientLabs|ClientLabs.*Precio/)
})

test("página de producto carga", async ({ page }) => {
  await page.goto("/producto")
  await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 15_000 })
})
