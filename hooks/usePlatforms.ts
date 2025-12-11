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
}

export interface PlatformFilters {
    search?: string
    enable?: boolean
}


export type PlatformInput = Omit<Platform, "id">

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
            const res = await api.post<Platform>("/mobcash/plateform", data)
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
            const res = await api.put<Platform>(`/mobcash/plateform/${id}`, data)
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
