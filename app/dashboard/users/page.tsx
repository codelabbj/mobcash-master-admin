"use client"

import { useState } from "react"
import { useUsers, useBlockUnblockUser, type User } from "@/hooks/useUsers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, ShieldAlert, ShieldCheck } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CopyButton } from "@/components/copy-button"
import { Button } from "@/components/ui/button"

export default function UsersPage() {
  const [search, setSearch] = useState("")
  const [isBlock, setIsBlock] = useState<string>("all")

  const params = {
    search: search || undefined,
    is_block: isBlock === "all" ? undefined : isBlock === "blocked",
  }

  const { data: usersData, isLoading } = useUsers(params)
  const users = usersData?.results || []

  const [loadingUserId, setLoadingUserId] = useState<string | null>(null)
  const blockUnblockMutation = useBlockUnblockUser()

  const handleToggleBlock = (user: User) => {
    setLoadingUserId(user.id)
    blockUnblockMutation.mutate(Number(user.id), {
      onSuccess: () => {
        setLoadingUserId(null)
      },
      onError: () => {
        setLoadingUserId(null)
      }
    })
  }


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Utilisateurs</h2>
        <p className="text-muted-foreground mt-2">Gérez les utilisateurs normaux</p>
      </div>

      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="border-b border-border/50 bg-muted/30">
          <CardTitle className="text-lg font-semibold">Filtres</CardTitle>
          <CardDescription className="text-sm">Rechercher et filtrer les utilisateurs</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="search">Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Rechercher par nom, email ou téléphone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select value={isBlock} onValueChange={setIsBlock}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les Utilisateurs</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="blocked">Bloqué</SelectItem>
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
              <CardTitle className="text-lg font-semibold">Liste des Utilisateurs</CardTitle>
              <CardDescription className="text-sm mt-1">Total : {usersData?.count || 0} utilisateurs</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : users && users.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border/50">
                    <TableHead className="font-semibold text-muted-foreground h-12">Nom</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Email</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Téléphone</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Code de Parrainage</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Statut</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Inscrit le</TableHead>
                    <TableHead className="text-right font-semibold text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, index) => (
                    <TableRow key={user.id} className={index % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                      <TableCell className="text-foreground">
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell className="text-muted-foreground">{user.phone || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            {user.referral_code || "-"}
                          </Badge>
                          {user.referral_code && <CopyButton value={user.referral_code} />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Badge variant={user.is_block ? "destructive" : "default"} className="font-medium">
                            {user.is_block ? "Bloqué" : "Actif"}
                          </Badge>
                          {user.is_active && (
                            <Badge variant="secondary" className="font-medium">
                              Actif
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(user.date_joined).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleBlock(user)}
                          disabled={loadingUserId !== null}
                          className={`h-8 px-3 text-xs font-semibold transition-all duration-200 ${
                            user.is_block
                              ? "border-emerald-500/30 text-emerald-600 hover:bg-emerald-50/50 hover:text-emerald-700 hover:border-emerald-500 dark:hover:bg-emerald-950/20"
                              : "border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive hover:border-destructive dark:hover:bg-destructive/10"
                          }`}
                        >
                          {loadingUserId === user.id ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : user.is_block ? (
                            <ShieldCheck className="h-3 w-3 mr-1" />
                          ) : (
                            <ShieldAlert className="h-3 w-3 mr-1" />
                          )}
                          {user.is_block ? "Débloquer" : "Bloquer"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">Aucun utilisateur trouvé</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

