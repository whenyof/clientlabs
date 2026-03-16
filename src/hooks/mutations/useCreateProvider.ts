"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/api/client"
import { optimisticListUpdate } from "../../lib/react-query/optimisticListUpdate"
import { rollbackQuery } from "../../lib/react-query/rollback"
import { createOptimisticId } from "../../lib/utils/createOptimisticId"
import type { CreateProviderInput } from "@/types/mutations"

export function useCreateProvider() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProviderInput) =>
      apiFetch("/api/providers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),

    onMutate: async (provider: CreateProviderInput) => {
      const optimisticProvider = {
        ...provider,
        id: createOptimisticId("provider"),
      }

      return optimisticListUpdate({
        queryClient,
        queryKey: ["providers"],
        newItem: optimisticProvider,
        listKey: "providers",
      })
    },

    onError: (_err, _provider, context) => {
      rollbackQuery({
        queryClient,
        queryKey: ["providers"],
        previousData: context?.previousData,
      })
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["providers"],
      })
    },
  })
}

