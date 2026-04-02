// Re-export from canonical singleton to guarantee a single PrismaClient instance
export { prisma, default, safeDbCheck, safePrismaQuery } from "@/lib/prisma"
