import { PrismaClient } from "@prisma/client"
const p = new PrismaClient()
async function main() {
  const views = await p.documentView.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    select: { token: true, type: true, status: true, createdAt: true, recipientEmail: true }
  })
  console.log("Últimos DocumentViews:")
  for (const v of views) {
    const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/doc/${v.token}`
    console.log(`  ${v.type} ${v.status} → ${url}`)
    console.log(`    para: ${v.recipientEmail} | creado: ${v.createdAt.toISOString()}`)
  }
}
main().catch(console.error).finally(() => p.$disconnect())
