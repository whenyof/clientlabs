"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/api/client"
import { optimisticListUpdate } from "../../lib/react-query/optimisticListUpdate"
import { rollbackQuery } from "../../lib/react-query/rollback"
import { createOptimisticId } from "../../lib/utils/createOptimisticId"
import type { CreateLeadInput } from "@/types/mutations"

export function useCreateLead() {

 const queryClient = useQueryClient()

 return useMutation({

  mutationFn: (data: CreateLeadInput) =>
   apiFetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
   }),

  onMutate: async (newLead: CreateLeadInput) => {

   const optimisticLead = {
    ...newLead,
    id: createOptimisticId("lead")
   }

   return optimisticListUpdate({
    queryClient,
    queryKey: ["leads"],
    newItem: optimisticLead,
    listKey: "leads"
   })

  },

  onError: (_err, _lead, context) => {

   rollbackQuery({
    queryClient,
    queryKey: ["leads"],
    previousData: context?.previousData
   })

  },

  onSettled: () => {

   queryClient.invalidateQueries({
    queryKey: ["leads"]
   })

  }

 })

}