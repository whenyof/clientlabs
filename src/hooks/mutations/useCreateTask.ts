"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/api/client"
import { optimisticListUpdate } from "../../lib/react-query/optimisticListUpdate"
import { rollbackQuery } from "../../lib/react-query/rollback"
import { createOptimisticId } from "../../lib/utils/createOptimisticId"
import type { CreateTaskInput } from "@/types/mutations"

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTaskInput) =>
      apiFetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),

    onMutate: async (task: CreateTaskInput) => {
      const optimisticTask = {
        ...task,
        id: createOptimisticId("task"),
      }

      return optimisticListUpdate({
        queryClient,
        queryKey: ["tasks"],
        newItem: optimisticTask,
        listKey: "tasks",
      })
    },

    onError: (_err, _task, context) => {
      rollbackQuery({
        queryClient,
        queryKey: ["tasks"],
        previousData: context?.previousData,
      })
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      })
    },
  })
}

