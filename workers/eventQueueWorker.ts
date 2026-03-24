/**
 * Event queue worker — Run: npm run worker:events
 * Loads .env first, verifies Redis config, then starts the worker loop.
 */

import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)

console.log("🚀 CLIENTLABS WORKER FILE LOADED:", __filename)

import "dotenv/config"

console.log("WORKER REDIS URL:", process.env.UPSTASH_REDIS_REST_URL ?? "(missing)")
console.log("==== ENV DEBUG ====")
console.log("UPSTASH_REDIS_REST_URL:", process.env.UPSTASH_REDIS_REST_URL || "MISSING")
console.log("UPSTASH_REDIS_REST_TOKEN:", process.env.UPSTASH_REDIS_REST_TOKEN ? "LOADED" : "MISSING")
console.log("===================")

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.error("❌ Redis configuration missing.")
  console.error("Expected env vars:")
  console.error("UPSTASH_REDIS_REST_URL")
  console.error("UPSTASH_REDIS_REST_TOKEN")
  process.exit(1)
}

;(async () => {
  const { runLoop, startMetricsLog } = await import("./eventQueueWorkerMain")
  startMetricsLog()
  await runLoop()
})().catch((e) => {
  console.error("[eventQueueWorker] fatal:", e)
  process.exit(1)
})
