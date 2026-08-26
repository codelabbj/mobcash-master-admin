"use client"

import { useState } from "react"
import { usePlatforms, useDeletePlatform, type Platform, type PlatformFilters } from "@/hooks/usePlatforms"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Pencil, Trash2, Search, MoreVertical } from "lucide-react"
import { PlatformDialog } from "@/components/platform-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

export default function PlatformsPage() {
  const [filters, setFilters] = useState<PlatformFilters>({})
  const { data: platforms, isLoading } = usePlatforms(filters)
  const deletePlatform = useDeletePlatform()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [platformToDelete, setPlatformToDelete] = useState<Platform | null>(null)

  const handleEdit = (platform: Platform) => {
    setSelectedPlatform(platform)
    setDialogOpen(true)
  }

  const handleCreate = () => {
    setSelectedPlatform(undefined)
    setDialogOpen(true)
  }

  const handleDelete = (platform: Platform) => {
    setPlatformToDelete(platform)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (platformToDelete) {
      deletePlatform.mutate(platformToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setPlatformToDelete(null)
        },
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Plateformes</h2>
          <p className="text-muted-foreground">Gérez les plateformes de paris</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter Plateforme
        </Button>
      </div>

      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="border-b border-border/50 bg-muted/30">
          <CardTitle className="text-lg font-semibold">Filtres</CardTitle>
          <CardDescription className="text-sm">Rechercher et filtrer les plateformes</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="search">Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Rechercher par nom..."
                  value={filters.search || ""}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="enable">Statut</Label>
              <Select
                value={filters.enable === undefined ? "all" : filters.enable ? "enabled" : "disabled"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    enable: value === "all" ? undefined : value === "enabled",
                  })
                }
              >
                <SelectTrigger id="enable">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="enabled">Actif</SelectItem>
                  <SelectItem value="disabled">Inactif</SelectItem>
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
              <CardTitle className="text-lg font-semibold">Liste des Plateformes</CardTitle>
              <CardDescription className="text-sm mt-1">Total : {platforms?.length || 0} plateformes</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : platforms && platforms.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border/50">
                      <TableHead className="font-semibold text-muted-foreground h-12">Nom</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">BetMomo</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Statut</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Actif Dépôt</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Actif Retrait</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Dépôt Min</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Dépôt Max</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Retrait Min</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Gain Max</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Localisation</TableHead>
                      <TableHead className="text-right font-semibold text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {platforms.map((platform, index) => (
                      <TableRow key={platform.id} className={index % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                        <TableCell className="font-semibold text-foreground">{platform.name}</TableCell>
                        <TableCell>
                          <Badge variant={platform.uses_betmomo ? "default" : "secondary"} className="font-medium">
                            {platform.uses_betmomo ? "Actif" : platform.has_betmomo_token ? "Token OK" : "—"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={platform.enable ? "default" : "secondary"} className="font-medium">
                            {platform.enable ? "Actif" : "Inactif"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={platform.active_for_deposit ? "default" : "secondary"} className="font-medium">
                            {platform.active_for_deposit ? "Oui" : "Non"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={platform.active_for_with ? "default" : "secondary"} className="font-medium">
                            {platform.active_for_with ? "Oui" : "Non"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-foreground">{platform.minimun_deposit} FCFA</TableCell>
                        <TableCell className="text-foreground">{platform.max_deposit} FCFA</TableCell>
                        <TableCell className="text-foreground">{platform.minimun_with} FCFA</TableCell>
                        <TableCell className="text-foreground">{platform.max_win} FCFA</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {platform.city && platform.street ? `${platform.city}, ${platform.street}` : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(platform)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(platform)} className="text-destructive">
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
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">Aucune plateforme trouvée</div>
          )}
        </CardContent>
      </Card>

      <PlatformDialog open={dialogOpen} onOpenChange={setDialogOpen} platform={selectedPlatform} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Ceci supprimera définitivement la plateforme "{platformToDelete?.name}". Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              {deletePlatform.isPending ? (
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
