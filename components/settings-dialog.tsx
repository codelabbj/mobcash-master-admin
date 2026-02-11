"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSettings, useUpdateSettings, type SettingsInput } from "@/hooks/useSettings"
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
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { data: settings, isLoading } = useSettings()
  const updateSettings = useUpdateSettings()
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
  const [formData, setFormData] = useState<SettingsInput>({
    minimum_deposit: "",
    minimum_withdrawal: "",
    bonus_percent: "",
    reward_mini_withdrawal: "",
    whatsapp_phone: null,
    telegram: null,
    minimum_solde: null,
    referral_bonus: false,
    deposit_reward: false,
    deposit_reward_percent: "",
    min_version: null,
    last_version: null,
    dowload_apk_link: null,
    wave_default_link: null,
    orange_default_link: null,
    mtn_default_link: null,
    moov_marchand_phone: null,
    orange_marchand_phone: null,
    bf_orange_marchand_phone: null,
    bf_moov_marchand_phone: null,
    connect_pro_base_url: null,
    requires_deposit_to_view_coupon: false,
    minimun_deposit_before_view_coupon: "",
  })

  useEffect(() => {
    if (settings) {
      setFormData({
        minimum_deposit: settings.minimum_deposit || "",
        minimum_withdrawal: settings.minimum_withdrawal || "",
        bonus_percent: settings.bonus_percent || "",
        reward_mini_withdrawal: settings.reward_mini_withdrawal || "",
        whatsapp_phone: settings.whatsapp_phone || null,
        telegram: settings.telegram || null,
        minimum_solde: settings.minimum_solde || null,
        referral_bonus: settings.referral_bonus,
        deposit_reward: settings.deposit_reward,
        deposit_reward_percent: settings.deposit_reward_percent || "",
        min_version: settings.min_version || null,
        last_version: settings.last_version || null,
        dowload_apk_link: settings.dowload_apk_link || null,
        wave_default_link: settings.wave_default_link || null,
        orange_default_link: settings.orange_default_link || null,
        mtn_default_link: settings.mtn_default_link || null,
        moov_marchand_phone: settings.moov_marchand_phone || null,
        orange_marchand_phone: settings.orange_marchand_phone || null,
        bf_orange_marchand_phone: settings.bf_orange_marchand_phone || null,
        bf_moov_marchand_phone: settings.bf_moov_marchand_phone || null,
        connect_pro_base_url: settings.connect_pro_base_url || null,
        requires_deposit_to_view_coupon: settings.requires_deposit_to_view_coupon,
        minimun_deposit_before_view_coupon: settings.minimun_deposit_before_view_coupon || "",
      })
    }
  }, [settings])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Client-side validation
    const errors: { [key: string]: string } = {}

    // Required field validation
    if (!formData.minimum_deposit) {
      errors.minimum_deposit = "Le dépôt minimum est requis"
    }
    if (!formData.minimum_withdrawal) {
      errors.minimum_withdrawal = "Le retrait minimum est requis"
    }
    if (!formData.bonus_percent) {
      errors.bonus_percent = "Le pourcentage de bonus est requis"
    }
    if (!formData.deposit_reward_percent) {
      errors.deposit_reward_percent = "Le pourcentage de récompense est requis"
    }

    // URL validation
    const urlFields = ['dowload_apk_link', 'wave_default_link', 'orange_default_link', 'mtn_default_link']
    urlFields.forEach(urlField => {
      const value = formData[urlField as keyof SettingsInput] as string
      if (value && !value.match(/^https?:\/\/.+/)) {
        errors[urlField] = "L'URL doit commencer par http:// ou https://"
      }
    })

    // Phone number validation (basic)
    const phoneFields = ['whatsapp_phone', 'moov_marchand_phone', 'orange_marchand_phone', 'bf_orange_marchand_phone', 'bf_moov_marchand_phone']
    phoneFields.forEach(phoneField => {
      const value = formData[phoneField as keyof SettingsInput] as string
      if (value && !value.match(/^\+?[0-9\s\-\(\)]+$/)) {
        errors[phoneField] = "Format de numéro de téléphone invalide"
      }
    })

    setValidationErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    // Convert empty strings to null for optional fields
    const submitData: SettingsInput = {
      ...formData,
      whatsapp_phone: formData.whatsapp_phone || null,
      telegram: formData.telegram || null,
      minimum_solde: formData.minimum_solde || null,
      min_version: formData.min_version || null,
      last_version: formData.last_version || null,
      dowload_apk_link: formData.dowload_apk_link || null,
      wave_default_link: formData.wave_default_link || null,
      orange_default_link: formData.orange_default_link || null,
      mtn_default_link: formData.mtn_default_link || null,
      moov_marchand_phone: formData.moov_marchand_phone || null,
      orange_marchand_phone: formData.orange_marchand_phone || null,
      bf_orange_marchand_phone: formData.bf_orange_marchand_phone || null,
      bf_moov_marchand_phone: formData.bf_moov_marchand_phone || null,
      requires_deposit_to_view_coupon: formData.requires_deposit_to_view_coupon,
      minimun_deposit_before_view_coupon: formData.minimun_deposit_before_view_coupon || "",
    }
    updateSettings.mutate(submitData, {
      onSuccess: () => {
        setValidationErrors({})
        onOpenChange(false)
      },
    })
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier les Paramètres</DialogTitle>
          <DialogDescription>Mettez à jour les paramètres de configuration de la plateforme</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="minimum_deposit">Dépôt Minimum (FCFA) *</Label>
              <Input
                id="minimum_deposit"
                type="number"
                value={formData.minimum_deposit || ""}
                onChange={(e) => {
                  setFormData({ ...formData, minimum_deposit: e.target.value })
                  if (validationErrors?.minimum_deposit) {
                    setValidationErrors({ ...validationErrors, minimum_deposit: "" })
                  }
                }}
                required
                disabled={updateSettings.isPending}
                className={validationErrors?.minimum_deposit ? "border-destructive" : ""}
              />
              {validationErrors?.minimum_deposit && (
                <p className="text-xs text-destructive">{validationErrors.minimum_deposit}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimum_withdrawal">Retrait Minimum (FCFA) *</Label>
              <Input
                id="minimum_withdrawal"
                type="number"
                value={formData.minimum_withdrawal || ""}
                onChange={(e) => {
                  setFormData({ ...formData, minimum_withdrawal: e.target.value })
                  if (validationErrors?.minimum_withdrawal) {
                    setValidationErrors({ ...validationErrors, minimum_withdrawal: "" })
                  }
                }}
                required
                disabled={updateSettings.isPending}
                className={validationErrors?.minimum_withdrawal ? "border-destructive" : ""}
              />
              {validationErrors?.minimum_withdrawal && (
                <p className="text-xs text-destructive">{validationErrors.minimum_withdrawal}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward_mini_withdrawal">Retrait Minimum Récompense (FCFA) *</Label>
              <Input
                id="reward_mini_withdrawal"
                type="number"
                value={formData.reward_mini_withdrawal || ""}
                onChange={(e) => setFormData({ ...formData, reward_mini_withdrawal: e.target.value })}
                required
                disabled={updateSettings.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimum_solde">Solde Minimum (FCFA)</Label>
              <Input
                id="minimum_solde"
                type="number"
                value={formData.minimum_solde || ""}
                onChange={(e) => setFormData({ ...formData, minimum_solde: e.target.value || null })}
                disabled={updateSettings.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonus_percent">Pourcentage de Bonus (%) *</Label>
              <Input
                id="bonus_percent"
                type="number"
                value={formData.bonus_percent || ""}
                onChange={(e) => {
                  setFormData({ ...formData, bonus_percent: e.target.value })
                  if (validationErrors?.bonus_percent) {
                    setValidationErrors({ ...validationErrors, bonus_percent: "" })
                  }
                }}
                required
                disabled={updateSettings.isPending}
                step="0.01"
                className={validationErrors?.bonus_percent ? "border-destructive" : ""}
              />
              {validationErrors?.bonus_percent && (
                <p className="text-xs text-destructive">{validationErrors.bonus_percent}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit_reward_percent">Pourcentage de Récompense de Dépôt (%) *</Label>
              <Input
                id="deposit_reward_percent"
                type="number"
                value={formData.deposit_reward_percent || ""}
                onChange={(e) => {
                  setFormData({ ...formData, deposit_reward_percent: e.target.value })
                  if (validationErrors?.deposit_reward_percent) {
                    setValidationErrors({ ...validationErrors, deposit_reward_percent: "" })
                  }
                }}
                required
                disabled={updateSettings.isPending}
                step="0.01"
                className={validationErrors?.deposit_reward_percent ? "border-destructive" : ""}
              />
              {validationErrors?.deposit_reward_percent && (
                <p className="text-xs text-destructive">{validationErrors.deposit_reward_percent}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp_phone">Téléphone WhatsApp</Label>
              <Input
                id="whatsapp_phone"
                value={formData.whatsapp_phone || ""}
                onChange={(e) => {
                  setFormData({ ...formData, whatsapp_phone: e.target.value || null })
                  if (validationErrors?.whatsapp_phone) {
                    setValidationErrors({ ...validationErrors, whatsapp_phone: "" })
                  }
                }}
                placeholder="+229XXXXXXXXX"
                disabled={updateSettings.isPending}
                className={validationErrors?.whatsapp_phone ? "border-destructive" : ""}
              />
              {validationErrors?.whatsapp_phone && (
                <p className="text-xs text-destructive">{validationErrors.whatsapp_phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegram">Telegram</Label>
              <Input
                id="telegram"
                value={formData.telegram || ""}
                onChange={(e) => setFormData({ ...formData, telegram: e.target.value || null })}
                placeholder="@username ou lien Telegram"
                disabled={updateSettings.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_version">Version Minimale</Label>
              <Input
                id="min_version"
                value={formData.min_version || ""}
                onChange={(e) => setFormData({ ...formData, min_version: e.target.value || null })}
                placeholder="1.0.0"
                disabled={updateSettings.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_version">Dernière Version</Label>
              <Input
                id="last_version"
                value={formData.last_version || ""}
                onChange={(e) => setFormData({ ...formData, last_version: e.target.value || null })}
                placeholder="1.0.0"
                disabled={updateSettings.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dowload_apk_link">Lien de Téléchargement APK</Label>
              <Input
                id="dowload_apk_link"
                value={formData.dowload_apk_link || ""}
                onChange={(e) => {
                  setFormData({ ...formData, dowload_apk_link: e.target.value || null })
                  if (validationErrors?.dowload_apk_link) {
                    setValidationErrors({ ...validationErrors, dowload_apk_link: "" })
                  }
                }}
                placeholder="https://example.com/app.apk"
                disabled={updateSettings.isPending}
                className={validationErrors?.dowload_apk_link ? "border-destructive" : ""}
              />
              {validationErrors.dowload_apk_link && (
                <p className="text-xs text-destructive">{validationErrors.dowload_apk_link}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="wave_default_link">Lien Wave par Défaut</Label>
              <Input
                id="wave_default_link"
                value={formData.wave_default_link || ""}
                onChange={(e) => setFormData({ ...formData, wave_default_link: e.target.value || null })}
                placeholder="https://pay.wave.com/..."
                disabled={updateSettings.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orange_default_link">Lien Orange par Défaut</Label>
              <Input
                id="orange_default_link"
                value={formData.orange_default_link || ""}
                onChange={(e) => setFormData({ ...formData, orange_default_link: e.target.value || null })}
                placeholder="https://..."
                disabled={updateSettings.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mtn_default_link">Lien MTN par Défaut</Label>
              <Input
                id="mtn_default_link"
                value={formData.mtn_default_link || ""}
                onChange={(e) => setFormData({ ...formData, mtn_default_link: e.target.value || null })}
                placeholder="https://..."
                disabled={updateSettings.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="moov_marchand_phone">Téléphone Moov Marchand</Label>
              <Input
                id="moov_phone"
                value={formData.moov_marchand_phone || ""}
                onChange={(e) => setFormData({ ...formData, moov_marchand_phone: e.target.value || null })}
                placeholder="+229XXXXXXXXX"
                disabled={updateSettings.isPending}
              />
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="orange_phone">Téléphone Orange Marchand</Label>
              <Input
                id="orange_phone"
                value={formData.orange_phone || ""}
                onChange={(e) => setFormData({ ...formData, orange_phone: e.target.value || null })}
                placeholder="+229XXXXXXXXX"
                disabled={updateSettings.isPending}
              />
            </div> */}

            <div className="space-y-2">
              <Label htmlFor="orange_marchand_phone">Téléphone Orange Marchand</Label>
              <Input
                id="orange_marchand_phone"
                value={formData.orange_marchand_phone || ""}
                onChange={(e) => setFormData({ ...formData, orange_marchand_phone: e.target.value || null })}
                placeholder="+229XXXXXXXXX"
                disabled={updateSettings.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bf_orange_marchand_phone">Téléphone Orange Marchand (BF)</Label>
              <Input
                id="bf_orange_marchand_phone"
                value={formData.bf_orange_marchand_phone || ""}
                onChange={(e) => setFormData({ ...formData, bf_orange_marchand_phone: e.target.value || null })}
                placeholder="+226XXXXXXXXX"
                disabled={updateSettings.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bf_moov_marchand_phone">Téléphone Moov Marchand (BF)</Label>
              <Input
                id="bf_moov_marchand_phone"
                value={formData.bf_moov_marchand_phone || ""}
                onChange={(e) => setFormData({ ...formData, bf_moov_marchand_phone: e.target.value || null })}
                placeholder="+226XXXXXXXXX"
                disabled={updateSettings.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="connect_pro_base_url">URL de Base Connect Pro</Label>
              <Input
                id="connect_pro_base_url"
                value={formData.connect_pro_base_url || ""}
                onChange={(e) => setFormData({ ...formData, connect_pro_base_url: e.target.value || null })}
                placeholder="https://api.connectpro.com"
                disabled={updateSettings.isPending}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="referral_bonus">Bonus de Parrainage</Label>
              <Switch
                id="referral_bonus"
                checked={formData.referral_bonus}
                onCheckedChange={(checked) => setFormData({ ...formData, referral_bonus: checked })}
                disabled={updateSettings.isPending}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="deposit_reward">Récompense de Dépôt</Label>
              <Switch
                id="deposit_reward"
                checked={formData.deposit_reward}
                onCheckedChange={(checked) => setFormData({ ...formData, deposit_reward: checked })}
                disabled={updateSettings.isPending}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="requires_deposit_to_view_coupon">Dépôt Requis pour voir les coupons</Label>
              <Switch
                id="requires_deposit_to_view_coupon"
                checked={formData.requires_deposit_to_view_coupon}
                onCheckedChange={(checked) => setFormData({ ...formData, requires_deposit_to_view_coupon: checked })}
                disabled={updateSettings.isPending}
              />
            </div>

            {formData.requires_deposit_to_view_coupon && (
              <div className="space-y-2">
                <Label htmlFor="minimun_deposit_before_view_coupon">Dépôt Minimum pour voir (FCFA)</Label>
                <Input
                  id="minimun_deposit_before_view_coupon"
                  type="number"
                  value={formData.minimun_deposit_before_view_coupon || ""}
                  onChange={(e) => setFormData({ ...formData, minimun_deposit_before_view_coupon: e.target.value })}
                  disabled={updateSettings.isPending}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateSettings.isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={updateSettings.isPending}>
              {updateSettings.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                "Mettre à jour les Paramètres"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

