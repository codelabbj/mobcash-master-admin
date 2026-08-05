"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { toast } from "react-hot-toast";

export interface Settings {
    id: number
    minimum_deposit: string
    minimum_withdrawal: string
    bonus_percent: string
    reward_mini_withdrawal: string
    whatsapp_phone: string | null
    telegram: string | null
    minimum_solde: string | null
    referral_bonus: boolean
    deposit_reward: boolean
    deposit_reward_percent: string
    min_version: string | null
    last_version: string | null
    dowload_apk_link: string | null
    wave_default_link: string | null
    orange_default_link: string | null
    mtn_default_link: string | null
    moov_marchand_phone: string | null
    orange_marchand_phone: string | null
    mtn_marchand_phone: string | null
    bf_orange_marchand_phone: string | null
    bf_moov_marchand_phone: string | null
    connect_pro_base_url: string | null
    requires_deposit_to_view_coupon: boolean
    minimun_deposit_before_view_coupon: string
    coupon_enable: boolean
    allow_all_users_publish_coupons: boolean
    // Feature toggles
    crypto_enable: boolean
    deposit_enable: boolean
    withdraw_enable: boolean
    // Canaux My Customer / Telegram / SMS
    use_whatsapp: boolean
    use_chatbot: boolean
    use_telegram: boolean
    use_sms: boolean
    openwa_session_id?: string | null
    /** Write-only : jamais renvoyé par le GET admin */
    openwa_token?: string | null
    telegram_bot_username?: string | null
    /** Write-only : jamais renvoyé par le GET admin */
    telegram_bot_token?: string | null
}

export type SettingsInput = Omit<Settings, "id">


export function useSettings() {
    return useQuery({
        queryKey: ["settings"],
        queryFn: async () => {
            const res = await api.get<Settings>("/mobcash/setting")
            return res.data
        },
    })
}

export function useUpdateSettings() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: Partial<SettingsInput>) => {
            // Ne pas écraser les secrets si le champ est laissé vide
            const payload: Record<string, unknown> = { ...data }
            if (!String(payload.openwa_token || "").trim()) {
                delete payload.openwa_token
            }
            if (!String(payload.telegram_bot_token || "").trim()) {
                delete payload.telegram_bot_token
            }
            const res = await api.put<Settings>("/mobcash/setting", payload)
            return res.data
        },
        onSuccess: () => {
            toast.success("Paramètres mis à jour avec succès!")
            queryClient.invalidateQueries({ queryKey: ["settings"] })
        },
    })
}
