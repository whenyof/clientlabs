import { PrismaClient } from "@prisma/client"
import { INVOICE_TEMPLATES } from "../lib/invoice-templates-catalog"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding invoice templates...")

  for (const t of INVOICE_TEMPLATES) {
    await prisma.invoiceTemplate.upsert({
      where: { slug: t.slug },
      update: {
        name: t.name,
        description: t.description,
        category: t.category,
        price: t.price,
        style: t.style,
        isDefault: t.isDefault ?? false,
        sortOrder: t.sortOrder,
      },
      create: {
        slug: t.slug,
        name: t.name,
        description: t.description,
        category: t.category,
        price: t.price,
        style: t.style,
        isDefault: t.isDefault ?? false,
        sortOrder: t.sortOrder,
      },
    })
    console.log(`  upserted: ${t.slug}`)
  }

  console.log(`Done — ${INVOICE_TEMPLATES.length} templates seeded.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
