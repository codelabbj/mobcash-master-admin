"use client"

import { useState } from "react"
import {
  useCancellationDebtBlacklist,
  useDeleteCancellationDebtBlacklist,
  type CancellationDebtBlacklist,
  type BlacklistParams,
} from "@/hooks/useCancellationDebtBlacklist"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Trash2 } from "lucide-react"
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

export default function CancellationDebtBlacklistPage() {
  const [filters, setFilters] = useState<BlacklistParams>({ page: 1, page_size: 20 })
  const [searchInput, setSearchInput] = useState("")
  const { data, isLoading } = useCancellationDebtBlacklist(filters)
  const deleteBlacklist = useDeleteCancellationDebtBlacklist()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<CancellationDebtBlacklist | null>(null)

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      search: searchInput.trim() || undefined,
    }))
  }

  const confirmDelete = () => {
    if (!itemToDelete) return
    deleteBlacklist.mutate(itemToDelete.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        setItemToDelete(null)
      },
    })
  }

  const formatList = (values: string[]) => (values?.length ? values.join(", ") : "—")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-3xl font-bold tracking-tight text-transparent">
          Liste noire
        </h2>
        <p className="text-muted-foreground">
          Annulations Connect — dette baissée aux opérations, sortie uniquement par suppression.
        </p>
      </div>

      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="border-b border-border/50 bg-muted/30">
          <CardTitle className="text-lg font-semibold">Recherche</CardTitle>
          <CardDescription className="text-sm">Tél, ID bet, user, référence…</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="search">Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Rechercher…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-8"
                />
              </div>
            </div>
            <Button onClick={handleSearch}>Chercher</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="border-b border-border/50 bg-muted/30">
          <CardTitle className="text-lg font-semibold">Entrées liste noire</CardTitle>
          <CardDescription className="mt-1 text-sm">
            Total : {data?.count ?? 0}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !data?.results?.length ? (
            <div className="py-12 text-center text-muted-foreground">
              Aucune entrée en liste noire
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dette</TableHead>
                  <TableHead>Téléphones</TableHead>
                  <TableHead>IDs bet</TableHead>
                  <TableHead>Réfs annulées</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Mis à jour</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.results.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-semibold">
                        {Number(item.debt_amount).toLocaleString()} FCFA
                      </div>
                      <Badge variant={item.is_active ? "default" : "secondary"} className="mt-1">
                        {item.is_active ? "active" : "inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[160px] break-words text-sm">
                      {formatList(item.phones)}
                    </TableCell>
                    <TableCell className="max-w-[160px] break-words text-sm">
                      {formatList(item.bet_app_ids)}
                    </TableCell>
                    <TableCell className="max-w-[160px] break-words text-sm">
                      {formatList(item.cancelled_references)}
                    </TableCell>
                    <TableCell className="max-w-xs whitespace-pre-wrap break-words text-xs text-amber-700 dark:text-amber-400">
                      {item.last_message || "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.updated_at
                        ? new Date(item.updated_at).toLocaleString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => {
                          setItemToDelete(item)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          disabled={!data?.previous || isLoading}
          onClick={() =>
            setFilters((prev) => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))
          }
        >
          Précédent
        </Button>
        <span className="text-sm text-muted-foreground">Page {filters.page || 1}</span>
        <Button
          variant="outline"
          disabled={!data?.next || isLoading}
          onClick={() =>
            setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))
          }
        >
          Suivant
        </Button>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer de la liste noire ?</AlertDialogTitle>
            <AlertDialogDescription>
              L&apos;utilisateur pourra à nouveau opérer normalement. Dette actuelle :{" "}
              {itemToDelete ? Number(itemToDelete.debt_amount).toLocaleString() : 0} FCFA.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteBlacklist.isPending}>
              {deleteBlacklist.isPending ? "Suppression…" : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
