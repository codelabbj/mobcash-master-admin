"use client"

import type React from "react"

import { useState } from "react"
import { useCreateDeposit } from "@/hooks/useDeposits"
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

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateDepositDialog({ open, onOpenChange }: Props) {
  const createDeposit = useCreateDeposit()
  const { data: platforms, isLoading: loadingPlatforms } = usePlatforms({})

  const [depositData, setDepositData] = useState({
    amount: "",
    bet_app: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createDeposit.mutate(
      {
        amount: Number.parseFloat(depositData.amount),
        bet_app: depositData.bet_app,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          setDepositData({
            amount: "",
            bet_app: "",
          })
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un Dépôt</DialogTitle>
          <DialogDescription>Créer un nouveau dépôt en fournissant le montant et la plateforme</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deposit-amount">Montant *</Label>
            <Input
              id="deposit-amount"
              type="number"
              step="0.01"
              value={depositData.amount}
              onChange={(e) => setDepositData({ ...depositData, amount: e.target.value })}
              placeholder="1000"
              required
              disabled={createDeposit.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deposit-platform">Plateforme *</Label>
            <Select
              value={depositData.bet_app}
              onValueChange={(value) => setDepositData({ ...depositData, bet_app: value })}
              disabled={createDeposit.isPending || loadingPlatforms}
            >
              <SelectTrigger id="deposit-platform" className="w-full">
                <SelectValue placeholder="Sélectionner une plateforme..." />
              </SelectTrigger>
              <SelectContent>
                {platforms !== undefined && platforms.length > 0 ? (
                  platforms.map((platform) => (
                    <SelectItem key={platform.id} value={platform.id}>
                      {platform.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="None">Aucune plateforme disponible</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createDeposit.isPending}
              className="hover:bg-primary/10"
            >
              Annuler
            </Button>
            <Button type="submit" disabled={createDeposit.isPending}>
              {createDeposit.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer le Dépôt"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}