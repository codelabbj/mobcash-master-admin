"use client"

import { useBonuses } from "@/hooks/useBonuses"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import {useState} from "react";
import TablePagination from "@/components/table-pagination";

export default function BonusesPage() {
    const { data: bonusesData, isLoading } = useBonuses()
    const [page, setPage] = useState(1)
    const pageSize = 10

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Bonus</h2>
                <p className="text-muted-foreground">Consultez les bonus et récompenses des utilisateurs</p>
            </div>

            <Card className="border border-border/50 shadow-sm">
                <CardHeader className="border-b border-border/50 bg-muted/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-semibold">Liste des Bonus</CardTitle>
                            <CardDescription className="text-sm mt-1">Total : {bonusesData?.count || 0} bonus</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : bonusesData && bonusesData.results.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border/50">
                                        <TableHead className="font-semibold text-muted-foreground">Montant</TableHead>
                                        <TableHead className="font-semibold text-muted-foreground">Raison</TableHead>
                                        <TableHead className="font-semibold text-muted-foreground">Utilisateur</TableHead>
                                        <TableHead className="font-semibold text-muted-foreground">Créé le</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bonusesData.results.map((bonus, index) => (
                                        <TableRow key={bonus.id} className={index % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                                            <TableCell>
                                                <Badge variant="default" className="font-mono font-semibold">
                                                    {bonus.amount} FCFA
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-foreground">{bonus.reason_bonus}</TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    {bonus.user.first_name && bonus.user.first_name ?`${bonus.user.first_name} ${bonus.user.last_name}`:'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{new Date(bonus.created_at).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <TablePagination
                                page={page}
                                pageSize={pageSize}
                                total={bonusesData.count}
                                disableNextPage={!bonusesData.next}
                                disablePreviousPage={!bonusesData.previous}
                                onChangePage={setPage}
                            />
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">Aucun bonus trouvé</div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
