"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/api/client"
import { optimisticListUpdate } from "../../lib/react-query/optimisticListUpdate"
import { rollbackQuery } from "../../lib/react-query/rollback"
import { createOptimisticId } from "../../lib/utils/createOptimisticId"
import type { CreateClientInput } from "@/types/mutations"

export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateClientInput) =>
      apiFetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),

    onMutate: async (client: CreateClientInput) => {
      const optimisticClient = {
        ...client,
        id: createOptimisticId("client"),
      }

      return optimisticListUpdate({
        queryClient,
        queryKey: ["clients"],
        newItem: optimisticClient,
        listKey: "clients",
      })
    },

    onError: (_err, _client, context) => {
      rollbackQuery({
        queryClient,
        queryKey: ["clients"],
        previousData: context?.previousData,
      })
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["clients"],
      })
    },
  })
}

