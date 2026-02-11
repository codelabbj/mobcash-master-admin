"use client"

import { useQuery, useMutation } from "@tanstack/react-query"
import api from "@/lib/axios"

export interface Bonus {
    id: number
    created_at: string
    amount: string
    reason_bonus: string
    transaction: string | null
    user: {
        id: number,
        first_name: string,
        last_name: string,
        email: string,
    }
}

export interface BonusesResponse {
    count: number
    next: string | null
    previous: string | null
    results: Bonus[]
}

export function useBonuses() {
    return useQuery({
        queryKey: ["bonuses"],
        queryFn: async () => {
            const res = await api.get<BonusesResponse>("/mobcash/bonus")
            return res.data
        },
    })
}

export interface CreateBonusPayload {
    email: string
    amount: number
    reason_bonus?: string
    transaction?: number | null
}



export function useCreateBonus() {
    return useMutation({
        mutationFn: async (payload: CreateBonusPayload) => {
            const res = await api.post("mobcash/create-bonus", payload)
            return res.data
        },
    })
}

export interface RewardUserPayload {
    user_app_id: string
    app: number
    source: "mobile" | "web"
}

export function useRewardTransaction() {
    return useMutation({
        mutationFn: async (payload: RewardUserPayload) => {
            const res = await api.post("/mobcash/transaction-reward", payload)
            return res.data
        },
    })
}
