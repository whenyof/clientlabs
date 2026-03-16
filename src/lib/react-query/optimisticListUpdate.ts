import type { QueryClient } from "@tanstack/react-query"

export interface OptimisticContext<T> {
  previousData?: T
}

export async function optimisticListUpdate<T extends { id: string }>({
  queryClient,
  queryKey,
  newItem,
  listKey,
}: {
  queryClient: QueryClient
  queryKey: string[]
  newItem: T
  listKey: string
}): Promise<OptimisticContext<unknown>> {
  await queryClient.cancelQueries({ queryKey })

  const previousData = queryClient.getQueryData(queryKey)

  queryClient.setQueryData(queryKey, (old: unknown) => {
    if (!old || typeof old !== "object") {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[optimisticListUpdate] No cache object found for queryKey ${queryKey.join("/")}`,
        )
      }
      return old
    }

    const record = old as Record<string, unknown>

    const list = record[listKey]

    if (!Array.isArray(list)) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[optimisticListUpdate] Expected "${listKey}" to be an array but received`,
          list,
        )
      }
      return old
    }

    return {
      ...record,
      [listKey]: [...list, newItem],
    }
  })

  return { previousData }
}
