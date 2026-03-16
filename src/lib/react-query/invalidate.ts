import type { QueryClient } from "@tanstack/react-query"

export function invalidateEntity(queryClient: QueryClient, key: string) {
  queryClient.invalidateQueries({
    queryKey: [key],
  })
}

