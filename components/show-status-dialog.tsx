"use client"

import type React from "react"

import { useCheckTransactionStatus, type Transaction } from "@/hooks/useTransactions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react"

interface ShowStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction | null
}

export function ShowStatusDialog({ open, onOpenChange, transaction }: ShowStatusDialogProps) {
  const checkStatus = useCheckTransactionStatus()

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "accept":
      case "accepted":
        return "Accepté"
      case "reject":
      case "rejected":
        return "Rejeté"
      case "pending":
        return "En attente"
      case "timeout":
        return "Expiré"
      case "init_payment":
        return "Une etape sur 2"
      case "error":
        return "Erreur"
      case "success":
        return "Succès"
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "accept":
      case "accepted":
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "reject":
      case "rejected":
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "pending":
      case "init_payment":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "timeout":
        return <Clock className="h-5 w-5 text-gray-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "accept":
      case "accepted":
      case "success":
        return "default" // Green (success)
      case "reject":
      case "rejected":
      case "error":
        return "destructive" // Red (error)
      case "pending":
        return "secondary" // Gray/neutral
      case "timeout":
        return "outline" // Border only
      case "init_payment":
        return "secondary" // Gray/neutral (processing)
      default:
        return "secondary" // Default fallback
    }
  }

  const handleCheckStatus = () => {
    if (!transaction) return

    checkStatus.mutate(
      { reference: transaction.reference },
      {
        onSuccess: (data) => {
          // The status will be shown from the response
          console.log("Transaction status response:", data)
        },
      },
    )
  }

  const statusResponse = checkStatus.data

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vérifier le Statut de Transaction</DialogTitle>
          <DialogDescription>Vérifiez le statut actuel de la transaction depuis l'API</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm">
              <strong>Référence:</strong> {transaction?.reference}
            </p>
            <p className="text-sm">
              <strong>Statut en base:</strong>{" "}
              <Badge variant={getStatusColor(transaction?.status || "")} className="ml-1">
                {getStatusLabel(transaction?.status || "")}
              </Badge>
            </p>
          </div>

          {!statusResponse ? (
            <div className="text-center py-4">
              <Button onClick={handleCheckStatus} disabled={checkStatus.isPending}>
                {checkStatus.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Vérification en cours...
                  </>
                ) : (
                  "Vérifier le Statut"
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {getStatusIcon(statusResponse.status || "")}
                <span className="text-sm font-medium">Statut depuis l'API:</span>
              </div>
              <div className="bg-card border p-3 rounded-md">
                <Badge variant={getStatusColor(statusResponse.status || "")} className="mb-2">
                  {getStatusLabel(statusResponse.status || "")}
                </Badge>
                {statusResponse.message && (
                  <p className="text-sm text-muted-foreground">{statusResponse.message}</p>
                )}
                {statusResponse.details && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(statusResponse.details, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          {statusResponse && (
            <Button onClick={handleCheckStatus} disabled={checkStatus.isPending}>
              {checkStatus.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualisation...
                </>
              ) : (
                "Actualiser"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
