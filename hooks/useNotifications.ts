"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { toast } from "react-hot-toast"

export interface Notification {
    id: number
    reference: string | null
    created_at: string
    content: string
    is_read: boolean
    title: string
    user: string
}

export interface NotificationsResponse {
    count: number
    next: string | null
    previous: string | null
    results: Notification[]
}

export type NotificationChannel = "push" | "whatsapp" | "telegram" | "sms" | "all"

export interface SendNotificationInput {
    content: string
    title: string
    user_id: string | number | null
    channel?: NotificationChannel
}

export function useNotifications(page:number) {
    return useQuery({
        queryKey: ["notifications",page],
        queryFn: async () => {
            const res = await api.get<NotificationsResponse>("/mobcash/notification",{params:{page:page}})
            return res.data
        },
    })
}

export function useSendNotification() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: SendNotificationInput) => {
            const url = data.user_id
                ? `/mobcash/notification?user_id=${data.user_id}`
                : `/mobcash/notification`
            const res = await api.post(url, {
                content: data.content,
                title: data.title,
                channel: data.channel ?? "push",
            })
            return res.data
        },
        onSuccess: (_data, variables) => {
            const channel = variables.channel ?? "push"
            const labels: Record<NotificationChannel, string> = {
                push: "Push",
                whatsapp: "WhatsApp",
                telegram: "Telegram",
                sms: "SMS",
                all: "Tous canaux",
            }
            toast.success(`Message ${labels[channel]} envoyé avec succès`)
            queryClient.invalidateQueries({ queryKey: ["notifications"] })
        },
        onError: (error: any) => {
            const details =
                error?.response?.data?.details ||
                error?.response?.data?.detail ||
                "Échec de l'envoi"
            toast.error(String(details))
        },
    })
}
