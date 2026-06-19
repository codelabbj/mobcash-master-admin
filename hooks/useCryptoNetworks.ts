"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { toast } from "react-hot-toast"
import { AppFile } from "@/lib/types"

// Matches CryptoNetworkSerializer
export interface CryptoNetwork {
  id: number
  created_at: string
  updated_at: string
  name: string
  symbol: string | null
  logo: string | null
  is_active: boolean
  address: string | null
  fee: string | null
  crypto: {
    id: number
    code: string
    name: string | null
    symbol: string | null
    logo: string | null
    sale_adress: string | null
    fee: string | null
    active_for_sale: boolean
    active_for_buy: boolean
  } | null
  crypto_id?: string | null     // write-only on POST/PATCH
}

export type CryptoNetworkInput = {
  name: string
  symbol: string
  logo: string | null
  is_active: boolean
  address: string | null
  fee: string | null
  crypto_id: string | null
}

export function useCryptoNetworks(cryptoId?: number) {
  return useQuery({
    queryKey: ["crypto-networks", cryptoId],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (cryptoId) params.crypto_id = String(cryptoId)
      const res = await api.get<{ results: CryptoNetwork[] } | CryptoNetwork[]>(
        "/mobcash/crypto-network/",
        { params },
      )
      const data = res.data
      return Array.isArray(data) ? data : (data.results ?? [])
    },
  })
}

export function useCreateCryptoNetwork() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ data, file }: { data: CryptoNetworkInput; file?: File }) => {
      if (file) {
        const uploadData = new FormData()
        uploadData.append("file", file)
        const uploadedFile = (await api.post<AppFile>("/mobcash/upload", uploadData)).data
        data.logo = uploadedFile.file
      }
      const res = await api.post<CryptoNetwork>("/mobcash/crypto-network/", data)
      return res.data
    },
    onSuccess: () => {
      toast.success("Réseau crypto créé avec succès!")
      queryClient.invalidateQueries({ queryKey: ["crypto-networks"] })
    },
  })
}

export function useUpdateCryptoNetwork() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
      file,
    }: { id: number; data: Partial<CryptoNetworkInput>; file?: File }) => {
      if (file) {
        const uploadData = new FormData()
        uploadData.append("file", file)
        const uploadedFile = (await api.post<AppFile>("/mobcash/upload", uploadData)).data
        data.logo = uploadedFile.file
      }
      const res = await api.patch<CryptoNetwork>(`/mobcash/crypto-network/${id}/`, data)
      return res.data
    },
    onSuccess: () => {
      toast.success("Réseau crypto mis à jour avec succès!")
      queryClient.invalidateQueries({ queryKey: ["crypto-networks"] })
    },
  })
}

export function useDeleteCryptoNetwork() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/mobcash/crypto-network/${id}/`)
    },
    onSuccess: () => {
      toast.success("Réseau crypto supprimé avec succès!")
      queryClient.invalidateQueries({ queryKey: ["crypto-networks"] })
    },
  })
}
