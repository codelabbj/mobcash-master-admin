"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useCreateNetwork, useUpdateNetwork, type Network, type NetworkInput } from "@/hooks/useNetworks"
import { toast } from "react-hot-toast"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

const NETWORK_CHOICES = [
    { value: "mtn", label: "MTN" },
    { value: "moov", label: "MOOV" },
    { value: "card", label: "Carte" },
    { value: "sbin", label: "Celtis" },
    { value: "orange", label: "Orange" },
    { value: "wave", label: "Wave" },
    { value: "togocom", label: "Togocom" },
    { value: "airtel", label: "Airtel" },
    { value: "mpesa", label: "Mpesa" },
    { value: "afrimoney", label: "Afrimoney" },
]

const parseApiChoices = () => {
    const envChoices = process.env.NEXT_PUBLIC_API_CHOICES
    if (!envChoices) {
        return [{ value: "connect", label: "Module Connect" }]
    }

    try {
        return envChoices.split(",").map((choice) => {
            const [value, label] = choice.split(":")
            return { value, label: label || value }
        })
    } catch (error) {
        console.error("Error parsing NEXT_PUBLIC_API_CHOICES:", error)
        return [{ value: "connect", label: "Module Connect" }]
    }
}

const API_CHOICES = parseApiChoices()


interface NetworkDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    network?: Network
}

export function NetworkDialog({ open, onOpenChange, network }: NetworkDialogProps) {
    const createNetwork = useCreateNetwork()
    const updateNetwork = useUpdateNetwork()
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [file, setFile] = useState<File | null>(null)

    const [formData, setFormData] = useState<NetworkInput>({
        name: "",
        placeholder: "",
        public_name: "",
        country_code: "",
        indication: "",
        image: "",
        withdrawal_message: null,
        deposit_api: "connect",
        withdrawal_api: "connect",
        payment_by_link: false,
        otp_required: false,
        manual_processing: false,
        enable: true,
        deposit_message: "",
        active_for_deposit: true,
        active_for_with: true,
        customer_pay_fee: false,
        payment_by_ussd_code: false,
        ussd_code: "",
        reduce_fee: false,
        fee_payin: 0,
        fee_slice_enabled: false,
        fee_slice_threshold: 50000,
        fee_slice_low_percent: "2.00",
        fee_slice_high_percent: "1.00",
        fee_slice_fixed: 0,
    })

    useEffect(() => {
        if (network) {
            setFormData({
                name: network.name,
                placeholder: network.placeholder,
                public_name: network.public_name,
                country_code: network.country_code,
                indication: network.indication,
                image: network.image,
                withdrawal_message: network.withdrawal_message,
                deposit_api: network.deposit_api,
                withdrawal_api: network.withdrawal_api,
                payment_by_link: network.payment_by_link,
                otp_required: network.otp_required,
                manual_processing: network.manual_processing,
                enable: network.enable,
                deposit_message: network.deposit_message,
                active_for_deposit: network.active_for_deposit,
                active_for_with: network.active_for_with,
                customer_pay_fee: network.customer_pay_fee,
                payment_by_ussd_code: network.payment_by_ussd_code ?? false,
                ussd_code: network.ussd_code ?? "",
                reduce_fee: network.reduce_fee ?? false,
                fee_payin: network.fee_payin ?? 0,
                fee_slice_enabled: network.fee_slice_enabled ?? false,
                fee_slice_threshold: network.fee_slice_threshold ?? 50000,
                fee_slice_low_percent: network.fee_slice_low_percent ?? "2.00",
                fee_slice_high_percent: network.fee_slice_high_percent ?? "1.00",
                fee_slice_fixed: network.fee_slice_fixed ?? 0,
            })
            setSelectedImage(network.image)
        } else {
            setFormData({
                name: "",
                placeholder: "",
                public_name: "",
                country_code: "",
                indication: "",
                image: "",
                withdrawal_message: null,
                deposit_api: "connect",
                withdrawal_api: "connect",
                payment_by_link: false,
                otp_required: false,
                manual_processing: false,
                enable: true,
                deposit_message: "",
                active_for_deposit: true,
                active_for_with: true,
                customer_pay_fee: false,
                payment_by_ussd_code: false,
                ussd_code: "",
                reduce_fee: false,
                fee_payin: 0,
                fee_slice_enabled: false,
                fee_slice_threshold: 50000,
                fee_slice_low_percent: "2.00",
                fee_slice_high_percent: "1.00",
                fee_slice_fixed: 0,
            })
            setSelectedImage(null)
        }
        setFile(null)
    }, [network])

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

    const handleDialogOpenChange = (open: boolean) => {
        if (!open) {
            if (network) {
                setFormData({
                    name: network.name,
                    placeholder: network.placeholder,
                    public_name: network.public_name,
                    country_code: network.country_code,
                    indication: network.indication,
                    image: network.image,
                    withdrawal_message: network.withdrawal_message,
                    deposit_api: network.deposit_api,
                    withdrawal_api: network.withdrawal_api,
                    payment_by_link: network.payment_by_link,
                    otp_required: network.otp_required,
                    manual_processing: network.manual_processing,
                    enable: network.enable,
                    deposit_message: network.deposit_message,
                    active_for_deposit: network.active_for_deposit,
                    active_for_with: network.active_for_with,
                    customer_pay_fee: network.customer_pay_fee,
                    payment_by_ussd_code: network.payment_by_ussd_code ?? false,
                    ussd_code: network.ussd_code ?? "",
                    reduce_fee: network.reduce_fee ?? false,
                    fee_payin: network.fee_payin ?? 0,
                    fee_slice_enabled: network.fee_slice_enabled ?? false,
                    fee_slice_threshold: network.fee_slice_threshold ?? 50000,
                    fee_slice_low_percent: network.fee_slice_low_percent ?? "2.00",
                    fee_slice_high_percent: network.fee_slice_high_percent ?? "1.00",
                    fee_slice_fixed: network.fee_slice_fixed ?? 0,
                })
                setSelectedImage(network.image)
            } else {
                setFormData({
                    name: "",
                    placeholder: "",
                    public_name: "",
                    country_code: "",
                    indication: "",
                    image: "",
                    withdrawal_message: null,
                    deposit_api: "connect",
                    withdrawal_api: "connect",
                    payment_by_link: false,
                    otp_required: false,
                    manual_processing: false,
                    enable: true,
                    deposit_message: "",
                    active_for_deposit: true,
                    active_for_with: true,
                    customer_pay_fee: false,
                    payment_by_ussd_code: false,
                    ussd_code: "",
                    reduce_fee: false,
                    fee_payin: 0,
                    fee_slice_enabled: false,
                    fee_slice_threshold: 50000,
                    fee_slice_low_percent: "2.00",
                    fee_slice_high_percent: "1.00",
                    fee_slice_fixed: 0,
                })
                setSelectedImage(null)
            }
        }
        onOpenChange(open)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const dataToSubmit = { ...formData }

        if (!dataToSubmit.payment_by_ussd_code) {
            // Remove those keys from payload if USSD payment is disabled
            delete (dataToSubmit as any).ussd_code
            delete (dataToSubmit as any).reduce_fee
            delete (dataToSubmit as any).fee_payin
        }

        if (!dataToSubmit.fee_slice_enabled) {
            // Remove those keys from payload if tiered fees are disabled
            delete (dataToSubmit as any).fee_slice_threshold
            delete (dataToSubmit as any).fee_slice_low_percent
            delete (dataToSubmit as any).fee_slice_high_percent
            delete (dataToSubmit as any).fee_slice_fixed
        }

        if (network) {
            updateNetwork.mutate(
                { id: network.id, data: dataToSubmit, file: file ?? undefined },
                {
                    onSuccess: () => handleDialogOpenChange(false),
                },
            )
        } else {
            createNetwork.mutate({ data: dataToSubmit, file: file ?? undefined }, {
                onSuccess: () => {
                    handleDialogOpenChange(false)
                },
            })
        }
    }

    const isPending = createNetwork.isPending || updateNetwork.isPending

    return (
        <Dialog open={open} onOpenChange={handleDialogOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{network ? "Modifier le réseau" : "Créer un réseau"}</DialogTitle>
                    <DialogDescription>
                        {network ? "Mettez à jour les détails du réseau ci-dessous." : "Ajoutez un nouveau réseau de paiement au système."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Image du réseau</Label>
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
                                <img src={selectedImage} alt="Aperçu du réseau" className="w-full h-full object-cover" />
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
                            <Label htmlFor="name">Réseau *</Label>
                            <Select
                                value={formData.name}
                                onValueChange={(value) => setFormData({ ...formData, name: value })}
                                disabled={isPending}
                            >
                                <SelectTrigger id="name" className="w-full">
                                    <SelectValue placeholder="Sélectionner un réseau" />
                                </SelectTrigger>
                                <SelectContent>
                                    {NETWORK_CHOICES.map((network) => (
                                        <SelectItem key={network.value} value={network.value}>
                                            {network.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="public_name">Nom Public *</Label>
                            <Input
                                id="public_name"
                                value={formData.public_name}
                                onChange={(e) => setFormData({ ...formData, public_name: e.target.value })}
                                required
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="placeholder">Exemple *</Label>
                            <Input
                                id="placeholder"
                                value={formData.placeholder}
                                onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                                placeholder="07XXXXXXXX"
                                required
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country_code">Code Pays *</Label>
                            <Input
                                id="country_code"
                                value={formData.country_code}
                                onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
                                placeholder="CI"
                                required
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="indication">Indicatif *</Label>
                            <Input
                                id="indication"
                                value={formData.indication}
                                onChange={(e) => setFormData({ ...formData, indication: e.target.value })}
                                placeholder="225"
                                required
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="deposit_api">API de Dépôt *</Label>
                            <Select
                                value={formData.deposit_api}
                                onValueChange={(value) => setFormData({ ...formData, deposit_api: value })}
                                disabled={isPending}
                            >
                                <SelectTrigger id="deposit_api" className="w-full">
                                    <SelectValue placeholder="Sélectionner une API" />
                                </SelectTrigger>
                                <SelectContent>
                                    {API_CHOICES.map((api) => (
                                        <SelectItem key={api.value} value={api.value}>
                                            {api.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="withdrawal_api">API de Retrait *</Label>
                            <Select
                                value={formData.withdrawal_api}
                                onValueChange={(value) => setFormData({ ...formData, withdrawal_api: value })}
                                disabled={isPending}
                            >
                                <SelectTrigger id="withdrawal_api" className="w-full">
                                    <SelectValue placeholder="Sélectionner une API" />
                                </SelectTrigger>
                                <SelectContent>
                                    {API_CHOICES.map((api) => (
                                        <SelectItem key={api.value} value={api.value}>
                                            {api.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="deposit_message">Message de Dépôt</Label>
                        <Textarea
                            id="deposit_message"
                            value={formData.deposit_message}
                            onChange={(e) => setFormData({ ...formData, deposit_message: e.target.value })}
                            disabled={isPending}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="withdrawal_message">Message de Retrait</Label>
                        <Textarea
                            id="withdrawal_message"
                            value={formData.withdrawal_message || ""}
                            onChange={(e) => setFormData({ ...formData, withdrawal_message: e.target.value || null })}
                            disabled={isPending}
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">

                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="payment_by_link">Paiement par Lien</Label>
                            <Switch
                                id="payment_by_link"
                                checked={formData.payment_by_link}
                                onCheckedChange={(checked) => setFormData({ ...formData, payment_by_link: checked })}
                                disabled={isPending}
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="otp_required">OTP Requis</Label>
                            <Switch
                                id="otp_required"
                                checked={formData.otp_required}
                                onCheckedChange={(checked) => setFormData({ ...formData, otp_required: checked })}
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

                        {formData.withdrawal_api === "connect" && (
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="customer_pay_fee">Client paye les frais</Label>
                                <Switch
                                    id="customer_pay_fee"
                                    checked={formData.customer_pay_fee}
                                    onCheckedChange={(checked) => setFormData({ ...formData, customer_pay_fee: checked })}
                                    disabled={isPending}
                                />
                            </div>
                        )}

                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="fee_slice_enabled" className="text-primary font-semibold">Activer les frais par paliers</Label>
                            <Switch
                                id="fee_slice_enabled"
                                checked={formData.fee_slice_enabled}
                                onCheckedChange={(checked) => setFormData({ ...formData, fee_slice_enabled: checked })}
                                disabled={isPending}
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="payment_by_ussd_code">Paiement par Code USSD</Label>
                            <Switch
                                id="payment_by_ussd_code"
                                checked={formData.payment_by_ussd_code}
                                onCheckedChange={(checked) => setFormData({ ...formData, payment_by_ussd_code: checked })}
                                disabled={isPending}
                            />
                        </div>
                    </div>

                    {formData.fee_slice_enabled && (
                        <div className="p-4 border border-primary/30 border-dashed rounded-lg space-y-4 bg-primary/5">
                            <p className="text-sm font-semibold text-primary">Configuration des frais par paliers</p>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="fee_slice_threshold">Seuil (Montant) *</Label>
                                    <Input
                                        id="fee_slice_threshold"
                                        type="number"
                                        value={formData.fee_slice_threshold}
                                        onChange={(e) => setFormData({ ...formData, fee_slice_threshold: parseInt(e.target.value) || 0 })}
                                        disabled={isPending}
                                    />
                                    <p className="text-[10px] text-muted-foreground italic">Ex: 50000</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fee_slice_fixed">Montant Fixe (Tier Haut) *</Label>
                                    <Input
                                        id="fee_slice_fixed"
                                        type="number"
                                        value={formData.fee_slice_fixed}
                                        onChange={(e) => setFormData({ ...formData, fee_slice_fixed: parseInt(e.target.value) || 0 })}
                                        disabled={isPending}
                                    />
                                    <p className="text-[10px] text-muted-foreground italic">Ajouté en plus du % au delà du seuil</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fee_slice_low_percent">% Seuil Bas (≤ Seuil) *</Label>
                                    <Input
                                        id="fee_slice_low_percent"
                                        value={formData.fee_slice_low_percent}
                                        onChange={(e) => setFormData({ ...formData, fee_slice_low_percent: e.target.value })}
                                        placeholder="2.00"
                                        disabled={isPending}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fee_slice_high_percent">% Seuil Haut ({'>'} Seuil) *</Label>
                                    <Input
                                        id="fee_slice_high_percent"
                                        value={formData.fee_slice_high_percent}
                                        onChange={(e) => setFormData({ ...formData, fee_slice_high_percent: e.target.value })}
                                        placeholder="1.00"
                                        disabled={isPending}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {formData.payment_by_ussd_code && (
                        <div className="p-4 border border-dashed rounded-lg space-y-4 bg-muted/30">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-muted-foreground">Paramètres de paiement USSD</p>
                                {formData.fee_slice_enabled && (
                                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-[10px]">
                                        Frais standards ignorés (Paliers actifs)
                                    </Badge>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="fee_payin" className={formData.fee_slice_enabled ? "text-muted-foreground line-through" : ""}>
                                        Frais Payin (Nombre) *
                                    </Label>
                                    <Input
                                        id="fee_payin"
                                        type="number"
                                        step="any"
                                        value={formData.fee_payin}
                                        onChange={(e) => setFormData({ ...formData, fee_payin: parseFloat(e.target.value) || 0 })}
                                        disabled={isPending || formData.fee_slice_enabled}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="ussd_code">Code USSD *</Label>
                                    <Input
                                        id="ussd_code"
                                        value={formData.ussd_code}
                                        onChange={(e) => setFormData({ ...formData, ussd_code: e.target.value })}
                                        placeholder="*XXX*X*{amount}#"
                                        disabled={isPending}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="reduce_fee" className={formData.fee_slice_enabled ? "text-muted-foreground line-through" : ""}>
                                    Réduire les frais
                                </Label>
                                <Switch
                                    id="reduce_fee"
                                    checked={formData.reduce_fee}
                                    onCheckedChange={(checked) => setFormData({ ...formData, reduce_fee: checked })}
                                    disabled={isPending || formData.fee_slice_enabled}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" className="hover:bg-primary/20" onClick={() => handleDialogOpenChange(false)} disabled={isPending}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {network ? "Mise à jour..." : "Création..."}
                                </>
                            ) : network ? (
                                "Mettre à jour le réseau"
                            ) : (
                                "Créer un réseau"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
