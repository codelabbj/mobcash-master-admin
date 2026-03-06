"use client"

import type React from "react"
import { useState } from "react"
import { useUpdatePassword } from "@/hooks/useAuth"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react"

interface UpdatePasswordDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function UpdatePasswordDialog({ open, onOpenChange }: UpdatePasswordDialogProps) {
    const updatePassword = useUpdatePassword()
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showOldPassword, setShowOldPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
    const [generalError, setGeneralError] = useState<string | null>(null)

    const resetForm = () => {
        setOldPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setShowOldPassword(false)
        setShowNewPassword(false)
        setShowConfirmPassword(false)
        setValidationErrors({})
        setGeneralError(null)
    }

    const handleClose = (isOpen: boolean) => {
        if (!isOpen) {
            resetForm()
        }
        onOpenChange(isOpen)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const errors: { [key: string]: string } = {}

        if (!oldPassword) {
            errors.old_password = "L'ancien mot de passe est requis"
        }
        if (!newPassword) {
            errors.new_password = "Le nouveau mot de passe est requis"
        }
        if (!confirmPassword) {
            errors.confirm_password = "La confirmation du mot de passe est requise"
        } else if (newPassword !== confirmPassword) {
            errors.confirm_password = "Les mots de passe ne correspondent pas"
        }
        if (oldPassword && newPassword && oldPassword === newPassword) {
            errors.new_password = "Le nouveau mot de passe doit être différent de l'ancien"
        }

        setValidationErrors(errors)

        if (Object.keys(errors).length > 0) {
            return
        }

        updatePassword.mutate(
            { old_password: oldPassword, new_password: newPassword, confirm_new_password: confirmPassword },
            {
                onSuccess: () => {
                    handleClose(false)
                },
                onError: (error: any) => {
                    const data = error?.response?.data
                    if (data && typeof data === "object") {
                        const backendErrors: { [key: string]: string } = {}
                        for (const [key, value] of Object.entries(data)) {
                            if (key === "success") continue
                            if (Array.isArray(value)) {
                                backendErrors[key] = value.join(", ")
                            } else if (typeof value === "string") {
                                backendErrors[key] = value
                            }
                        }
                        // Separate field errors from general errors (details/detail/message)
                        const fieldKeys = ["old_password", "new_password", "confirm_new_password"]
                        const fieldErrors: { [key: string]: string } = {}
                        const generalKeys = ["details", "detail", "message", "error"]
                        let general: string | null = null
                        for (const [k, v] of Object.entries(backendErrors)) {
                            if (fieldKeys.includes(k)) {
                                fieldErrors[k] = v
                            } else if (generalKeys.includes(k)) {
                                general = v
                            }
                        }
                        if (Object.keys(fieldErrors).length > 0) {
                            setValidationErrors(fieldErrors)
                        }
                        if (general) {
                            setGeneralError(general)
                        }
                    }
                },
            }
        )
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent">
                            <ShieldCheck className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle>Modifier le mot de passe</DialogTitle>
                            <DialogDescription>
                                Saisissez votre ancien mot de passe et choisissez un nouveau mot de passe
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 mt-2">
                    {/* General backend error */}
                    {generalError && (
                        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
                            <span className="text-sm text-destructive font-medium">{generalError}</span>
                        </div>
                    )}
                    {/* Old Password */}
                    <div className="space-y-2">
                        <Label htmlFor="old_password" className="text-sm font-semibold">
                            Ancien mot de passe
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="old_password"
                                type={showOldPassword ? "text" : "password"}
                                placeholder="Saisissez votre ancien mot de passe"
                                value={oldPassword}
                                onChange={(e) => {
                                    setOldPassword(e.target.value)
                                    if (validationErrors.old_password) {
                                        setValidationErrors({ ...validationErrors, old_password: "" })
                                    }
                                }}
                                disabled={updatePassword.isPending}
                                className={`h-11 pl-10 pr-12 bg-background/50 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${validationErrors.old_password ? "border-destructive" : ""}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                disabled={updatePassword.isPending}
                            >
                                {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {validationErrors.old_password && (
                            <p className="text-xs text-destructive">{validationErrors.old_password}</p>
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
                                disabled={updatePassword.isPending}
                                className={`h-11 pl-10 pr-12 bg-background/50 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${validationErrors.new_password ? "border-destructive" : ""}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                disabled={updatePassword.isPending}
                            >
                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {validationErrors.new_password && (
                            <p className="text-xs text-destructive">{validationErrors.new_password}</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <Label htmlFor="confirm_password" className="text-sm font-semibold">
                            Confirmer le nouveau mot de passe
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="confirm_password"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirmez votre nouveau mot de passe"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value)
                                    if (validationErrors.confirm_password) {
                                        setValidationErrors({ ...validationErrors, confirm_password: "" })
                                    }
                                }}
                                disabled={updatePassword.isPending}
                                className={`h-11 pl-10 pr-12 bg-background/50 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${validationErrors.confirm_password ? "border-destructive" : ""}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                disabled={updatePassword.isPending}
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {validationErrors.confirm_password && (
                            <p className="text-xs text-destructive">{validationErrors.confirm_password}</p>
                        )}
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleClose(false)}
                            disabled={updatePassword.isPending}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={updatePassword.isPending}
                            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg shadow-primary/25"
                        >
                            {updatePassword.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Mise à jour...
                                </>
                            ) : (
                                "Mettre à jour"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
