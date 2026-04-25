// lib/activity-log.ts
import { Prisma } from "@prisma/client"
import { prisma, safePrismaQuery } from "@/lib/prisma"

type LogParams = {
  workspaceId: string
  userId: string
  action: string
  entity: string
  entityId?: string
  entityLabel?: string
  metadata?: Record<string, unknown>
}

export async function logActivity(params: LogParams) {
  try {
    await safePrismaQuery(() =>
      prisma.activityLog.create({
        data: {
          workspaceId: params.workspaceId,
          userId: params.userId,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId,
          entityLabel: params.entityLabel,
          metadata: params.metadata ? (params.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
        },
      })
    )
  } catch {
    // Fire and forget — never block main operation
  }
}
