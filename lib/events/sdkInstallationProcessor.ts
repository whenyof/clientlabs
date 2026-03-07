/**
 * SDK installation verification — update SdkInstallation from event stream.
 * Uses upsert for concurrent worker safety.
 */

import { prisma } from "@/lib/prisma"
import type { QueuedEvent } from "./types"
import {
  SDK_INSTALLATION_STATUS,
  EVENT_TYPE_SDK_LOADED,
  EVENT_TYPE_SDK_HEARTBEAT,
  RECEIVING_EVENT_TYPES,
} from "./sdkInstallationConstants"

export async function updateSdkInstallation(event: QueuedEvent): Promise<void> {
  const now = new Date()

  if (event.type === EVENT_TYPE_SDK_LOADED) {
    await prisma.sdkInstallation.upsert({
      where: {
        userId_domain: {
          userId: event.userId,
          domain: event.domain,
        },
      },
      create: {
        userId: event.userId,
        domain: event.domain,
        apiKey: event.apiKey,
        status: SDK_INSTALLATION_STATUS.SCRIPT_DETECTED,
        firstSeenAt: now,
        lastSeenAt: now,
      },
      update: {
        status: SDK_INSTALLATION_STATUS.SCRIPT_DETECTED,
        lastSeenAt: now,
        apiKey: event.apiKey,
      },
    })
    return
  }

  if (event.type === EVENT_TYPE_SDK_HEARTBEAT) {
    await prisma.sdkInstallation.upsert({
      where: {
        userId_domain: {
          userId: event.userId,
          domain: event.domain,
        },
      },
      create: {
        userId: event.userId,
        domain: event.domain,
        apiKey: event.apiKey,
        status: SDK_INSTALLATION_STATUS.SDK_ACTIVE,
        lastSeenAt: now,
      },
      update: {
        status: SDK_INSTALLATION_STATUS.SDK_ACTIVE,
        lastSeenAt: now,
      },
    })
    return
  }

  if (RECEIVING_EVENT_TYPES.has(event.type)) {
    await prisma.sdkInstallation.upsert({
      where: {
        userId_domain: {
          userId: event.userId,
          domain: event.domain,
        },
      },
      create: {
        userId: event.userId,
        domain: event.domain,
        apiKey: event.apiKey,
        status: SDK_INSTALLATION_STATUS.RECEIVING_EVENTS,
        lastSeenAt: now,
        lastEventAt: now,
      },
      update: {
        status: SDK_INSTALLATION_STATUS.RECEIVING_EVENTS,
        lastSeenAt: now,
        lastEventAt: now,
      },
    })
  }
}
