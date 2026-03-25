import "dotenv/config"
import crypto from "node:crypto"
import { PrismaClient, ApiKeyScope, ApiKeyType } from "@prisma/client"

type ApiKeyKind = "public" | "secret"

export type CreateApiKeyArgs = {
  domain: string
  name?: string
  userId?: string
  type?: ApiKeyKind
}

function normalizeDomain(input: string): string {
  let d = input.trim()
  d = d.replace(/^https?:\/\//i, "")
  d = d.split("/")[0] // remove any trailing path
  d = d.replace(/\/+$/g, "")
  return d
}

function getFlagValue(argv: string[], flag: string): string | undefined {
  const idx = argv.indexOf(flag)
  if (idx === -1) return undefined
  const next = argv[idx + 1]
  if (!next) return undefined
  if (next.startsWith("--")) return undefined
  return next
}

export async function createApiKey(args: CreateApiKeyArgs): Promise<{
  rawKey: string
  createdId: string
  domain: string
  name: string
  type: ApiKeyKind
}> {
  const prisma = new PrismaClient()
  try {
    const domain = normalizeDomain(args.domain)
    const type = (args.type ?? "public") as ApiKeyKind
    const name = args.name?.trim() ? args.name.trim() : `Key para ${domain}`

    const randomHex = crypto.randomBytes(32).toString("hex")
    const prefix = type === "public" ? "cl_pub_" : "cl_sec_"
    const rawKey = `${prefix}${randomHex}`

    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex")

    let userId = args.userId?.trim() || undefined
    if (!userId) {
      const user = await prisma.user.findFirst({
        where: { isActive: true, isBlocked: false },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      })
      if (!user?.id) {
        throw new Error("No activo usuario encontrado en la base de datos.")
      }
      userId = user.id
    }

    const created = await prisma.apiKey.create({
      data: {
        userId,
        keyHash,
        name,
        type: type === "public" ? ApiKeyType.public : ApiKeyType.secret,
        scope: ApiKeyScope.ingest,
        domain,
        revoked: false,
        expiryDate: null,
      },
    })

    return { rawKey, createdId: created.id, domain, name, type }
  } finally {
    await prisma.$disconnect()
  }
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2)

  const domain = getFlagValue(argv, "--domain")
  const name = getFlagValue(argv, "--name")
  const userId = getFlagValue(argv, "--userId")
  const typeRaw = getFlagValue(argv, "--type")?.toLowerCase()

  if (!domain) {
    console.error(
      "Uso: npm run create-key -- --domain <dominio> [--name <nombre>] [--userId <id>] [--type public|secret]"
    )
    process.exit(1)
  }

  const type: ApiKeyKind =
    typeRaw === "secret" || typeRaw === "public" ? typeRaw : ("public" as ApiKeyKind)

  const result = await createApiKey({ domain, name, userId, type })

  console.log("✅ API Key creada correctamente")
  console.log("")
  console.log(`Dominio:     ${result.domain}`)
  console.log(`Nombre:      ${result.name}`)
  console.log(`Tipo:        ${result.type}`)
  console.log(`Key ID:      ${result.createdId}`)
  console.log("")
  console.log("── COPIA ESTA KEY (no se puede recuperar después) ──")
  console.log(result.rawKey)
  console.log("")
  console.log("── SNIPPET PARA INSTALAR EN TU WEB ──")
  console.log(`<script>`)
  console.log(`  window.clientlabsConfig = { key: "${result.rawKey}" };`)
  console.log(`</script>`)
  console.log(`<script async src="/v1/loader.js"></script>`)
}

// Ejecutar solo como script (no al importarlo desde otros scripts).
const isMain =
  process.argv[1]?.endsWith("scripts/create-api-key.ts") || process.argv[1]?.endsWith("create-api-key.ts")

if (isMain) {
  main().catch((e) => {
    console.error("Error creando API key:", e instanceof Error ? e.message : String(e))
    process.exit(1)
  })
}

