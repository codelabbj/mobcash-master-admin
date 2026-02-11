"use client"

import { useState } from "react"
import { useSettings } from "@/hooks/useSettings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Pencil } from "lucide-react"
import { SettingsDialog } from "@/components/settings-dialog"

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings()
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Paramètres</h2>
          <p className="text-muted-foreground">Consultez les paramètres de configuration de la plateforme</p>
        </div>
        {settings && (
          <Button onClick={() => setDialogOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Modifier les Paramètres
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : settings ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Limites de Transaction</CardTitle>
              <CardDescription>Montants minimum et maximum des transactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Dépôt Minimum</span>
                <Badge variant="outline">{settings.minimum_deposit} FCFA</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Retrait Minimum</span>
                <Badge variant="outline">{settings.minimum_withdrawal} FCFA</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Retrait Minimum Récompense</span>
                <Badge variant="outline">{settings.reward_mini_withdrawal} FCFA</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Solde Minimum</span>
                <Badge variant="outline">{settings.minimum_solde || "N/A"}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Récompenses & Bonus</CardTitle>
              <CardDescription>Configuration des bonus et récompenses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pourcentage de Bonus</span>
                <Badge variant="outline">{settings.bonus_percent}%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pourcentage de Récompense de Dépôt</span>
                <Badge variant="outline">{settings.deposit_reward_percent}%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Bonus de Parrainage</span>
                <Badge variant={settings.referral_bonus ? "default" : "secondary"}>
                  {settings.referral_bonus ? "Activé" : "Désactivé"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Récompense de Dépôt</span>
                <Badge variant={settings.deposit_reward ? "default" : "secondary"}>
                  {settings.deposit_reward ? "Activé" : "Désactivé"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Dépôt Requis pour voir les coupons</span>
                <Badge variant={settings.requires_deposit_to_view_coupon ? "default" : "secondary"}>
                  {settings.requires_deposit_to_view_coupon ? "Activé" : "Désactivé"}
                </Badge>
              </div>
              {settings.requires_deposit_to_view_coupon && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Dépôt Minimum pour voir</span>
                  <Badge variant="outline">{settings.minimun_deposit_before_view_coupon} FCFA</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Version de l'App</CardTitle>
              <CardDescription>Informations sur la version de l'application mobile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Version Minimale</span>
                <Badge variant="outline">{settings.min_version || "N/A"}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Dernière Version</span>
                <Badge variant="outline">{settings.last_version || "N/A"}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Lien de Téléchargement</span>
                {settings.dowload_apk_link ? (
                  <a
                    href={settings.dowload_apk_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Voir le Lien
                  </a>
                ) : (
                  <span className="text-sm text-muted-foreground">N/A</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact & Liens</CardTitle>
              <CardDescription>Support et liens de paiement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Téléphone WhatsApp</span>
                <Badge variant="outline">{settings.whatsapp_phone || "N/A"}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Téléphone Moov Marchand</span>
                <Badge variant="outline">{settings.moov_marchand_phone || "N/A"}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Téléphone Orange Marchant</span>
                <Badge variant="outline">{settings.orange_marchand_phone || "N/A"}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Téléphone Orange Marchant (BF)</span>
                <Badge variant="outline">{settings.bf_orange_marchand_phone || "N/A"}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Téléphone Moov Marchand (BF)</span>
                <Badge variant="outline">{settings.bf_moov_marchand_phone || "N/A"}</Badge>
              </div>
              {/* <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Téléphone Orange Marchand</span>
                <Badge variant="outline">{settings.orange_marchand_phone || "N/A"}</Badge>
              </div> */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Telegram</span>
                <Badge variant="outline">{settings.telegram || "N/A"}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Lien Wave</span>
                {settings.wave_default_link ? (
                  <a
                    href={settings.wave_default_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Voir
                  </a>
                ) : (
                  <span className="text-sm text-muted-foreground">N/A</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Lien Orange</span>
                {settings.orange_default_link ? (
                  <a
                    href={settings.orange_default_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Voir
                  </a>
                ) : (
                  <span className="text-sm text-muted-foreground">N/A</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Lien MTN</span>
                {settings.mtn_default_link ? (
                  <a
                    href={settings.mtn_default_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Voir
                  </a>
                ) : (
                  <span className="text-sm text-muted-foreground">N/A</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">Aucun paramètre trouvé</div>
      )}

      <SettingsDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
