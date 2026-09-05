"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { toast } from "react-hot-toast"

export interface CancellationDebtEvent {
  id: number
  created_at: string
  event_type: string
  amount: number
  reference?: string | null
  message?: string | null
  transaction?: string | null
}

export interface CancellationDebtBlacklist {
  id: number
  created_at: string
  updated_at: string
  debt_amount: number
  user_ids: string[]
  phones: string[]
  bet_app_ids: string[]
  cancelled_references: string[]
  last_message?: string | null
  is_active: boolean
  events?: CancellationDebtEvent[]
}

export type BlacklistParams = {
  search?: string
  page?: number
  page_size?: number
}

type PaginatedBlacklist = {
  count: number
  next: string | null
  previous: string | null
  results: CancellationDebtBlacklist[]
}

export function useCancellationDebtBlacklist(params: BlacklistParams = {}) {
  return useQuery({
    queryKey: ["cancellation-debt-blacklist", params],
    queryFn: async () => {
      const res = await api.get<PaginatedBlacklist | CancellationDebtBlacklist[]>(
        "/mobcash/cancellation-debt-blacklist",
        { params },
      )
      if (Array.isArray(res.data)) {
        return {
          count: res.data.length,
          next: null,
          previous: null,
          results: res.data,
        } as PaginatedBlacklist
      }
      return res.data
    },
  })
}

export function useDeleteCancellationDebtBlacklist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/mobcash/cancellation-debt-blacklist/${id}`)
    },
    onSuccess: () => {
      toast.success("Entrée retirée de la liste noire")
      queryClient.invalidateQueries({ queryKey: ["cancellation-debt-blacklist"] })
    },
    onError: () => {
      toast.error("Erreur lors de la suppression")
    },
  })
}
