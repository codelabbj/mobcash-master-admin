"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { toast } from "react-hot-toast"

export type MySoldePeriod = "today" | "3d" | "7d" | "custom"

export interface MySoldeParams {
  period?: MySoldePeriod
  from?: string
  to?: string
  balance_at?: string
}

export interface MySoldeNetworkRow {
  network_id: number | null
  network_name: string
  deposit_count: number
  withdrawal_count: number
  deposit_amount: number
  withdrawal_amount: number
  tx_count: number
  earnings: number
}

export interface MySoldeAppRow {
  app_id: string | null
  app_name: string
  current_solde: number | null
  deposit_count: number
  withdrawal_count: number
  deposit_amount: number
  withdrawal_amount: number
  tx_count: number
  earnings: number
}

export interface MySoldeResponse {
  period: string
  from: string
  to: string
  commissions: {
    deposit_commission_percent: number
    withdrawal_commission_percent: number
  }
  summary: {
    deposit_count: number
    withdrawal_count: number
    tx_count: number
    deposit_amount: number
    withdrawal_amount: number
    earnings: number
  }
  by_network: MySoldeNetworkRow[]
  by_app: MySoldeAppRow[]
  current_caisses: Array<{
    app_id: string
    app_name: string
    solde: number
    updated_at: string | null
  }>
  balance_at: {
    requested_date: string
    approximate: boolean
    message: string
    apps: Array<{
      app_id: string
      app_name: string
      solde: number | null
      snapshot_at: string | null
      found: boolean
    }>
  } | null
}

export interface MySoldeCommissionsInput {
  deposit_commission_percent?: number
  withdrawal_commission_percent?: number
}

export function useMySolde(params: MySoldeParams) {
  return useQuery({
    queryKey: ["my-solde", params],
    queryFn: async () => {
      const res = await api.get<MySoldeResponse>("/mobcash/my-solde", { params })
      return res.data
    },
  })
}

export function useUpdateMySoldeCommissions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: MySoldeCommissionsInput) => {
      const res = await api.patch<MySoldeCommissionsInput>("/mobcash/my-solde", data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-solde"] })
      toast.success("Commissions mises à jour")
    },
    onError: () => {
      toast.error("Impossible de mettre à jour les commissions")
    },
  })
}
