"use client"

import { useState } from "react"
import { useTransactions, useCheckTransactionStatus, type Transaction, type TransactionFilters } from "@/hooks/useTransactions"
import { useNetworks, type Network } from "@/hooks/useNetworks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Search, RefreshCw, AlertCircle, MoreVertical, CheckCircle2, Gift } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { CreateTransactionDialog } from "@/components/create-transaction-dialog"
import { ChangeStatusDialog } from "@/components/change-status-dialog"
import { ShowStatusDialog } from "@/components/show-status-dialog"
import { ProcessTransactionDialog } from "@/components/process-transaction-dialog"
import { UpdateTransactionStatusDialog } from "@/components/update-transaction-status-dialog"
import { TransactionDetailsDialog } from "@/components/transaction-details-dialog"
import { CopyButton } from "@/components/copy-button"
import { FinalizeTransactionDialog } from "@/components/transactions/finalize-transaction-dialog"
import { RewardUserDialog } from "@/components/bonuses/reward-user-modal"

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    page_size: 100,
  })

  const { data: transactionsData, isLoading, isError, error } = useTransactions(filters)
  const { data: networks } = useNetworks()
  const checkStatus = useCheckTransactionStatus()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [showStatusDialogOpen, setShowStatusDialogOpen] = useState(false)
  const [processDialogOpen, setProcessDialogOpen] = useState(false)
  const [updateStatusDialogOpen, setUpdateStatusDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [finalizeDialogOpen, setFinalizeDialogOpen] = useState(false)
  const [rewardDialogOpen, setRewardDialogOpen] = useState(false)

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  const handleChangeStatus = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setStatusDialogOpen(true)
  }

  const handleShowStatus = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setShowStatusDialogOpen(true)
  }

  const handleProcessTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setProcessDialogOpen(true)
  }

  const handleUpdateStatus = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setUpdateStatusDialogOpen(true)
  }

  const handleShowDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setDetailsDialogOpen(true)
  }

  const handleFinalizeTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setFinalizeDialogOpen(true)
  }

  const handleRewardUser = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setRewardDialogOpen(true)
  }

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "accept":
        return "Accepté"
      case "reject":
        return "Rejeté"
      case "pending":
        return "En attente"
      case "timeout":
        return "Expiré"
      case "init_payment":
        return "Une etape sur 2"
      case "error":
        return "Erreur"
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "accept":
        return "default" // Green (success)
      case "reject":
        return "destructive" // Red (error)
      case "pending":
        return "secondary" // Gray/neutral
      case "timeout":
        return "outline" // Border only
      case "init_payment":
        return "secondary" // Gray/neutral (processing) - could also use a blue variant if available
      case "error":
        return "destructive" // Red (error)
      default:
        return "secondary" // Default fallback
    }
  }

  const getTypeTransLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case "deposit":
        return "Dépôt"
      case "withdrawal":
        return "Retrait"
      case "reward":
        return "Récompense"
      default:
        return type
    }
  }

  const getTypeTransColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "deposit":
        return "default" // Primary color
      case "withdrawal":
        return "secondary" // Secondary color
      case "reward":
        return "outline" // Outline style
      default:
        return "secondary"
    }
  }

  const getNetworkName = (networkId: number | null) => {
    if (!networkId) return "-"
    return networks?.find((n: Network) => n.id === networkId)?.public_name || "-"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Transactions</h2>
          <p className="text-muted-foreground">Gérez les dépôts et retraits</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Créer Transaction
        </Button>
      </div>

      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="border-b border-border/50 bg-muted/30">
          <CardTitle className="text-lg font-semibold">Filtres</CardTitle>
          <CardDescription className="text-sm">Rechercher et filtrer les transactions</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search">Rechercher Référence</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Rechercher par référence..."
                  value={filters.search || ""}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type de Transaction</Label>
              <Select
                value={filters.type_trans || "all"}
                onValueChange={(value) => setFilters({ ...filters, type_trans: value === "all" ? undefined : value })}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les Types</SelectItem>
                  <SelectItem value="deposit">Dépôt</SelectItem>
                  <SelectItem value="withdrawal">Retrait</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => setFilters({ ...filters, status: value === "all" ? undefined : value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les Statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="accept">Accepté</SelectItem>
                  <SelectItem value="reject">Rejeté</SelectItem>
                  <SelectItem value="timeout">Expiré</SelectItem>
                  <SelectItem value="init_payment">Une etape sur 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select
                value={filters.source || "all"}
                onValueChange={(value) => setFilters({ ...filters, source: value === "all" ? undefined : value })}
              >
                <SelectTrigger id="source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les Sources</SelectItem>
                  <SelectItem value="web">Web</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="network">Réseau</Label>
              <Select
                value={filters.network?.toString() || "all"}
                onValueChange={(value) =>
                  setFilters({ ...filters, network: value === "all" ? undefined : Number.parseInt(value) })
                }
              >
                <SelectTrigger id="network">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les Réseaux</SelectItem>
                  {networks?.map((network: Network) => (
                    <SelectItem key={network.id} value={network.id.toString()}>
                      {network.public_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="border-b border-border/50 bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Liste des Transactions</CardTitle>
              <CardDescription className="text-sm mt-1">Total : {transactionsData?.count || 0} transactions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm text-destructive mb-2">
                    Une erreur est survenue lors du chargement des transactions.
                  </div>
                  {error && <div className="text-xs text-destructive/70 mb-3">{error.message}</div>}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.reload()}
                      className="text-destructive border-destructive/20 hover:bg-destructive/5"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Recharger la page
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        // Force refetch of transactions
                        window.location.reload()
                      }}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Réessayer
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : transactionsData && transactionsData.results.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border/50">
                      <TableHead className="font-semibold text-muted-foreground h-12">Référence</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Type</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Montant</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">ID Pari</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Application</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Téléphone</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Réseau</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Statut</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Source</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Créé</TableHead>
                      <TableHead className="text-right font-semibold text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionsData.results.map((transaction: Transaction, index: number) => (
                      <TableRow key={transaction.id} className={index % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                        <TableCell className="font-mono text-xs text-foreground">
                          <div className="flex items-center gap-2">
                            {transaction.reference}
                            <CopyButton value={transaction.reference} />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getTypeTransColor(transaction.type_trans)} className="font-medium">
                            {getTypeTransLabel(transaction.type_trans)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">{transaction.amount} FCFA</TableCell>
                        <TableCell className="text-foreground">
                          {transaction.user_app_id ? (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-mono text-xs">{transaction.user_app_id}</Badge>
                              <CopyButton value={transaction.user_app_id} />
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {transaction.app_details?.name || "-"}
                        </TableCell>
                        <TableCell className="text-foreground">{transaction.phone_number || "-"}</TableCell>
                        <TableCell className="text-foreground">
                          {getNetworkName(transaction.network)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(transaction.status)} className="font-medium">
                            {getStatusLabel(transaction.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {transaction.source ? (
                            <Badge variant="outline" className="font-medium">{transaction.source}</Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(transaction.created_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Ouvrir le menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[200px]">
                              <DropdownMenuItem onClick={() => handleShowStatus(transaction)} className="text-blue-600">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Afficher Statut
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShowDetails(transaction)} className="text-primary font-bold">
                                <Search className="mr-2 h-4 w-4" />
                                Détails
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangeStatus(transaction)}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Changer Statut
                              </DropdownMenuItem>
                              {transaction.status === "pending" || transaction.status === "error" ? (
                                <DropdownMenuItem
                                  onClick={() => handleProcessTransaction(transaction)}
                                  className="text-green-600"
                                >
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Traiter
                                </DropdownMenuItem>
                              ) : null}
                              <DropdownMenuSeparator />
                              {transaction.status !== "accept" && (transaction.type_trans === "deposit" || transaction.type_trans === "withdrawal") && (
                                <DropdownMenuItem onClick={() => handleFinalizeTransaction(transaction)} className="text-green-600 font-medium">
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  CRÉDITER L'UTILISATEUR
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleRewardUser(transaction)} className="text-amber-600 font-medium">
                                <Gift className="mr-2 h-4 w-4" />
                                Récompenser
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(transaction)}
                                className="text-purple-600"
                              >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Changement manuel
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between px-6 py-4 border-t border-border/50">
                <div className="text-sm text-muted-foreground">
                  Page {filters.page} sur {Math.ceil((transactionsData?.count || 0) / (filters.page_size || 10))}
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
            <div className="text-center py-12 text-muted-foreground">Aucune transaction trouvée</div>
          )}
        </CardContent>
      </Card>

      <CreateTransactionDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <ChangeStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        transaction={selectedTransaction}
      />
      <ShowStatusDialog
        open={showStatusDialogOpen}
        onOpenChange={setShowStatusDialogOpen}
        transaction={selectedTransaction}
      />
      <ProcessTransactionDialog
        open={processDialogOpen}
        onOpenChange={setProcessDialogOpen}
        transaction={selectedTransaction}
      />
      <UpdateTransactionStatusDialog
        open={updateStatusDialogOpen}
        onOpenChange={setUpdateStatusDialogOpen}
        transaction={selectedTransaction}
      />
      <TransactionDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        transaction={selectedTransaction}
      />
      <FinalizeTransactionDialog
        open={finalizeDialogOpen}
        onOpenChange={setFinalizeDialogOpen}
        transaction={selectedTransaction}
      />
      <RewardUserDialog
        open={rewardDialogOpen}
        onOpenChange={setRewardDialogOpen}
        transaction={selectedTransaction}
      />
    </div>
  )
}
