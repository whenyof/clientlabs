"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/api/client"
import { optimisticListUpdate } from "../../lib/react-query/optimisticListUpdate"
import { rollbackQuery } from "../../lib/react-query/rollback"
import { createOptimisticId } from "../../lib/utils/createOptimisticId"
import type { CreatePaymentInput } from "@/types/mutations"

export function useCreatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePaymentInput) =>
      apiFetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),

    onMutate: async (payment: CreatePaymentInput) => {
      const optimisticPayment = {
        ...payment,
        id: createOptimisticId("payment"),
      }

      return optimisticListUpdate({
        queryClient,
        queryKey: ["payments"],
        newItem: optimisticPayment,
        listKey: "payments",
      })
    },

    onError: (_err, _payment, context) => {
      rollbackQuery({
        queryClient,
        queryKey: ["payments"],
        previousData: context?.previousData,
      })
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["payments"],
      })
    },
  })
}

