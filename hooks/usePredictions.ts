"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { toast } from "react-hot-toast"

export type PredictionOutcome = "pending" | "won" | "lost" | "void"

export interface PredictionTeam {
  id: number
  name: string
  logo: string
}

export interface PredictionCompetition {
  id: number
  slug: string
  name: string
  country: string
  logo: string
  priority: number
}

export interface PredictionAdminRow {
  id: number
  fixture_id: number
  competition: PredictionCompetition
  home: PredictionTeam
  away: PredictionTeam
  status: string
  status_label: string
  kickoff_at: string
  score_home: number | null
  score_away: number | null
  minute: number | null
  p_home: number
  p_draw: number
  p_away: number
  best_market: string
  best_market_label: string
  best_market_prob: number
  confidence_level: "low" | "medium" | "high"
  outcome: PredictionOutcome
  outcome_label: string | null
  prediction_date: string
  round_name: string
  is_published: boolean
  published_at: string
  locked_at: string | null
  settled_at: string | null
  model_version: string | null
}

export interface PredictionsSummary {
  total: number
  won: number
  lost: number
  pending: number
  void: number
  published: number
  win_rate: number | null
}

export interface PredictionsParams {
  date?: string
  from?: string
  to?: string
  outcome?: PredictionOutcome
  competition?: string
  search?: string
  published?: boolean
  page?: number
  page_size?: number
}

export interface PredictionsResponse {
  count: number
  next: string | null
  previous: string | null
  results: PredictionAdminRow[]
  summary: PredictionsSummary
}

export function usePredictions(params: PredictionsParams) {
  return useQuery({
    queryKey: ["predictions", params],
    queryFn: async () => {
      const res = await api.get<PredictionsResponse>("/mobcash/predictions", { params })
      return res.data
    },
  })
}

export interface PredictionUpdateInput {
  best_market?: string
  best_market_label?: string
  best_market_prob?: number
  confidence_level?: "low" | "medium" | "high"
  outcome?: PredictionOutcome
  is_published?: boolean
  p_home?: number
  p_draw?: number
  p_away?: number
  prediction_date?: string
}

export function useUpdatePrediction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PredictionUpdateInput }) => {
      const res = await api.patch<PredictionAdminRow>(`/mobcash/predictions/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predictions"] })
      toast.success("Pronostic mis à jour")
    },
    onError: () => {
      toast.error("Impossible de modifier le pronostic")
    },
  })
}

export function useDeletePrediction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/mobcash/predictions/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predictions"] })
      toast.success("Pronostic supprimé")
    },
    onError: () => {
      toast.error("Impossible de supprimer le pronostic")
    },
  })
}
