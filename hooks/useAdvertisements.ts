"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { toast } from "react-hot-toast"
import { uploadFile } from "@/lib/upload"

export interface Advertisement {
  id: number
  image: string
  enable: boolean
  created_at?: string
  updated_at?: string
}

export interface AdvertisementInput {
  image: string // Now always a string (URL) after upload
  enable: boolean
}

export interface AdvertisementsResponse {
  count: number
  next: string | null
  previous: string | null
  results: Advertisement[]
}

export interface AdvertisementFilters {
  page?: number
  page_size?: number
  enable?: boolean
}

export function useAdvertisements(filters: AdvertisementFilters = {}) {
  return useQuery({
    queryKey: ["advertisements", filters],
    queryFn: async () => {
      const res = await api.get<AdvertisementsResponse | Advertisement[]>("/mobcash/ann", { params: filters })
      // Handle both paginated and non-paginated responses
      if (Array.isArray(res.data)) {
        return {
          count: res.data.length,
          next: null,
          previous: null,
          results: res.data,
        } as AdvertisementsResponse
      }
      return res.data as AdvertisementsResponse
    },
  })
}

export function useCreateAdvertisement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: AdvertisementInput) => {
      // Image is already uploaded and is a URL string
      const res = await api.post<Advertisement>("/mobcash/ann", {
        image: data.image,
        enable: data.enable,
      })
      return res.data
    },
    onSuccess: () => {
      toast.success("Publicité créée avec succès!")
      queryClient.invalidateQueries({ queryKey: ["advertisements"] })
    },
  })
}
export function useUpdateAdvertisement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AdvertisementInput }) => {
      const res = await api.put<Advertisement>(`/mobcash/ann/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      toast.success("Publicité mise à jour avec succès!")
      queryClient.invalidateQueries({ queryKey: ["advertisements"] })
    },
  })
}

export function useDeleteAdvertisement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/mobcash/ann/${id}`)
    },
    onSuccess: () => {
      toast.success("Publicité supprimée avec succès!")
      queryClient.invalidateQueries({ queryKey: ["advertisements"] })
    },
  })
}
