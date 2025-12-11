"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { toast } from "react-hot-toast"
import {Platform} from "@/hooks/usePlatforms";

export interface UserAppId {
    id: number
    user_app_id: string
    created_at: string
    user: string | null
    telegram_user: number | null
    app_name: string
    app_details:Platform
}

export type UserAppIdInput = {
    user_app_id: string
    app_name: string
}

export type UserAppIdFilters  = {
    search?: string,
    app_name?: string
}

export function useUserAppIds(filters: UserAppIdFilters) {
    return useQuery({
        queryKey: ["user-app-ids",filters],
        queryFn: async () => {
            let params:UserAppIdFilters = {}
            if (filters.app_name && filters.app_name!=="") params.app_name=filters.app_name
            if (filters.search && filters.search!=="") params.search=filters.search
            const res = await api.get<UserAppId[]>("/mobcash/user-app-id/",{params})
            return res.data
        },
    })
}

export function useCreateUserAppId() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: UserAppIdInput) => {
            const res = await api.post<UserAppId>("/mobcash/user-app-id/", data)
            return res.data
        },
        onSuccess: () => {
            toast.success("User App ID created successfully!")
            queryClient.invalidateQueries({ queryKey: ["user-app-ids"] })
        },
    })
}

export function useUpdateUserAppId() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UserAppIdInput }) => {
            const res = await api.patch<UserAppId>(`/mobcash/user-app-id/${id}/`, data)
            return res.data
        },
        onSuccess: () => {
            toast.success("User App ID updated successfully!")
            queryClient.invalidateQueries({ queryKey: ["user-app-ids"] })
        },
    })
}

export function useDeleteUserAppId() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/mobcash/user-app-id/${id}/`)
        },
        onSuccess: () => {
            toast.success("User App ID deleted successfully!")
            queryClient.invalidateQueries({ queryKey: ["user-app-ids"] })
        },
    })
}
