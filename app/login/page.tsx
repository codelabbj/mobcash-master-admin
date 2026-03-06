"use client"

import type React from "react"

import { useState } from "react"
import { useLogin, useRequestPasswordReset, useConfirmPasswordReset } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff, ArrowLeft, Mail, KeyRound, Lock } from "lucide-react"
import Image from "next/image"
import { CONFIG } from "@/lib/config"

const logoSrc = CONFIG.APP_LOGO_URL || "/logo.png"

type PageView = "login" | "forgot-step1" | "forgot-step2"

export default function LoginPage() {
  const [emailOrPhone, setEmailOrPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const login = useLogin()

  // Forget password state
  const [view, setView] = useState<PageView>("login")
  const [resetIdentifier, setResetIdentifier] = useState("")
  const [resetCode, setResetCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
  const [generalError, setGeneralError] = useState<string | null>(null)

  const requestReset = useRequestPasswordReset()
  const confirmReset = useConfirmPasswordReset()

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login.mutate({ email_or_phone: emailOrPhone, password })
  }

  const handleResetRequest = (e: React.FormEvent) => {
    e.preventDefault()
    const errors: { [key: string]: string } = {}
    if (!resetIdentifier) {
      errors.identifier = "L'email ou le nom d'utilisateur est requis"
    }
    setValidationErrors(errors)
    if (Object.keys(errors).length > 0) return

    requestReset.mutate(
      { identifier: resetIdentifier },
      {
        onSuccess: () => {
          setView("forgot-step2")
          setValidationErrors({})
          setGeneralError(null)
        },
        onError: (error: any) => {
          const data = error?.response?.data
          if (data && typeof data === "object") {
            const fieldErrors: { [key: string]: string } = {}
            const generalKeys = ["details", "detail", "message", "error"]
            let general: string | null = null
            for (const [key, value] of Object.entries(data)) {
              if (key === "success") continue
              const str = Array.isArray(value) ? value.join(", ") : typeof value === "string" ? value : null
              if (!str) continue
              if (generalKeys.includes(key)) { general = str } else { fieldErrors[key] = str }
            }
            if (Object.keys(fieldErrors).length > 0) setValidationErrors(fieldErrors)
            if (general) setGeneralError(general)
          }
        },
      }
    )
  }

  const handleResetConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    const errors: { [key: string]: string } = {}
    if (!resetCode) {
      errors.otp = "Le code OTP est requis"
    }
    if (!newPassword) {
      errors.new_password = "Le nouveau mot de passe est requis"
    }
    if (!confirmPassword) {
      errors.confirm_new_password = "La confirmation du mot de passe est requise"
    } else if (newPassword !== confirmPassword) {
      errors.confirm_new_password = "Les mots de passe ne correspondent pas"
    }
    setValidationErrors(errors)
    if (Object.keys(errors).length > 0) return

    confirmReset.mutate(
      { identifier: resetIdentifier, otp: resetCode, new_password: newPassword, confirm_new_password: confirmPassword },
      {
        onSuccess: () => {
          setView("login")
          setResetIdentifier("")
          setResetCode("")
          setNewPassword("")
          setConfirmPassword("")
          setValidationErrors({})
          setGeneralError(null)
        },
        onError: (error: any) => {
          const data = error?.response?.data
          if (data && typeof data === "object") {
            const fieldKeys = ["otp", "new_password", "confirm_new_password", "identifier"]
            const fieldErrors: { [key: string]: string } = {}
            const generalKeys = ["details", "detail", "message", "error"]
            let general: string | null = null
            for (const [key, value] of Object.entries(data)) {
              if (key === "success") continue
              const str = Array.isArray(value) ? value.join(", ") : typeof value === "string" ? value : null
              if (!str) continue
              if (fieldKeys.includes(key)) { fieldErrors[key] = str }
              else if (generalKeys.includes(key)) { general = str }
            }
            if (Object.keys(fieldErrors).length > 0) setValidationErrors(fieldErrors)
            if (general) setGeneralError(general)
          }
        },
      }
    )
  }

  const goBackToLogin = () => {
    setView("login")
    setResetIdentifier("")
    setResetCode("")
    setNewPassword("")
    setConfirmPassword("")
    setValidationErrors({})
    setGeneralError(null)
  }

  // ------- Render the right-side form based on view -------
  const renderForm = () => {
    if (view === "forgot-step1") {
      return (
        <>
          <div className="mb-8 text-center lg:text-left">
            <button
              type="button"
              onClick={goBackToLogin}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
            </button>
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Mot de passe oublié
            </h2>
            <p className="text-muted-foreground">
              Saisissez votre email ou nom d&apos;utilisateur pour recevoir un code de réinitialisation
            </p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleResetRequest} className="space-y-6">
              {/* General backend error */}
              {generalError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
                  <p className="text-sm text-destructive font-medium">{generalError}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="reset_identifier" className="text-sm font-semibold">
                  Email ou Nom d&apos;utilisateur
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset_identifier"
                    type="text"
                    placeholder="john.doe@example.com"
                    value={resetIdentifier}
                    onChange={(e) => {
                      setResetIdentifier(e.target.value)
                      if (validationErrors.identifier) {
                        setValidationErrors({ ...validationErrors, identifier: "" })
                      }
                    }}
                    required
                    disabled={requestReset.isPending}
                    className={`h-12 pl-10 bg-background/50 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${validationErrors.identifier ? "border-destructive" : ""}`}
                  />
                </div>
                {validationErrors.identifier && (
                  <p className="text-xs text-destructive">{validationErrors.identifier}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                disabled={requestReset.isPending}
              >
                {requestReset.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-5 w-5" />
                    Envoyer le code
                  </>
                )}
              </Button>
            </form>
          </div>
        </>
      )
    }

    if (view === "forgot-step2") {
      return (
        <>
          <div className="mb-8 text-center lg:text-left">
            <button
              type="button"
              onClick={() => { setView("forgot-step1"); setValidationErrors({}) }}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Modifier l&apos;identifiant
            </button>
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Nouveau mot de passe
            </h2>
            <p className="text-muted-foreground">
              Saisissez le code reçu par email et votre nouveau mot de passe
            </p>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium">
              <Mail className="h-3.5 w-3.5" />
              {resetIdentifier}
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleResetConfirm} className="space-y-5">
              {/* General backend error */}
              {generalError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
                  <p className="text-sm text-destructive font-medium">{generalError}</p>
                </div>
              )}
              {/* Reset Code */}
              <div className="space-y-2">
                <Label htmlFor="reset_code" className="text-sm font-semibold">
                  Code de réinitialisation
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset_code"
                    type="text"
                    placeholder="123456"
                    value={resetCode}
                    onChange={(e) => {
                      setResetCode(e.target.value)
                      if (validationErrors.otp) {
                        setValidationErrors({ ...validationErrors, otp: "" })
                      }
                    }}
                    required
                    disabled={confirmReset.isPending}
                    className={`h-12 pl-10 bg-background/50 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all tracking-widest font-mono text-lg ${validationErrors.otp ? "border-destructive" : ""}`}
                  />
                </div>
                {validationErrors.otp && (
                  <p className="text-xs text-destructive">{validationErrors.otp}</p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new_password" className="text-sm font-semibold">
                  Nouveau mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="new_password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Saisissez votre nouveau mot de passe"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value)
                      if (validationErrors.new_password) {
                        setValidationErrors({ ...validationErrors, new_password: "" })
                      }
                    }}
                    required
                    disabled={confirmReset.isPending}
                    className={`h-12 pl-10 pr-12 bg-background/50 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${validationErrors.new_password ? "border-destructive" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                    disabled={confirmReset.isPending}
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {validationErrors.new_password && (
                  <p className="text-xs text-destructive">{validationErrors.new_password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm_new_password" className="text-sm font-semibold">
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm_new_password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmez votre mot de passe"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (validationErrors.confirm_new_password) {
                        setValidationErrors({ ...validationErrors, confirm_new_password: "" })
                      }
                    }}
                    required
                    disabled={confirmReset.isPending}
                    className={`h-12 pl-10 pr-12 bg-background/50 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${validationErrors.confirm_new_password ? "border-destructive" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                    disabled={confirmReset.isPending}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {validationErrors.confirm_new_password && (
                  <p className="text-xs text-destructive">{validationErrors.confirm_new_password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                disabled={confirmReset.isPending}
              >
                {confirmReset.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Réinitialisation...
                  </>
                ) : (
                  "Réinitialiser le mot de passe"
                )}
              </Button>
            </form>
          </div>
        </>
      )
    }

    // Default: Login form
    return (
      <>
        <div className="mb-8 text-center lg:text-left">
          <div className="inline-flex items-center justify-center w-20 h-16 rounded-xl bg-gradient-to-br from-primary to-accent mb-4 lg:hidden">
            <Image
              src={logoSrc}
              alt="logo"
              width={80}
              height={80}
              className="w-20 h-20 rounded-lg border-white/20 mb-6"
            />
          </div>
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Connexion
          </h2>
          <p className="text-muted-foreground">Accédez à votre tableau de bord administrateur</p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email_or_phone" className="text-sm font-semibold">
                Email ou Téléphone
              </Label>
              <div className="relative">
                <Input
                  id="email_or_phone"
                  type="text"
                  placeholder="john.doe@example.com ou 2250700000003"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  required
                  disabled={login.isPending}
                  className="h-12 bg-background/50 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">
                Mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Saisissez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={login.isPending}
                  className="h-12 pr-12 bg-background/50 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                  disabled={login.isPending}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setView("forgot-step1")}
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
              disabled={login.isPending}
            >
              {login.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  Se connecter
                </>
              )}
            </Button>
          </form>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual Design */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-accent to-primary/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20"></div>

        {/* Animated background elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full">
          <div className="mb-8">
            <Image
              src={logoSrc}
              alt="logo"
              width={80}
              height={80}
              className="w-20 h-20 rounded-lg border-white/20 mb-6"
            />
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              {CONFIG.APP_NAME}
            </h1>
            <p className="text-xl text-white/90 max-w-md">
              Plateforme d&apos;administration sécurisée pour gérer votre écosystème financier
            </p>
          </div>

          <div className="mt-12 space-y-4 w-full max-w-md">
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-2 h-2 rounded-full bg-white/60"></div>
              <span>Interface moderne et intuitive</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-2 h-2 rounded-full bg-white/60"></div>
              <span>Sécurité renforcée</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-2 h-2 rounded-full bg-white/60"></div>
              <span>Gestion complète en temps réel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Dynamic Form */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="w-full max-w-md">
          {renderForm()}
        </div>
      </div>
    </div>
  )
}
