"use client"

import { useQuery } from "@tanstack/react-query"
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
