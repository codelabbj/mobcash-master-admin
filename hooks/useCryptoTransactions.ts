"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { toast } from "react-hot-toast"

export interface CryptoTransactionUser {
  id: string
  first_name: string
  last_name: string
  email: string
}

// Nested crypto object returned by TransactionDetailsSerializer.get_crypto()
export interface CryptoDetail {
  id: number
  code: string
  name: string | null
  symbol: string | null
  logo: string | null
  sale_adress: string | null
  fee: string | null
  active_for_sale: boolean
  active_for_buy: boolean
}

// Transaction model fields relevant to crypto (type_trans = "buy" | "sale")
export interface CryptoTransaction {
  id: number
  reference: string
  type_trans: "buy" | "sale"
  amount: number
  // total_crypto — how many units of crypto were involved
  total_crypto: string | null
  status: "pending" | "accept" | "reject" | "timeout" | "init_payment" | "error"
  phone_number: string | null
  user: CryptoTransactionUser | null
  user_app_id: string | null
  app_details: { id: string; name: string; image: string } | null
  network: number | null
  source: string | null
  // For buy: wallet_link holds the buyer's receiving address
  // For sale: hash holds the blockchain TX hash submitted by the user
  wallet_link: string | null
  hash: string | null
  withdriwal_code: string | null
  crypto: CryptoDetail | null
  fee: number
  error_message: string | null
  message: string | null
  created_at: string
  validated_at: string | null
}

export interface CryptoTransactionsResponse {
  count: number
  next: string | null
  previous: string | null
  results: CryptoTransaction[]
}

export interface CryptoTransactionFilters {
  page?: number
  page_size?: number
  search?: string
  status?: string
  type_trans?: string // "buy" | "sale"
}

export function useCryptoTransactions(filters: CryptoTransactionFilters = {}) {
  // Crypto transactions live in the main Transaction model.
  // Fetched via transaction-history with type_trans filter.
  return useQuery({
    queryKey: ["crypto-transactions", filters],
    queryFn: async () => {
      const res = await api.get<CryptoTransactionsResponse>("/mobcash/transaction-history", {
        params: filters,
      })
      const data = res.data
      // If no type filter set, keep only buy/sale client-side as safety net
      if (!filters.type_trans) {
        return {
          ...data,
          results: data.results.filter(
            (t: CryptoTransaction) => t.type_trans === "buy" || t.type_trans === "sale",
          ),
        }
      }
      return data
    },
  })
}

export function useApproveCryptoTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reference: string) => {
      // POST /mobcash/crypto-approve  { reference }
      // - buy:  marks accept + notifies user
      // - sale: triggers payout to user's mobile money
      const res = await api.post("/mobcash/crypto-approve", { reference })
      return res.data
    },
    onSuccess: () => {
      toast.success("Transaction crypto approuvée avec succès!")
      queryClient.invalidateQueries({ queryKey: ["crypto-transactions"] })
    },
  })
}
