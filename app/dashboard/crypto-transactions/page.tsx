"use client"

import { useState } from "react"
import type React from "react"
import {
  useCryptoTransactions,
  useApproveCryptoTransaction,
  type CryptoTransaction,
  type CryptoTransactionFilters,
} from "@/hooks/useCryptoTransactions"
import { CopyButton } from "@/components/copy-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Loader2, Search, RefreshCw, AlertCircle, MoreVertical, CheckCircle2 } from "lucide-react"

// ── helpers ──────────────────────────────────────────────────────────────────

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    accept: "Accepté",
    pending: "En attente",
    reject: "Rejeté",
    timeout: "Expiré",
    init_payment: "Paiement init.",
    error: "Erreur",
  }
  return map[status] ?? status
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "accept") return "default"
  if (status === "pending" || status === "init_payment") return "secondary"
  if (status === "reject" || status === "error") return "destructive"
  return "outline"
}

function getTypeLabel(type: string) {
  return type === "buy" ? "Achat" : type === "sale" ? "Vente" : type
}

function getTypeVariant(type: string): "default" | "secondary" | "outline" {
  return type === "buy" ? "default" : type === "sale" ? "secondary" : "outline"
}

// ── Approve dialog ────────────────────────────────────────────────────────────

interface ApproveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: CryptoTransaction | null
}

function ApproveDialog({ open, onOpenChange, transaction }: ApproveDialogProps) {
  const approve = useApproveCryptoTransaction()

  const handleApprove = () => {
    if (!transaction) return
    approve.mutate(transaction.reference, {
      onSuccess: () => onOpenChange(false),
    })
  }

  const isBuy = transaction?.type_trans === "buy"

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isBuy ? "Approuver l'achat crypto" : "Approuver la vente crypto"}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">
              Réf : <span className="font-mono text-xs font-bold">{transaction?.reference}</span>
            </span>
            {isBuy ? (
              <span className="block">
                Confirmez que vous avez envoyé{" "}
                <strong>{transaction?.total_crypto} {transaction?.crypto?.symbol ?? transaction?.crypto?.code}</strong> à
                l'adresse du client. Le statut passera à <strong>Accepté</strong> et le client sera notifié.
              </span>
            ) : (
              <span className="block">
                Confirmez que vous avez reçu la crypto du client. Le paiement mobile money de{" "}
                <strong>{transaction?.amount != null ? `${Number(transaction.amount).toLocaleString("fr-FR")} FCFA` : "—"}</strong> sera
                déclenché automatiquement.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={approve.isPending}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleApprove}
            disabled={approve.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {approve.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement...
              </>
            ) : (
              "Confirmer l'approbation"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CryptoTransactionsPage() {
  const [filters, setFilters] = useState<CryptoTransactionFilters>({
    page: 1,
    page_size: 50,
  })

  const { data: transactionsData, isLoading, isError, error, refetch } = useCryptoTransactions(filters)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<CryptoTransaction | null>(null)

  const handleApprove = (tx: CryptoTransaction) => {
    setSelectedTransaction(tx)
    setApproveDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Transactions Crypto
          </h2>
          <p className="text-muted-foreground">Suivez et approuvez les transactions d&apos;achat et de vente de crypto</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {/* Filters */}
      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="border-b border-border/50 bg-muted/30">
          <CardTitle className="text-lg font-semibold">Filtres</CardTitle>
          <CardDescription>Filtrer les transactions crypto</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Recherche</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Référence, utilisateur..."
                  value={filters.search || ""}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined, page: 1 })}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={filters.type_trans || "all"}
                onValueChange={(v) => setFilters({ ...filters, type_trans: v === "all" ? undefined : v, page: 1 })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Achat + Vente</SelectItem>
                  <SelectItem value="buy">Achat uniquement</SelectItem>
                  <SelectItem value="sale">Vente uniquement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(v) => setFilters({ ...filters, status: v === "all" ? undefined : v, page: 1 })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="accept">Accepté</SelectItem>
                  <SelectItem value="reject">Rejeté</SelectItem>
                  <SelectItem value="error">Erreur</SelectItem>
                  <SelectItem value="init_payment">Paiement init.</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Par page</Label>
              <Select
                value={String(filters.page_size || 50)}
                onValueChange={(v) => setFilters({ ...filters, page_size: Number(v), page: 1 })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="border-b border-border/50 bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Liste des Transactions</CardTitle>
              <CardDescription className="text-sm mt-1">
                Total : {transactionsData?.count || 0} transaction(s)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="m-4 rounded-md border border-destructive/40 bg-destructive/10 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-destructive mb-2">Erreur lors du chargement.</p>
                  {error && <p className="text-xs text-destructive/70">{(error as Error).message}</p>}
                  <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3">
                    <RefreshCw className="h-3 w-3 mr-1" /> Réessayer
                  </Button>
                </div>
              </div>
            </div>
          ) : transactionsData && transactionsData.results.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table className="min-w-[1100px]">
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border/50">
                      <TableHead className="font-semibold text-muted-foreground h-12">Référence</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Type</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Crypto</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Montant</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Quantité</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Utilisateur</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Téléphone</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Détails Crypto</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Statut</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Date</TableHead>
                      <TableHead className="text-right font-semibold text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionsData.results.map((tx, index) => (
                      <TableRow key={tx.id} className={index % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                        {/* Reference */}
                        <TableCell className="font-mono text-xs">
                          <div className="flex items-center gap-1">
                            <span className="truncate max-w-[110px]" title={tx.reference}>{tx.reference}</span>
                            <CopyButton value={tx.reference} />
                          </div>
                        </TableCell>

                        {/* Type */}
                        <TableCell>
                          <Badge variant={getTypeVariant(tx.type_trans)} className="font-medium">
                            {getTypeLabel(tx.type_trans)}
                          </Badge>
                        </TableCell>

                        {/* Crypto */}
                        <TableCell>
                          {tx.crypto ? (
                            <div className="flex items-center gap-2">
                              {tx.crypto.logo && (
                                <img
                                  src={tx.crypto.logo}
                                  alt={tx.crypto.code}
                                  className="h-6 w-6 rounded-full object-contain border border-border bg-white"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                                />
                              )}
                              <div>
                                <div className="font-medium text-xs">{tx.crypto.code.toUpperCase()}</div>
                                {tx.crypto.name && (
                                  <div className="text-[10px] text-muted-foreground">{tx.crypto.name}</div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        {/* Montant FCFA */}
                        <TableCell className="font-semibold text-foreground">
                          {tx.amount != null ? `${Number(tx.amount).toLocaleString("fr-FR")} FCFA` : "—"}
                        </TableCell>

                        {/* Quantité crypto */}
                        <TableCell className="text-sm">
                          {tx.total_crypto ? (
                            <span className="font-mono">
                              {tx.total_crypto} {tx.crypto?.symbol ?? tx.crypto?.code ?? ""}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        {/* User */}
                        <TableCell>
                          {tx.user ? (
                            <div>
                              <div className="text-sm font-medium text-foreground">
                                {tx.user.first_name} {tx.user.last_name}
                              </div>
                              <div className="text-xs text-muted-foreground truncate max-w-[130px]">{tx.user.email}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                          {tx.user_app_id && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Badge variant="outline" className="font-mono text-[10px]">{tx.user_app_id}</Badge>
                              <CopyButton value={tx.user_app_id} />
                            </div>
                          )}
                        </TableCell>

                        {/* Phone */}
                        <TableCell className="text-foreground">{tx.phone_number || "—"}</TableCell>

                        {/* Crypto details:
                            buy  → wallet_link holds the buyer's receiving address
                            sale → hash holds the blockchain TX hash from the user */}
                        <TableCell>
                          {tx.type_trans === "buy" && tx.wallet_link ? (
                            <div className="flex items-center gap-1">
                              <div>
                                <div className="text-[10px] text-muted-foreground uppercase font-bold">Adresse client</div>
                                <span className="font-mono text-xs truncate max-w-[100px] block" title={tx.wallet_link}>
                                  {tx.wallet_link}
                                </span>
                              </div>
                              <CopyButton value={tx.wallet_link} />
                            </div>
                          ) : tx.type_trans === "sale" && tx.hash ? (
                            <div className="flex items-center gap-1">
                              <div>
                                <div className="text-[10px] text-muted-foreground uppercase font-bold">Hash TX</div>
                                <span className="font-mono text-xs truncate max-w-[100px] block" title={tx.hash}>
                                  {tx.hash}
                                </span>
                              </div>
                              <CopyButton value={tx.hash} />
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        {/* Wallet link (separate column — only for sale where user sends from their wallet) */}
                        {/* Status */}
                        <TableCell>
                          <Badge variant={getStatusVariant(tx.status)} className="font-medium">
                            {getStatusLabel(tx.status)}
                          </Badge>
                          {tx.error_message && (
                            <p
                              className="text-[10px] text-destructive mt-0.5 max-w-[120px] truncate"
                              title={tx.error_message}
                            >
                              {tx.error_message}
                            </p>
                          )}
                        </TableCell>

                        {/* Date */}
                        <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                          {new Date(tx.created_at).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Quick approve button for pending transactions */}
                            {tx.status === "pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprove(tx)}
                                className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 h-8"
                              >
                                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                Approuver
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleApprove(tx)}
                                  className="text-green-600"
                                  disabled={tx.status === "accept"}
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  {tx.type_trans === "buy"
                                    ? "Confirmer envoi crypto"
                                    : "Confirmer réception crypto"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-border/50">
                <div className="text-sm text-muted-foreground">
                  Page {filters.page} sur{" "}
                  {Math.max(1, Math.ceil((transactionsData?.count || 0) / (filters.page_size || 50)))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                    disabled={!transactionsData?.previous}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                    disabled={!transactionsData?.next}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Aucune transaction crypto trouvée
            </div>
          )}
        </CardContent>
      </Card>

      <ApproveDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        transaction={selectedTransaction}
      />
    </div>
  )
}
