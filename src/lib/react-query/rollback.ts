import { QueryClient } from "@tanstack/react-query"

export function rollbackQuery<T>({
 queryClient,
 queryKey,
 previousData
}: {
 queryClient: QueryClient
 queryKey: string[]
 previousData?: T
}) {

 if (!previousData) return

 queryClient.setQueryData(queryKey, previousData)

}