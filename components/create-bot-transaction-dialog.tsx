"use client"

import type React from "react"

import { useState } from "react"
import { useCreateBotDeposit, useCreateBotWithdrawal } from "@/hooks/useBotTransactions"
import { useNetworks } from "@/hooks/useNetworks"
import { usePlatforms } from "@/hooks/usePlatforms"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

interface CreateBotTransactionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateBotTransactionDialog({ open, onOpenChange }: CreateBotTransactionDialogProps) {
    const createDeposit = useCreateBotDeposit()
    const createWithdrawal = useCreateBotWithdrawal()
    const { data: networks, isLoading: loadingNetworks } = useNetworks()
    const { data: platforms, isLoading: loadingPlatforms } = usePlatforms({})

    const [depositData, setDepositData] = useState({
        amount: "",
        phone_number: "",
        app: "",
        user_app_id: "",
        network: "",
        source: "bot" as "web" | "mobile" | "bot",
    })

    const [withdrawalData, setWithdrawalData] = useState({
        amount: "",
        phone_number: "",
        app: "",
        user_app_id: "",
        network: "",
        withdriwal_code: "",
        source: "bot" as "web" | "mobile" | "bot",
    })

    const handleDepositSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        createDeposit.mutate(
            {
                amount: Number.parseFloat(depositData.amount),
                phone_number: depositData.phone_number,
                app: depositData.app,
                user_app_id: depositData.user_app_id,
                network: Number.parseInt(depositData.network),
                source: depositData.source,
            },
            {
                onSuccess: () => {
                    onOpenChange(false)
                    setDepositData({
                        amount: "",
                        phone_number: "",
                        app: "",
                        user_app_id: "",
                        network: "",
                        source: "bot",
                    })
                },
            },
        )
    }

    const handleWithdrawalSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        createWithdrawal.mutate(
            {
                amount: Number.parseFloat(withdrawalData.amount),
                phone_number: withdrawalData.phone_number,
                app: withdrawalData.app,
                user_app_id: withdrawalData.user_app_id,
                network: Number.parseInt(withdrawalData.network),
                withdriwal_code: withdrawalData.withdriwal_code,
                source: withdrawalData.source,
            },
            {
                onSuccess: () => {
                    onOpenChange(false)
                    setWithdrawalData({
                        amount: "",
                        phone_number: "",
                        app: "",
                        user_app_id: "",
                        network: "",
                        withdriwal_code: "",
                        source: "bot",
                    })
                },
            },
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Créer une Transaction Bot</DialogTitle>
                    <DialogDescription>Créer un nouveau dépôt ou retrait bot</DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="deposit" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="deposit">Dépôt</TabsTrigger>
                        <TabsTrigger value="withdrawal">Retrait</TabsTrigger>
                    </TabsList>

                    <TabsContent value="deposit">
                        <form onSubmit={handleDepositSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="deposit-amount">Montant *</Label>
                                    <Input
                                        id="deposit-amount"
                                        type="number"
                                        value={depositData.amount}
                                        onChange={(e) => setDepositData({ ...depositData, amount: e.target.value })}
                                        placeholder="1000"
                                        required
                                        disabled={createDeposit.isPending}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="deposit-phone">Numéro de Téléphone *</Label>
                                    <Input
                                        id="deposit-phone"
                                        value={depositData.phone_number}
                                        onChange={(e) => setDepositData({ ...depositData, phone_number: e.target.value })}
                                        placeholder="2250700000000"
                                        required
                                        disabled={createDeposit.isPending}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="deposit-app">Plateforme *</Label>
                                    <Select
                                        value={depositData.app}
                                        onValueChange={(value) => setDepositData({ ...depositData, app: value })}
                                        disabled={createDeposit.isPending || loadingPlatforms}
                                    >
                                        <SelectTrigger id="deposit-app" className="w-full">
                                            <SelectValue placeholder="Sélectionner une plateforme..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {platforms !== undefined && platforms.length > 0 ? (
                                                platforms.map((platform) => (
                                                    <SelectItem key={platform.id} value={platform.id}>
                                                        {platform.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="None">Aucune plateforme disponible</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="deposit-user-app-id">ID de paris *</Label>
                                    <Input
                                        id="deposit-user-app-id"
                                        value={depositData.user_app_id}
                                        onChange={(e) => setDepositData({ ...depositData, user_app_id: e.target.value })}
                                        placeholder="123456789"
                                        required
                                        disabled={createDeposit.isPending}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="deposit-network">Réseau *</Label>
                                    <Select
                                        value={depositData.network}
                                        onValueChange={(value) => setDepositData({ ...depositData, network: value })}
                                        disabled={createDeposit.isPending || loadingNetworks}
                                    >
                                        <SelectTrigger className="w-full" id="deposit-network">
                                            <SelectValue placeholder="Sélectionner un réseau" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {networks?.map((network) => (
                                                <SelectItem key={network.id} value={network.id.toString()}>
                                                    {network.public_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    disabled={createDeposit.isPending}
                                    className="hover:bg-primary/10"
                                >
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={createDeposit.isPending}>
                                    {createDeposit.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Création...
                                        </>
                                    ) : (
                                        "Créer le Dépôt Bot"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </TabsContent>

                    <TabsContent value="withdrawal">
                        <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="withdrawal-amount">Montant *</Label>
                                    <Input
                                        id="withdrawal-amount"
                                        type="number"
                                        value={withdrawalData.amount}
                                        onChange={(e) => setWithdrawalData({ ...withdrawalData, amount: e.target.value })}
                                        placeholder="1000"
                                        required
                                        disabled={createWithdrawal.isPending}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="withdrawal-phone">Numéro de Téléphone *</Label>
                                    <Input
                                        id="withdrawal-phone"
                                        value={withdrawalData.phone_number}
                                        onChange={(e) => setWithdrawalData({ ...withdrawalData, phone_number: e.target.value })}
                                        placeholder="2250700000000"
                                        required
                                        disabled={createWithdrawal.isPending}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="withdrawal-app">Plateforme *</Label>
                                    <Select
                                        value={withdrawalData.app}
                                        onValueChange={(value) => setWithdrawalData({ ...withdrawalData, app: value })}
                                        disabled={createWithdrawal.isPending || loadingPlatforms}
                                    >
                                        <SelectTrigger id="withdrawal-app" className="w-full">
                                            <SelectValue placeholder="Sélectionner une plateforme" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {platforms !== undefined && platforms.length > 0 ? (
                                                platforms.map((platform) => (
                                                    <SelectItem key={platform.id} value={platform.id}>
                                                        {platform.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="None">Aucune plateforme disponible</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="withdrawal-user-app-id">ID de paris *</Label>
                                    <Input
                                        id="withdrawal-user-app-id"
                                        value={withdrawalData.user_app_id}
                                        onChange={(e) => setWithdrawalData({ ...withdrawalData, user_app_id: e.target.value })}
                                        placeholder="123456789"
                                        required
                                        disabled={createWithdrawal.isPending}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="withdrawal-code">Code de Retrait *</Label>
                                    <Input
                                        id="withdrawal-code"
                                        value={withdrawalData.withdriwal_code}
                                        onChange={(e) => setWithdrawalData({ ...withdrawalData, withdriwal_code: e.target.value })}
                                        placeholder="1234"
                                        required
                                        disabled={createWithdrawal.isPending}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="withdrawal-network">Réseau *</Label>
                                    <Select
                                        value={withdrawalData.network}
                                        onValueChange={(value) => setWithdrawalData({ ...withdrawalData, network: value })}
                                        disabled={createWithdrawal.isPending || loadingNetworks}
                                    >
                                        <SelectTrigger className="w-full" id="withdrawal-network">
                                            <SelectValue placeholder="Sélectionner un réseau" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {networks?.map((network) => (
                                                <SelectItem key={network.id} value={network.id.toString()}>
                                                    {network.public_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    disabled={createWithdrawal.isPending}
                                    className="hover:bg-primary/10"
                                >
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={createWithdrawal.isPending}>
                                    {createWithdrawal.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Création...
                                        </>
                                    ) : (
                                        "Créer le Retrait Bot"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}