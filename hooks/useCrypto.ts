"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { toast } from "react-hot-toast"
import { AppFile } from "@/lib/types"

// Matches CryptocurrencySerializerV2 — the endpoint the admin uses (crypto/v2)
// Same Cryptocurrency model but exposed with buy_price / sale_price
export interface Crypto {
  id: number
  created_at: string
  updated_at: string
  logo: string | null
  code: string                  // CoinGecko slug (e.g. "bitcoin")
  name: string | null
  symbol: string | null
  sale_adress: string | null   // backend typo — one 'd'
  fee: string | null
  minimun_buy: number | null
  max_buy: number | null
  minimun_sale: number | null
  max_sale: number | null
  buy_price: number | null      // fixed admin price per unit (FCFA) for V2
  sale_price: number | null     // fixed admin price per unit (FCFA) for V2
  active_for_sale: boolean
  active_for_buy: boolean
}

export type CryptoInput = Omit<Crypto, "id" | "created_at" | "updated_at">

export function useCryptos() {
  return useQuery({
    queryKey: ["cryptos"],
    queryFn: async () => {
      const res = await api.get<{ results: Crypto[] } | Crypto[]>("/mobcash/crypto/v2")
      const data = res.data
      return Array.isArray(data) ? data : (data.results ?? [])
    },
  })
}

export function useCreateCrypto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ data, file }: { data: Partial<CryptoInput>; file?: File }) => {
      if (file) {
        const uploadData = new FormData()
        uploadData.append("file", file)
        const uploadedFile = (await api.post<AppFile>("/mobcash/upload", uploadData)).data
        data.logo = uploadedFile.file
      }
      const res = await api.post<Crypto>("/mobcash/crypto/v2", data)
      return res.data
    },
    onSuccess: () => {
      toast.success("Cryptomonnaie créée avec succès!")
      queryClient.invalidateQueries({ queryKey: ["cryptos"] })
    },
  })
}

export function useUpdateCrypto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data, file }: { id: number; data: Partial<CryptoInput>; file?: File }) => {
      if (file) {
        const uploadData = new FormData()
        uploadData.append("file", file)
        const uploadedFile = (await api.post<AppFile>("/mobcash/upload", uploadData)).data
        data.logo = uploadedFile.file
      }
      const res = await api.patch<Crypto>(`/mobcash/crypto/v2/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      toast.success("Cryptomonnaie mise à jour avec succès!")
      queryClient.invalidateQueries({ queryKey: ["cryptos"] })
    },
  })
}

export function useDeleteCrypto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/mobcash/crypto/v2/${id}`)
    },
    onSuccess: () => {
      toast.success("Cryptomonnaie supprimée avec succès!")
      queryClient.invalidateQueries({ queryKey: ["cryptos"] })
    },
  })
}
