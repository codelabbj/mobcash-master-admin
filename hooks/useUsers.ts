"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { toast } from "react-hot-toast"

export interface User {
  id: string
  bonus_available: number
  is_superuser: boolean
  username: string
  first_name: string
  last_name: string
  email: string
  is_delete: boolean
  phone: string
  otp: string | null
  otp_created_at: string | null
  is_block: boolean
  referrer_code: string | null
  referral_code: string
  is_active: boolean
  is_staff: boolean
  is_supperuser: boolean
  date_joined: string
  last_login: string
}

export interface UsersResponse {
  count: number
  next: string | null
  previous: string | null
  results: User[]
}

interface UsersParams {
  search?: string
  is_block?: boolean
}

export function useUsers(params: UsersParams = {}) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: async () => {
      const res = await api.get<UsersResponse>("/auth/users", { params })
      return res.data
    },
  })
}

export function useBlockUnblockUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, isBlocked }: { userId: string; isBlocked: boolean }) => {
      const endpoint = isBlocked ? `/auth/users/block/deblock` : `/auth/users/block/block`
      const res = await api.post(endpoint, { user_id: userId })
      return res.data
    },
    onSuccess: (data) => {
      if (data.blocked) {
        toast.success("Utilisateur bloqué avec succès !")
      } else {
        toast.success("Utilisateur débloqué avec succès !")
      }
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

