"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/api/client"
import { optimisticListUpdate } from "../../lib/react-query/optimisticListUpdate"
import { rollbackQuery } from "../../lib/react-query/rollback"
import { createOptimisticId } from "../../lib/utils/createOptimisticId"
import type { CreateSaleInput } from "@/types/mutations"

export function useCreateSale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSaleInput) =>
      apiFetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),

    onMutate: async (sale: CreateSaleInput) => {
      const optimisticSale = {
        ...sale,
        id: createOptimisticId("sale"),
      }

      return optimisticListUpdate({
        queryClient,
        queryKey: ["sales"],
        newItem: optimisticSale,
        listKey: "sales",
      })
    },

    onError: (_err, _sale, context) => {
      rollbackQuery({
        queryClient,
        queryKey: ["sales"],
        previousData: context?.previousData,
      })
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["sales"],
      })
    },
  })
}

