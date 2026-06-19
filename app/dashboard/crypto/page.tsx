"use client"

import { useState } from "react"
import { useCryptos, useDeleteCrypto, type Crypto } from "@/hooks/useCrypto"
import { CryptoDialog } from "@/components/crypto-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Loader2, Plus, Pencil, Trash2, MoreVertical } from "lucide-react"

export default function CryptoPage() {
  const { data: cryptos, isLoading } = useCryptos()
  const deleteCrypto = useDeleteCrypto()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCrypto, setSelectedCrypto] = useState<Crypto | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [cryptoToDelete, setCryptoToDelete] = useState<Crypto | null>(null)

  const handleEdit = (crypto: Crypto) => {
    setSelectedCrypto(crypto)
    setDialogOpen(true)
  }

  const handleCreate = () => {
    setSelectedCrypto(undefined)
    setDialogOpen(true)
  }

  const handleDelete = (crypto: Crypto) => {
    setCryptoToDelete(crypto)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (cryptoToDelete) {
      deleteCrypto.mutate(cryptoToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setCryptoToDelete(null)
        },
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Cryptomonnaies
          </h2>
          <p className="text-muted-foreground">Gérez les cryptomonnaies et leurs prix</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter Crypto
        </Button>
      </div>

      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="border-b border-border/50 bg-muted/30">
          <CardTitle className="text-lg font-semibold">Liste des Cryptomonnaies</CardTitle>
          <CardDescription className="text-sm mt-1">
            Total : {cryptos?.length || 0} cryptomonnaie(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : cryptos && cryptos.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border/50">
                    <TableHead className="font-semibold text-muted-foreground h-12">Logo</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Code / Nom</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Symbole</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Prix Achat / unité</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Prix Vente / unité</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Min/Max Achat</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Min/Max Vente</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Statut</TableHead>
                    <TableHead className="text-right font-semibold text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cryptos.map((crypto, index) => (
                    <TableRow key={crypto.id} className={index % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                      <TableCell>
                        {crypto.logo ? (
                          <img
                            src={crypto.logo}
                            alt={crypto.name ?? crypto.code}
                            className="h-10 w-10 rounded-full object-contain border border-border bg-white p-0.5"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                            {crypto.code.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-foreground">{crypto.code.toUpperCase()}</div>
                        <div className="text-xs text-muted-foreground">{crypto.name ?? "—"}</div>
                      </TableCell>

                      <TableCell className="font-medium text-foreground">{crypto.symbol ?? "—"}</TableCell>

                      <TableCell>
                        {crypto.buy_price != null ? (
                          <span className="font-semibold text-green-600">
                            {Number(crypto.buy_price).toLocaleString("fr-FR")} FCFA
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm italic">Non défini</span>
                        )}
                      </TableCell>

                      <TableCell>
                        {crypto.sale_price != null ? (
                          <span className="font-semibold text-red-500">
                            {Number(crypto.sale_price).toLocaleString("fr-FR")} FCFA
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm italic">Non défini</span>
                        )}
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {crypto.minimun_buy != null || crypto.max_buy != null
                          ? `${crypto.minimun_buy ?? "—"} – ${crypto.max_buy ?? "—"}`
                          : "—"}
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {crypto.minimun_sale != null || crypto.max_sale != null
                          ? `${crypto.minimun_sale ?? "—"} – ${crypto.max_sale ?? "—"}`
                          : "—"}
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={crypto.active_for_buy ? "default" : "secondary"}
                            className="text-[10px] w-fit"
                          >
                            Achat: {crypto.active_for_buy ? "Actif" : "Inactif"}
                          </Badge>
                          <Badge
                            variant={crypto.active_for_sale ? "default" : "secondary"}
                            className="text-[10px] w-fit"
                          >
                            Vente: {crypto.active_for_sale ? "Actif" : "Inactif"}
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(crypto)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(crypto)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">Aucune cryptomonnaie trouvée</div>
          )}
        </CardContent>
      </Card>

      <CryptoDialog open={dialogOpen} onOpenChange={setDialogOpen} crypto={selectedCrypto} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Ceci supprimera définitivement la cryptomonnaie &ldquo;
              {cryptoToDelete?.name ?? cryptoToDelete?.code}&rdquo;. Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCrypto.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
