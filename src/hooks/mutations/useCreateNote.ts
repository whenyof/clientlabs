"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/api/client"
import { optimisticListUpdate } from "../../lib/react-query/optimisticListUpdate"
import { rollbackQuery } from "../../lib/react-query/rollback"
import { createOptimisticId } from "../../lib/utils/createOptimisticId"
import type { CreateNoteInput } from "@/types/mutations"

export function useCreateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateNoteInput) =>
      apiFetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),

    onMutate: async (note: CreateNoteInput) => {
      const optimisticNote = {
        ...note,
        id: createOptimisticId("note"),
      }

      return optimisticListUpdate({
        queryClient,
        queryKey: ["notes"],
        newItem: optimisticNote,
        listKey: "notes",
      })
    },

    onError: (_err, _note, context) => {
      rollbackQuery({
        queryClient,
        queryKey: ["notes"],
        previousData: context?.previousData,
      })
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["notes"],
      })
    },
  })
}

