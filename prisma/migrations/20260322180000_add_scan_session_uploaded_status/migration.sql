-- AlterEnum: ScanSessionStatus was created without UPLOADED; align DB with schema.prisma
ALTER TYPE "ScanSessionStatus" ADD VALUE IF NOT EXISTS 'UPLOADED';
