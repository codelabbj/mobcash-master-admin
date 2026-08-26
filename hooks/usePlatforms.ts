"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { toast } from "react-hot-toast"
import {AppFile} from "@/lib/types";

export interface Platform {
    id: string
    name: string
    image: string
    enable: boolean
    active_for_deposit: boolean
    active_for_with: boolean
    deposit_tuto_link: string | null
    withdrawal_tuto_link: string | null
    why_withdrawal_fail: string | null
    order: number | null
    city: string | null
    street: string | null
    minimun_deposit: number
    max_deposit: number
    minimun_with: number
    max_win: number
    manual_processing: boolean
    hash?: string | null
    cashdeskid?: string | null
    cashierpass?: string | null
    /** Write-only — envoyer pour sauvegarder, jamais renvoyé en clair */
    betmomo_token?: string | null
    betmomo_email?: string | null
    betmomo_password?: string | null
    uses_betmomo?: boolean
    has_betmomo_token?: boolean
}

export interface PlatformFilters {
    search?: string
    enable?: boolean
}


export type PlatformInput = Omit<Platform, "id" | "uses_betmomo" | "has_betmomo_token">

function stripEmptySecrets(data: Partial<PlatformInput>) {
    const payload: any = { ...data }
    if (!data.hash || data.hash.trim() === '') delete payload.hash
    if (!data.cashdeskid || data.cashdeskid.trim() === '') delete payload.cashdeskid
    if (!data.cashierpass || data.cashierpass.trim() === '') delete payload.cashierpass
    // Secrets BetMomo : vide = ne pas écraser la valeur actuelle
    if (!data.betmomo_token || data.betmomo_token.trim() === '') delete payload.betmomo_token
    if (!data.betmomo_email || data.betmomo_email.trim() === '') delete payload.betmomo_email
    if (!data.betmomo_password || data.betmomo_password.trim() === '') delete payload.betmomo_password
    return payload
}

export function usePlatforms(filters: PlatformFilters) {
    return useQuery({
        queryKey: ["platforms",filters],
        queryFn: async () => {
            const params: Record<string, string | number|boolean> = {}
            if (filters.search) params.search = filters.search
            if (filters.enable !== undefined) params.enable = filters.enable
            const res = await api.get<Platform[]>("/mobcash/plateform",{params})
            return res.data
        },
    })
}

export function useCreatePlatform() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({data,file}:{data:PlatformInput,file?:File}) => {
            if (file) {
                const uploadData = new FormData();
                uploadData.append("file", file);
                const uploadedFile = (await api.post<AppFile>('/mobcash/upload', uploadData)).data
                data.image = uploadedFile.file
            }
            const payload = stripEmptySecrets(data)

            const res = await api.post<Platform>("/mobcash/plateform", payload)
            return res.data
        },
        onSuccess: () => {
            toast.success("Plateforme créée avec succès!")
            queryClient.invalidateQueries({ queryKey: ["platforms"] })
        },
    })
}

export function useUpdatePlatform() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<PlatformInput> }) => {
            const payload = stripEmptySecrets(data)

            const res = await api.put<Platform>(`/mobcash/plateform/${id}`, payload)
            return res.data
        },
        onSuccess: () => {
            toast.success("Plateforme mise à jour avec succès!")
            queryClient.invalidateQueries({ queryKey: ["platforms"] })
        },
    })
}

export function useDeletePlatform() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/mobcash/plateform/${id}`)
        },
        onSuccess: () => {
            toast.success("Plateforme supprimée avec succès!")
            queryClient.invalidateQueries({ queryKey: ["platforms"] })
        },
    })
}
