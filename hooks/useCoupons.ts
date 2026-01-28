"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { toast } from "react-hot-toast"

export interface BetAppDetails {
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
  active_for_deposit: boolean
  active_for_with: boolean
}

export interface Coupon {
  id: number
  created_at: string
  code: string
  bet_app: string
  bet_app_details: BetAppDetails
}

export interface CouponsResponse {
  count: number
  next: string | null
  previous: string | null
  results: Coupon[]
}

export interface CouponInput {
  bet_app: string
  code: string
}

export interface CouponFilters {
  page?: number
  page_size?: number
  search?: string
  bet_app?: string
}

export function useCoupons(filters: CouponFilters = {}) {
  return useQuery({
    queryKey: ["coupons", filters],
    queryFn: async () => {
      const res = await api.get<CouponsResponse>("/mobcash/coupon", { params: filters })
      return res.data
    },
  })
}

export function useCreateCoupon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CouponInput) => {
      const res = await api.post<Coupon>("/mobcash/coupon", data)
      return res.data
    },
    onSuccess: () => {
      toast.success("Coupon créé avec succès!")
      queryClient.invalidateQueries({ queryKey: ["coupons"] })
    },
  })
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CouponInput }) => {
      const res = await api.patch<Coupon>(`/mobcash/coupon/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      toast.success("Coupon mis à jour avec succès!")
      queryClient.invalidateQueries({ queryKey: ["coupons"] })
    },
  })
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/mobcash/coupon/${id}`)
    },
    onSuccess: () => {
      toast.success("Coupon supprimé avec succès!")
      queryClient.invalidateQueries({ queryKey: ["coupons"] })
    },
  })
}

