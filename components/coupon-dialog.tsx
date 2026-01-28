"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useCreateCoupon, useUpdateCoupon, type CouponInput, type Coupon } from "@/hooks/useCoupons"
import { usePlatforms } from "@/hooks/usePlatforms"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface CouponDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coupon?: Coupon | null
}

export function CouponDialog({ open, onOpenChange, coupon }: CouponDialogProps) {
  const createCoupon = useCreateCoupon()
  const updateCoupon = useUpdateCoupon()
  const { data: platforms, isLoading: isLoadingPlatforms } = usePlatforms({})

  const [formData, setFormData] = useState<CouponInput>({
    bet_app: "",
    code: "",
  })

  // Reset form when dialog opens/closes or coupon changes
  useEffect(() => {
    if (open) {
      if (coupon) {
        setFormData({
          bet_app: coupon.bet_app,
          code: coupon.code,
        })
      } else {
        setFormData({
          bet_app: "",
          code: "",
        })
      }
    }
  }, [open, coupon])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (coupon) {
      updateCoupon.mutate(
        { id: coupon.id, data: formData },
        {
          onSuccess: () => {
            onOpenChange(false)
            setFormData({ bet_app: "", code: "" })
          },
        }
      )
    } else {
      createCoupon.mutate(formData, {
        onSuccess: () => {
          onOpenChange(false)
          setFormData({ bet_app: "", code: "" })
        },
      })
    }
  }

  const isPending = createCoupon.isPending || updateCoupon.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{coupon ? "Modifier le Coupon" : "Créer un Coupon"}</DialogTitle>
          <DialogDescription>
            {coupon ? "Modifiez les informations du coupon" : "Créez un nouveau coupon pour une plateforme"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bet_app">Plateforme *</Label>
            {isLoadingPlatforms ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Select
                value={formData.bet_app}
                onValueChange={(value) => setFormData({ ...formData, bet_app: value })}
                disabled={isPending}
                required
              >
                <SelectTrigger id="bet_app">
                  <SelectValue placeholder="Choisir une plateforme..." />
                </SelectTrigger>
                <SelectContent>
                  {platforms?.map((platform) => (
                    <SelectItem key={platform.id} value={platform.id}>
                      {platform.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Code du Coupon *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="Entrez le code du coupon"
              required
              disabled={isPending}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {coupon ? "Mise à jour..." : "Création..."}
                </>
              ) : coupon ? (
                "Mettre à jour"
              ) : (
                "Créer le Coupon"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

