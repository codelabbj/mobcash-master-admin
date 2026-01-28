"use client"

import { useState } from "react"
import { useCoupons, useDeleteCoupon, type Coupon, type CouponFilters } from "@/hooks/useCoupons"
import { usePlatforms } from "@/hooks/usePlatforms"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Plus, Pencil, Search, Trash2 } from "lucide-react"
import { CouponDialog } from "@/components/coupon-dialog"
import { DeleteCouponDialog } from "@/components/delete-coupon-dialog"
import { CopyButton } from "@/components/copy-button"

export default function CouponsPage() {
  const [filters, setFilters] = useState<CouponFilters>({
    page: 1,
    page_size: 10,
  })
  const { data: couponsData, isLoading } = useCoupons(filters)
  const { data: platforms } = usePlatforms({})
  const deleteCoupon = useDeleteCoupon()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null)

  const handleEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon)
    setDialogOpen(true)
  }

  const handleCreate = () => {
    setSelectedCoupon(null)
    setDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setSelectedCoupon(null)
    }
  }

  const handleDelete = (coupon: Coupon) => {
    setCouponToDelete(coupon)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (couponToDelete) {
      deleteCoupon.mutate(couponToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setCouponToDelete(null)
        },
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Coupons
          </h2>
          <p className="text-muted-foreground">Gérez les coupons de parrainage</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Créer un Coupon
        </Button>
      </div>

      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="border-b border-border/50 bg-muted/30">
          <CardTitle className="text-lg font-semibold">Filtres</CardTitle>
          <CardDescription className="text-sm">Rechercher et filtrer les coupons</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="search">Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Rechercher par code..."
                  value={filters.search || ""}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined, page: 1 })}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bet_app">Plateforme</Label>
              <Select
                value={filters.bet_app || "all"}
                onValueChange={(value) =>
                  setFilters({ ...filters, bet_app: value === "all" ? undefined : value, page: 1 })
                }
              >
                <SelectTrigger id="bet_app">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les Plateformes</SelectItem>
                  {platforms?.map((platform) => (
                    <SelectItem key={platform.id} value={platform.id}>
                      {platform.name}
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
              <CardTitle className="text-lg font-semibold">Liste des Coupons</CardTitle>
              <CardDescription className="text-sm mt-1">
                Total : {couponsData?.count || 0} coupons
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : couponsData && couponsData.results.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border/50">
                      <TableHead className="font-semibold text-muted-foreground h-12">ID</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Code</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Plateforme</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">App ID</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Créé le</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {couponsData.results.map((coupon, index) => (
                      <TableRow key={coupon.id} className={index % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                        <TableCell className="font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            {coupon.id}
                            <CopyButton value={coupon.id} />
                          </div>
                        </TableCell>
                        <TableCell className="font-mono font-semibold text-foreground">{coupon.code}</TableCell>
                        <TableCell className="text-foreground font-medium">
                          {coupon.bet_app_details?.name || coupon.bet_app}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            {coupon.bet_app}
                            <CopyButton value={coupon.bet_app} />
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(coupon.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(coupon)}
                              className="h-8"
                            >
                              <Pencil className="mr-2 h-3 w-3" />
                              Modifier
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(coupon)}
                              disabled={deleteCoupon.isPending}
                              className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="mr-2 h-3 w-3" />
                              Supprimer
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {couponsData && (couponsData.next || couponsData.previous) && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-border/50">
                  <div className="text-sm text-muted-foreground">
                    Page {filters.page || 1} sur {Math.ceil((couponsData.count || 0) / (filters.page_size || 10))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                      disabled={!couponsData.previous}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                      disabled={!couponsData.next}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">Aucun coupon trouvé</div>
          )}
        </CardContent>
      </Card>

      <CouponDialog open={dialogOpen} onOpenChange={handleDialogClose} coupon={selectedCoupon} />
      <DeleteCouponDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        couponCode={couponToDelete?.code || ""}
        isPending={deleteCoupon.isPending}
      />
    </div>
  )
}

