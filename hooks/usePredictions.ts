"use client"

import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"

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
