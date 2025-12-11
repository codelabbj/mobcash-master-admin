"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useCreateNetwork, useUpdateNetwork, type Network, type NetworkInput } from "@/hooks/useNetworks"
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

const API_CHOICES = [
    { value: "connect", label: "FASTXOF Connect" },
]

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
        enable: true,
        deposit_message: "",
        active_for_deposit: true,
        active_for_with: true,
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
                enable: network.enable,
                deposit_message: network.deposit_message,
                active_for_deposit: network.active_for_deposit,
                active_for_with: network.active_for_with,
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
                enable: true,
                deposit_message: "",
                active_for_deposit: true,
                active_for_with: true,
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
        if(!open) {
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
                    enable: network.enable,
                    deposit_message: network.deposit_message,
                    active_for_deposit: network.active_for_deposit,
                    active_for_with: network.active_for_with,
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
                    enable: true,
                    deposit_message: "",
                    active_for_deposit: true,
                    active_for_with: true,
                })
                setSelectedImage(null)
            }
        }
        onOpenChange(open)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (network) {
            updateNetwork.mutate(
                { id: network.id, data: formData,file:file??undefined },
                {
                    onSuccess: () => handleDialogOpenChange(false),
                },
            )
        } else {
            createNetwork.mutate({data:formData,file:file??undefined}, {
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
                            <Label htmlFor="enable">Activer</Label>
                            <Switch
                                id="enable"
                                checked={formData.enable}
                                onCheckedChange={(checked) => setFormData({ ...formData, enable: checked })}
                                disabled={isPending}
                            />
                        </div>

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
                    </div>

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
