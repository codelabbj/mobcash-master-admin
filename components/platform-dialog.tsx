"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useCreatePlatform, useUpdatePlatform, type PlatformInput } from "@/hooks/usePlatforms"
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
import { Loader2, Upload } from "lucide-react"

const emptyPlatformForm = (): PlatformInput => ({
    name: "",
    image: "",
    enable: true,
    active_for_deposit: true,
    active_for_with: true,
    deposit_tuto_link: null,
    withdrawal_tuto_link: null,
    why_withdrawal_fail: null,
    order: null,
    city: null,
    street: null,
    minimun_deposit: 200,
    max_deposit: 100000,
    minimun_with: 300,
    max_win: 1000000,
    manual_processing: false,
    hash: null,
    cashdeskid: null,
    cashierpass: null,
    betmomo_token: "",
    betmomo_email: "",
    betmomo_password: "",
})

interface PlatformDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    platform?: PlatformInput & { id?: string; uses_betmomo?: boolean; has_betmomo_token?: boolean }
}

export function PlatformDialog({ open, onOpenChange, platform }: PlatformDialogProps) {
    const createPlatform = useCreatePlatform()
    const updatePlatform = useUpdatePlatform()
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [file, setFile] = useState<File | null>(null)

    const [formData, setFormData] = useState<PlatformInput>(emptyPlatformForm())

    useEffect(() => {
        if (platform) {
            setFormData({
                name: platform.name,
                image: platform.image,
                enable: platform.enable,
                active_for_deposit: platform.active_for_deposit ?? true,
                active_for_with: platform.active_for_with ?? true,
                deposit_tuto_link: platform.deposit_tuto_link,
                withdrawal_tuto_link: platform.withdrawal_tuto_link,
                why_withdrawal_fail: platform.why_withdrawal_fail,
                order: platform.order,
                city: platform.city,
                street: platform.street,
                minimun_deposit: platform.minimun_deposit,
                max_deposit: platform.max_deposit,
                minimun_with: platform.minimun_with,
                max_win: platform.max_win,
                manual_processing: platform.manual_processing,
                hash: platform.hash,
                cashdeskid: platform.cashdeskid,
                cashierpass: platform.cashierpass,
                // Secrets non renvoyés par l'API — laisser vide pour conserver
                betmomo_token: "",
                betmomo_email: "",
                betmomo_password: "",
            })
            setSelectedImage(platform.image)
        } else {
            setFormData(emptyPlatformForm())
            setSelectedImage(null)
        }
        setFile(null)
    }, [platform])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                const result = reader.result as string
                setSelectedImage(result)
                setFormData({ ...formData, image: result })
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (platform && platform.id) {
            updatePlatform.mutate(
                { id: platform.id, data: formData },
                {
                    onSuccess: () => {
                        onOpenChange(false)
                        setFormData(emptyPlatformForm())
                        setSelectedImage(null)
                        setFile(null)
                    },
                },
            )
        } else {
            createPlatform.mutate(
                { data: formData, file: file ?? undefined },
                {
                    onSuccess: () => {
                        onOpenChange(false)
                        setFormData(emptyPlatformForm())
                        setSelectedImage(null)
                        setFile(null)
                    },
                },
            )
        }
    }

    const isPending = createPlatform.isPending || updatePlatform.isPending

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{platform ? "Modifier la Plateforme" : "Créer une Plateforme"}</DialogTitle>
                    <DialogDescription>
                        {platform ? "Mettez à jour les détails de la plateforme ci-dessous." : "Ajouter une nouvelle plateforme de pari au système"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Image de la plateforme</Label>
                        <Input
                            id="upload-input"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        {selectedImage ? (
                            <div
                                className="relative group w-full h-48 rounded-lg overflow-hidden"
                                onClick={() => document.getElementById("upload-input")?.click()}
                            >
                                <img src={selectedImage} alt="Aperçu de la plateforme" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center opacity-0 group-hover:opacity-70 transition-opacity cursor-pointer">
                                    <p className="text-white text-lg">Changer l'image</p>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => document.getElementById("upload-input")?.click()}
                                className="border-2 border-dashed border-input rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                            >
                                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground mb-1">Cliquez pour téléverser une image</p>
                                <p className="text-xs text-muted-foreground">PNG, JPG, JPEG</p>
                            </div>
                        )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city">Ville</Label>
                            <Input
                                id="city"
                                value={formData.city || ""}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value || null })}
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="street">Rue</Label>
                            <Input
                                id="street"
                                value={formData.street || ""}
                                onChange={(e) => setFormData({ ...formData, street: e.target.value || null })}
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="minimun_deposit">Dépôt Minimum *</Label>
                            <Input
                                id="minimun_deposit"
                                type="number"
                                value={formData.minimun_deposit}
                                onChange={(e) => setFormData({ ...formData, minimun_deposit: Number.parseInt(e.target.value) })}
                                required
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="max_deposit">Dépôt Maximum *</Label>
                            <Input
                                id="max_deposit"
                                type="number"
                                value={formData.max_deposit}
                                onChange={(e) => setFormData({ ...formData, max_deposit: Number.parseInt(e.target.value) })}
                                required
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="minimun_with">Retrait Minimum *</Label>
                            <Input
                                id="minimun_with"
                                type="number"
                                value={formData.minimun_with}
                                onChange={(e) => setFormData({ ...formData, minimun_with: Number.parseInt(e.target.value) })}
                                required
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="max_win">Gain Maximum *</Label>
                            <Input
                                id="max_win"
                                type="number"
                                value={formData.max_win}
                                onChange={(e) => setFormData({ ...formData, max_win: Number.parseInt(e.target.value) })}
                                required
                                disabled={isPending}
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="manual_processing">Traitement Manuel</Label>
                            <Switch
                                id="manual_processing"
                                checked={formData.manual_processing}
                                onCheckedChange={(checked) => setFormData({ ...formData, manual_processing: checked })}
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="hash">Hash</Label>
                            <Input
                                id="hash"
                                value={formData.hash || ""}
                                onChange={(e) => setFormData({ ...formData, hash: e.target.value || null })}
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cashdeskid">Cash Desk ID</Label>
                            <Input
                                id="cashdeskid"
                                value={formData.cashdeskid || ""}
                                onChange={(e) => setFormData({ ...formData, cashdeskid: e.target.value || null })}
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cashierpass">Cashier Password</Label>
                            <Input
                                id="cashierpass"
                                value={formData.cashierpass || ""}
                                onChange={(e) => setFormData({ ...formData, cashierpass: e.target.value || null })}
                                disabled={isPending}
                            />
                        </div>

                        <div className="md:col-span-2 border-t border-border pt-4 space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold">Configuration BetMomo (optionnel)</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Si le nom de la plateforme est BETMOMO et qu&apos;un token est renseigné,
                                    les dépôts/retraits passent par l&apos;API BetMomo.
                                    {platform?.has_betmomo_token
                                        ? " Un token est déjà enregistré — laisser vide pour le conserver."
                                        : ""}
                                </p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="betmomo_token">Token External (dat_...)</Label>
                                    <Input
                                        id="betmomo_token"
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder={
                                            platform?.has_betmomo_token
                                                ? "Laisser vide pour conserver le token actuel"
                                                : "Coller le token dat_... fourni par BeWallet"
                                        }
                                        value={formData.betmomo_token || ""}
                                        onChange={(e) =>
                                            setFormData({ ...formData, betmomo_token: e.target.value })
                                        }
                                        disabled={isPending}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="betmomo_email">Email dealer (solde)</Label>
                                    <Input
                                        id="betmomo_email"
                                        type="email"
                                        autoComplete="off"
                                        placeholder={
                                            platform ? "Laisser vide pour conserver" : "Email compte dealer"
                                        }
                                        value={formData.betmomo_email || ""}
                                        onChange={(e) =>
                                            setFormData({ ...formData, betmomo_email: e.target.value })
                                        }
                                        disabled={isPending}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="betmomo_password">Mot de passe dealer (solde)</Label>
                                    <Input
                                        id="betmomo_password"
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder={
                                            platform ? "Laisser vide pour conserver" : "Mot de passe dealer"
                                        }
                                        value={formData.betmomo_password || ""}
                                        onChange={(e) =>
                                            setFormData({ ...formData, betmomo_password: e.target.value })
                                        }
                                        disabled={isPending}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="order">Ordre</Label>
                            <Input
                                id="order"
                                type="number"
                                value={formData.order || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, order: e.target.value ? Number.parseInt(e.target.value) : null })
                                }
                                disabled={isPending}
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="enable">Activer</Label>
                            <Switch
                                id="enable"
                                checked={formData.enable}
                                onCheckedChange={(checked) => setFormData({ ...formData, enable: checked })}
                                disabled={isPending}
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="active_for_deposit">Actif pour Dépôt</Label>
                            <Switch
                                id="active_for_deposit"
                                checked={formData.active_for_deposit}
                                onCheckedChange={(checked) => setFormData({ ...formData, active_for_deposit: checked })}
                                disabled={isPending}
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="active_for_with">Actif pour Retrait</Label>
                            <Switch
                                id="active_for_with"
                                checked={formData.active_for_with}
                                onCheckedChange={(checked) => setFormData({ ...formData, active_for_with: checked })}
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="deposit_tuto_link">Lien tutoriel de dépôt (YouTube / Video)</Label>
                            <Input
                                id="deposit_tuto_link"
                                placeholder="https://youtube.com/..."
                                value={formData.deposit_tuto_link || ""}
                                onChange={(e) => setFormData({ ...formData, deposit_tuto_link: e.target.value || null })}
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="withdrawal_tuto_link">Lien tutoriel de retrait (YouTube / Video)</Label>
                            <Input
                                id="withdrawal_tuto_link"
                                placeholder="https://youtube.com/..."
                                value={formData.withdrawal_tuto_link || ""}
                                onChange={(e) => setFormData({ ...formData, withdrawal_tuto_link: e.target.value || null })}
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="why_withdrawal_fail">Raison de l'échec du retrait (YouTube / Video)</Label>
                            <Input
                                id="why_withdrawal_fail"
                                placeholder="https://youtube.com/..."
                                value={formData.why_withdrawal_fail || ""}
                                onChange={(e) => setFormData({ ...formData, why_withdrawal_fail: e.target.value || null })}
                                disabled={isPending}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                            className="hover:bg-primary/10"
                        >
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {platform ? "Mise à jour..." : "Création..."}
                                </>
                            ) : platform ? (
                                "Mettre à jour la Plateforme"
                            ) : (
                                "Créer une Plateforme"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
