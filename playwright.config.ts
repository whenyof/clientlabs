import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://localhost:3005",
    headless: true,
  },
  webServer: {
    command: "npm run dev -- -p 3005",
    port: 3005,
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
