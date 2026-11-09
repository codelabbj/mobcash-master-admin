"use client"

import type React from "react"
import { useRetryWithdrawal, type Transaction } from "@/hooks/useTransactions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, RotateCcw } from "lucide-react"

interface RetryWithdrawalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction | null
}

export function RetryWithdrawalDialog({ open, onOpenChange, transaction }: RetryWithdrawalDialogProps) {
  const retryWithdrawal = useRetryWithdrawal()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!transaction) return

    retryWithdrawal.mutate(
      { reference: transaction.reference },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-orange-500" />
            Relancer le retrait
          </DialogTitle>
          <DialogDescription>
            Relance le payout du retrait vers le réseau de paiement ({transaction?.api?.toUpperCase()}).
            Cette action remet le retrait en <strong>pending</strong> et déclenche un nouvel envoi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-muted p-3 rounded-md space-y-1">
            <p className="text-sm">
              <strong>Référence :</strong> {transaction?.reference}
            </p>
            <p className="text-sm">
              <strong>Montant :</strong> {transaction?.amount} FCFA
            </p>
            <p className="text-sm">
              <strong>Téléphone :</strong> {transaction?.phone_number || "—"}
            </p>
            <p className="text-sm">
              <strong>Statut actuel :</strong> {transaction?.status}
            </p>
            <p className="text-sm">
              <strong>API :</strong> {transaction?.api?.toUpperCase() || "—"}
            </p>
            <p className="text-sm">
              <strong>Payout démarré :</strong> {transaction?.payout_started ? "Oui" : "Non"}
            </p>
            <p className="text-sm">
              <strong>Payout terminé :</strong> {transaction?.payout_done ? "Oui" : "Non"}
            </p>
          </div>

          <div className="rounded-md border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
            ⚠️ Les flags <code>payout_started</code> et <code>payout_done</code> seront réinitialisés
            pour permettre un nouvel envoi. Assurez-vous que le paiement précédent n'a pas abouti.
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={retryWithdrawal.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={retryWithdrawal.isPending}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {retryWithdrawal.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Relance en cours...
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Confirmer la relance
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
