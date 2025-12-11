import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"

export interface DashboardStatsResponse {
    dashboard_stats: {
        total_users: number
        active_users: number
        inactive_users: number
        total_bonus: number
        bot_stats: {
            total_transactions: number
            total_deposits: number
            total_withdrawals: number
            total_users: number
        }
        total_transactions: number
        transactions_by_app: Record<
            string,
            {
                count: number
                total_amount: number
            }
        >
        balance_bizao: number
        deposits_bizao: {
            count: number
            amount: number
        }
        withdrawals_bizao: {
            count: number
            amount: number
        }
        rewards: {
            total: number
        }
        disbursements: {
            count: number
            amount: number
        }
        advertisements: {
            total: number
            active: number
        }
        coupons: {
            total: number
            active: number
        }
    }
    volume_transactions: {
        deposits: {
            total_amount: number
            total_count: number
        }
        withdrawals: {
            total_amount: number
            total_count: number
        }
        net_volume: number
        evolution: {
            daily: Array<{
                date: string
                type_trans: string
                total_amount: number
                count: number
            }>
            weekly: Array<{
                week: string
                type_trans: string
                total_amount: number
                count: number
            }>
            monthly: Array<{
                month: string
                type_trans: string
                total_amount: number
                count: number
            }>
            yearly: Array<{
                year: string
                type_trans: string
                total_amount: number
                count: number
            }>
        }
    }
    user_growth: {
        new_users: {
            daily: Array<{
                date: string
                count: number
            }>
            weekly: Array<{
                week: string
                count: number
            }>
            monthly: Array<{
                month: string
                count: number
            }>
        }
        active_users_count: number
        users_by_source: Array<{
            source: string
            count: number
        }>
        status: {
            blocked: number
            active: number
            inactive: number
        }
    }
    referral_system: {
        parrainages_count: number
        total_referral_bonus: number
        top_referrers: Array<{
            [key: string]: unknown
        }>
        activation_rate: number
    }
}

export function useDashboardStats() {
    return useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: async () => {
            const res = await api.get<DashboardStatsResponse>("/mobcash/statistics")
            return res.data
        },
    })
}
