"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useCreateCrypto, useUpdateCrypto, type Crypto, type CryptoInput } from "@/hooks/useCrypto"
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

const EMPTY_FORM: Partial<CryptoInput> = {
  logo: null,
  code: "",
  name: "",
  symbol: "",
  buy_price: null,
  sale_price: null,
  sale_adress: null,
  fee: null,
  minimun_buy: null,
  max_buy: null,
  minimun_sale: null,
  max_sale: null,
  active_for_sale: true,
  active_for_buy: true,
}

interface CryptoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  crypto?: Crypto
}

export function CryptoDialog({ open, onOpenChange, crypto }: CryptoDialogProps) {
  const createCrypto = useCreateCrypto()
  const updateCrypto = useUpdateCrypto()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState<Partial<CryptoInput>>(EMPTY_FORM)

  useEffect(() => {
    if (crypto) {
      setFormData({
        logo: crypto.logo,
        code: crypto.code,
        name: crypto.name ?? "",
        symbol: crypto.symbol ?? "",
        buy_price: crypto.buy_price,
        sale_price: crypto.sale_price,
        sale_adress: crypto.sale_adress,
        fee: crypto.fee,
        minimun_buy: crypto.minimun_buy,
        max_buy: crypto.max_buy,
        minimun_sale: crypto.minimun_sale,
        max_sale: crypto.max_sale,
        active_for_sale: crypto.active_for_sale,
        active_for_buy: crypto.active_for_buy,
      })
      setSelectedImage(crypto.logo || null)
    } else {
      setFormData(EMPTY_FORM)
      setSelectedImage(null)
    }
    setFile(null)
  }, [crypto, open])

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
    if (crypto) {
      updateCrypto.mutate(
        { id: crypto.id, data: formData, file: file ?? undefined },
        { onSuccess: () => handleOpenChange(false) },
      )
    } else {
      createCrypto.mutate(
        { data: formData, file: file ?? undefined },
        { onSuccess: () => handleOpenChange(false) },
      )
    }
  }

  const isPending = createCrypto.isPending || updateCrypto.isPending

  const setNum = (field: keyof CryptoInput, val: string) =>
    setFormData({ ...formData, [field]: val === "" ? null : Number(val) })

  const setStr = (field: keyof CryptoInput, val: string) =>
    setFormData({ ...formData, [field]: val === "" ? null : val })

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {crypto ? "Modifier la cryptomonnaie" : "Ajouter une cryptomonnaie"}
          </DialogTitle>
          <DialogDescription>
            {crypto
              ? "Mettez à jour les détails de la cryptomonnaie."
              : "Ajoutez une nouvelle cryptomonnaie au système."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Logo */}
          <div className="space-y-2">
            <Label>Logo</Label>
            <Input id="crypto-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            {selectedImage ? (
              <div
                className="relative group w-24 h-24 rounded-lg overflow-hidden cursor-pointer border border-border"
                onClick={() => document.getElementById("crypto-upload")?.click()}
              >
                <img src={selectedImage} alt="aperçu" className="w-full h-full object-contain p-1 bg-white" />
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-70 transition-opacity">
                  <p className="text-white text-xs">Changer</p>
                </div>
              </div>
            ) : (
              <div
                onClick={() => document.getElementById("crypto-upload")?.click()}
                className="border-2 border-dashed border-input rounded-lg cursor-pointer hover:border-primary/50 transition-colors w-24 h-24 flex flex-col items-center justify-center"
              >
                <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">Logo</p>
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Code */}
            <div className="space-y-2">
              <Label htmlFor="code">
                Code CoinGecko *{" "}
                <span className="text-xs text-muted-foreground">(ex: bitcoin, tether)</span>
              </Label>
              <Input
                id="code"
                value={formData.code ?? ""}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Ex: bitcoin, ethereum, tron"
                required
                disabled={isPending}
              />
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nom affiché</Label>
              <Input
                id="name"
                value={formData.name ?? ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value || null })}
                placeholder="Ex: Bitcoin"
                disabled={isPending}
              />
            </div>

            {/* Symbol */}
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbole</Label>
              <Input
                id="symbol"
                value={formData.symbol ?? ""}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value || null })}
                placeholder="Ex: BTC"
                disabled={isPending}
              />
            </div>

            {/* Sale address */}
            <div className="space-y-2">
              <Label htmlFor="sale_adress">Adresse de réception (vente)</Label>
              <Input
                id="sale_adress"
                value={formData.sale_adress ?? ""}
                onChange={(e) => setFormData({ ...formData, sale_adress: e.target.value || null })}
                placeholder="Ex: TxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxX"
                disabled={isPending}
              />
            </div>

            {/* Buy price */}
            <div className="space-y-2">
              <Label htmlFor="buy_price">
                Prix Achat / unité (FCFA){" "}
                <span className="text-xs text-muted-foreground">montant payé par l'utilisateur</span>
              </Label>
              <Input
                id="buy_price"
                type="number"
                value={formData.buy_price ?? ""}
                onChange={(e) => setNum("buy_price", e.target.value)}
                placeholder="Ex: 500000"
                disabled={isPending}
              />
            </div>

            {/* Sale price */}
            <div className="space-y-2">
              <Label htmlFor="sale_price">
                Prix Vente / unité (FCFA){" "}
                <span className="text-xs text-muted-foreground">montant versé à l'utilisateur</span>
              </Label>
              <Input
                id="sale_price"
                type="number"
                value={formData.sale_price ?? ""}
                onChange={(e) => setNum("sale_price", e.target.value)}
                placeholder="Ex: 480000"
                disabled={isPending}
              />
            </div>

            {/* Fee */}
            <div className="space-y-2">
              <Label htmlFor="fee">Frais (%)</Label>
              <Input
                id="fee"
                type="number"
                step="0.01"
                value={formData.fee ?? ""}
                onChange={(e) => setStr("fee", e.target.value)}
                placeholder="Ex: 1.50"
                disabled={isPending}
              />
            </div>

            {/* Min buy */}
            <div className="space-y-2">
              <Label htmlFor="minimun_buy">Minimum Achat (FCFA)</Label>
              <Input
                id="minimun_buy"
                type="number"
                value={formData.minimun_buy ?? ""}
                onChange={(e) => setNum("minimun_buy", e.target.value)}
                placeholder="Ex: 1000"
                disabled={isPending}
              />
            </div>

            {/* Max buy */}
            <div className="space-y-2">
              <Label htmlFor="max_buy">Maximum Achat (FCFA)</Label>
              <Input
                id="max_buy"
                type="number"
                value={formData.max_buy ?? ""}
                onChange={(e) => setNum("max_buy", e.target.value)}
                placeholder="Ex: 500000"
                disabled={isPending}
              />
            </div>

            {/* Min sale */}
            <div className="space-y-2">
              <Label htmlFor="minimun_sale">Minimum Vente (FCFA)</Label>
              <Input
                id="minimun_sale"
                type="number"
                value={formData.minimun_sale ?? ""}
                onChange={(e) => setNum("minimun_sale", e.target.value)}
                placeholder="Ex: 1000"
                disabled={isPending}
              />
            </div>

            {/* Max sale */}
            <div className="space-y-2">
              <Label htmlFor="max_sale">Maximum Vente (FCFA)</Label>
              <Input
                id="max_sale"
                type="number"
                value={formData.max_sale ?? ""}
                onChange={(e) => setNum("max_sale", e.target.value)}
                placeholder="Ex: 500000"
                disabled={isPending}
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <Label htmlFor="active_for_buy">Actif pour achat</Label>
              <Switch
                id="active_for_buy"
                checked={formData.active_for_buy ?? true}
                onCheckedChange={(v) => setFormData({ ...formData, active_for_buy: v })}
                disabled={isPending}
              />
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <Label htmlFor="active_for_sale">Actif pour vente</Label>
              <Switch
                id="active_for_sale"
                checked={formData.active_for_sale ?? true}
                onCheckedChange={(v) => setFormData({ ...formData, active_for_sale: v })}
                disabled={isPending}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {crypto ? "Mettre à jour" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
