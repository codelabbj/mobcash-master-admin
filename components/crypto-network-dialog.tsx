"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  useCreateCryptoNetwork,
  useUpdateCryptoNetwork,
  type CryptoNetwork,
  type CryptoNetworkInput,
} from "@/hooks/useCryptoNetworks"
import { useCryptos, type Crypto } from "@/hooks/useCrypto"
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

const EMPTY_FORM: CryptoNetworkInput = {
  name: "",
  symbol: "",
  logo: null,
  is_active: true,
  address: null,
  fee: null,
  crypto_id: null,
}

interface CryptoNetworkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  network?: CryptoNetwork
}

export function CryptoNetworkDialog({ open, onOpenChange, network }: CryptoNetworkDialogProps) {
  const createNetwork = useCreateCryptoNetwork()
  const updateNetwork = useUpdateCryptoNetwork()
  const { data: cryptos = [] } = useCryptos()

  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState<CryptoNetworkInput>(EMPTY_FORM)

  useEffect(() => {
    if (network) {
      setFormData({
        name: network.name,
        symbol: network.symbol ?? "",
        logo: network.logo,
        is_active: network.is_active,
        address: network.address,
        fee: network.fee,
        crypto_id: network.crypto ? String(network.crypto.id) : null,
      })
      setSelectedImage(network.logo || null)
    } else {
      setFormData(EMPTY_FORM)
      setSelectedImage(null)
    }
    setFile(null)
  }, [network, open])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0]
      setFile(f)
      const reader = new FileReader()
      reader.onloadend = () => setSelectedImage(reader.result as string)
      reader.readAsDataURL(f)
    }
  }

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      setFormData(EMPTY_FORM)
      setSelectedImage(null)
      setFile(null)
    }
    onOpenChange(val)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (network) {
      updateNetwork.mutate(
        { id: network.id, data: formData, file: file ?? undefined },
        { onSuccess: () => handleOpenChange(false) },
      )
    } else {
      createNetwork.mutate(
        { data: formData, file: file ?? undefined },
        { onSuccess: () => handleOpenChange(false) },
      )
    }
  }

  const isPending = createNetwork.isPending || updateNetwork.isPending

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {network ? "Modifier le réseau crypto" : "Ajouter un réseau crypto"}
          </DialogTitle>
          <DialogDescription>
            {network
              ? "Mettez à jour les détails du réseau."
              : "Ajoutez un réseau blockchain (TRC-20, BEP-20, etc.) à une cryptomonnaie."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Logo */}
          <div className="space-y-2">
            <Label>Logo</Label>
            <Input id="cn-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            {selectedImage ? (
              <div
                className="relative group w-20 h-20 rounded-lg overflow-hidden cursor-pointer border border-border"
                onClick={() => document.getElementById("cn-upload")?.click()}
              >
                <img src={selectedImage} alt="aperçu" className="w-full h-full object-contain p-1 bg-white" />
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-70 transition-opacity">
                  <p className="text-white text-xs">Changer</p>
                </div>
              </div>
            ) : (
              <div
                onClick={() => document.getElementById("cn-upload")?.click()}
                className="border-2 border-dashed border-input rounded-lg cursor-pointer hover:border-primary/50 transition-colors w-20 h-20 flex flex-col items-center justify-center"
              >
                <Upload className="h-4 w-4 text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">Logo</p>
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cn-name">Nom du réseau *</Label>
              <Input
                id="cn-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Tron (TRC-20)"
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cn-symbol">Symbole</Label>
              <Input
                id="cn-symbol"
                value={formData.symbol ?? ""}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value || "" })}
                placeholder="Ex: TRX"
                disabled={isPending}
              />
            </div>
          </div>

          {/* Parent crypto */}
          <div className="space-y-2">
            <Label htmlFor="cn-crypto">Cryptomonnaie parente</Label>
            <Select
              value={formData.crypto_id ?? "none"}
              onValueChange={(v) => setFormData({ ...formData, crypto_id: v === "none" ? null : v })}
              disabled={isPending}
            >
              <SelectTrigger id="cn-crypto">
                <SelectValue placeholder="Sélectionner une crypto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Aucune —</SelectItem>
                {cryptos.map((c: Crypto) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name ?? c.code} ({c.symbol ?? c.code.toUpperCase()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cn-address">Adresse de dépôt</Label>
              <Input
                id="cn-address"
                value={formData.address ?? ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value || null })}
                placeholder="Ex: TxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxX"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cn-fee">Frais réseau</Label>
              <Input
                id="cn-fee"
                type="number"
                step="0.0001"
                value={formData.fee ?? ""}
                onChange={(e) => setFormData({ ...formData, fee: e.target.value || null })}
                placeholder="Ex: 1.5"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
            <Label htmlFor="cn-is_active">Réseau actif</Label>
            <Switch
              id="cn-is_active"
              checked={formData.is_active}
              onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
              disabled={isPending}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {network ? "Mettre à jour" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
