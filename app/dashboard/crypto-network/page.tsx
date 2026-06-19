"use client"

import { useState } from "react"
import { useCryptoNetworks, useDeleteCryptoNetwork, type CryptoNetwork } from "@/hooks/useCryptoNetworks"
import { CryptoNetworkDialog } from "@/components/crypto-network-dialog"
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

export default function CryptoNetworkPage() {
  const { data: networks, isLoading } = useCryptoNetworks()
  const deleteNetwork = useDeleteCryptoNetwork()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState<CryptoNetwork | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [networkToDelete, setNetworkToDelete] = useState<CryptoNetwork | null>(null)

  const handleEdit = (network: CryptoNetwork) => {
    setSelectedNetwork(network)
    setDialogOpen(true)
  }

  const handleCreate = () => {
    setSelectedNetwork(undefined)
    setDialogOpen(true)
  }

  const handleDelete = (network: CryptoNetwork) => {
    setNetworkToDelete(network)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (networkToDelete) {
      deleteNetwork.mutate(networkToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setNetworkToDelete(null)
        },
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Réseaux Crypto
          </h2>
          <p className="text-muted-foreground">
            Gérez les réseaux blockchain par cryptomonnaie (TRC-20, BEP-20, ERC-20…)
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter Réseau
        </Button>
      </div>

      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="border-b border-border/50 bg-muted/30">
          <CardTitle className="text-lg font-semibold">Liste des Réseaux Crypto</CardTitle>
          <CardDescription className="text-sm mt-1">
            Total : {networks?.length || 0} réseau(x)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : networks && networks.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border/50">
                    <TableHead className="font-semibold text-muted-foreground h-12">Logo</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Nom</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Symbole</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Crypto Parente</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Adresse de dépôt</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Frais</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Statut</TableHead>
                    <TableHead className="text-right font-semibold text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {networks.map((network, index) => (
                    <TableRow key={network.id} className={index % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                      <TableCell>
                        {network.logo ? (
                          <img
                            src={network.logo}
                            alt={network.name}
                            className="h-10 w-10 rounded-full object-contain border border-border bg-white p-0.5"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                            {(network.symbol ?? network.name).slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="font-semibold text-foreground">{network.name}</TableCell>

                      <TableCell className="font-medium text-foreground">{network.symbol ?? "—"}</TableCell>

                      <TableCell>
                        {network.crypto ? (
                          <Badge variant="outline" className="font-medium">
                            {network.crypto.name ?? network.crypto.code} (
                            {network.crypto.symbol ?? network.crypto.code.toUpperCase()})
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        {network.address ? (
                          <span
                            className="font-mono text-xs truncate block max-w-[160px]"
                            title={network.address}
                          >
                            {network.address}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-foreground">
                        {network.fee != null ? network.fee : <span className="text-muted-foreground">—</span>}
                      </TableCell>

                      <TableCell>
                        <Badge variant={network.is_active ? "default" : "secondary"}>
                          {network.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(network)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(network)}
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
            <div className="text-center py-12 text-muted-foreground">Aucun réseau crypto trouvé</div>
          )}
        </CardContent>
      </Card>

      <CryptoNetworkDialog open={dialogOpen} onOpenChange={setDialogOpen} network={selectedNetwork} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Ceci supprimera définitivement le réseau &ldquo;{networkToDelete?.name}&rdquo;.
              Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteNetwork.isPending ? (
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
