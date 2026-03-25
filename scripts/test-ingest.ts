import "dotenv/config"
import { createApiKey } from "./create-api-key"

const PORT = 3000
const ORIGIN = `http://localhost:${PORT}`

async function main(): Promise<void> {
  // 1) Create a test API key for localhost
  const { rawKey } = await createApiKey({ domain: "localhost", name: "Test Local" })

  // 2) Call the real ingest endpoint
  const url = `http://localhost:${PORT}/api/v1/ingest`

  const payload = {
    api_key: rawKey,
    events: [
      {
        type: "pageview",
        visitor_id: "550e8400-e29b-41d4-a716-446655440000",
        properties: { url: ORIGIN, path: "/" },
      },
    ],
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: ORIGIN,
      },
      body: JSON.stringify(payload),
    })

    const bodyText = await res.text()

    if (res.status === 200) {
      console.log("✅ Ingest funcionando correctamente")
      return
    }

    if (res.status === 401) {
      console.log("❌ Error de autenticación — revisa la key")
      console.log(bodyText)
      return
    }

    if (res.status === 403) {
      console.log("❌ Error de dominio — revisa el campo domain")
      console.log(bodyText)
      return
    }

    if (res.status === 500) {
      console.log("❌ Error interno — imprime el body completo")
      console.log(bodyText)
      return
    }

    console.log(`❌ Ingest falló con status ${res.status}`)
    console.log(bodyText)
  } catch (e) {
    console.error("❌ Error ejecutando el request a ingest:", e instanceof Error ? e.stack : e)
    process.exit(1)
  }
}

main().catch((e) => {
  console.error("❌ Test ingest failed:", e instanceof Error ? e.stack : e)
  process.exit(1)
})

