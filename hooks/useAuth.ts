"use client"

import { useMutation } from "@tanstack/react-query"
import api from "@/lib/axios"
import { setAuthTokens, setUserData, clearAuthTokens, type LoginResponse } from "@/lib/auth"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

interface LoginPayload {
  email_or_phone: string
  password: string
}

export function useLogin() {
  const router = useRouter()

  return useMutation({
    mutationFn: async (data: LoginPayload) => {
      const res = await api.post<LoginResponse>("/auth/login", data)
      return res.data
    },
    onSuccess: (data) => {
      setAuthTokens({ access: data.access, refresh: data.refresh })
      setUserData(data.data)
      toast.success("Connexion réussie!")
      // Use window.location for full page reload to ensure cookies are available for middleware
      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 100)
    },
    onError: (error: any) => {
      // Error is already handled by axios interceptor
      console.error("Login error:", error)
    },
  })
}

export function useLogout() {
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      const refresh = localStorage.getItem("refresh_token")
      // Call logout endpoint with optional refresh token
      await api.post("/auth/logout", refresh ? { refresh } : {})
    },
    onSuccess: () => {
      clearAuthTokens()
      toast.success("Déconnexion réussie")
      router.push("/login")
    },
    onError: () => {
      // Even if API call fails, clear tokens locally
      clearAuthTokens()
      router.push("/login")
    },
  })
}

// Update password for logged-in users
interface UpdatePasswordPayload {
  old_password: string
  new_password: string
  confirm_new_password: string
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: async (data: UpdatePasswordPayload) => {
      const res = await api.post("/auth/change_password", data)
      return res.data
    },
    onSuccess: () => {
      toast.success("Mot de passe mis à jour avec succès!")
    },
    onError: (error: any) => {
      console.error("Password update error:", error)
    },
  })
}

// Forget password - Step 1: Request reset code
interface RequestPasswordResetPayload {
  identifier: string
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async (data: RequestPasswordResetPayload) => {
      const res = await api.post("/auth/send_otp", data)
      return res.data
    },
    onSuccess: () => {
      toast.success("Un code de réinitialisation a été envoyé à votre adresse email.")
    },
    onError: (error: any) => {
      console.error("Password reset request error:", error)
    },
  })
}

// Forget password - Step 2: Confirm reset with otp and new password
interface ConfirmPasswordResetPayload {
  identifier: string
  otp: string
  new_password: string
  confirm_new_password: string
}

export function useConfirmPasswordReset() {
  return useMutation({
    mutationFn: async (data: ConfirmPasswordResetPayload) => {
      const res = await api.post("/auth/reset_password", data)
      return res.data
    },
    onSuccess: () => {
      toast.success("Mot de passe réinitialisé avec succès! Veuillez vous connecter.")
    },
    onError: (error: any) => {
      console.error("Password reset confirm error:", error)
    },
  })
}
