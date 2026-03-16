import { PrismaClient } from "@prisma/client"

export const prismaDirect = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_DATABASE_URL,
    },
  },
})

