"use client"

import { useEffect, useMemo, useState } from "react"
import {
  useMySolde,
  useUpdateMySoldeCommissions,
  type MySoldePeriod,
} from "@/hooks/useMySolde"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Loader2, PiggyBank, TrendingUp, Wallet } from "lucide-react"
import { CONFIG } from "@/lib/config"

function formatNumber(num: number): string {
  return new Intl.NumberFormat("fr-FR").format(num)
}

function formatMoney(num: number): string {
  return `${formatNumber(Math.round(num))} FCFA`
}

const PERIODS: { value: MySoldePeriod; label: string }[] = [
  { value: "today", label: "Aujourd'hui" },
  { value: "3d", label: "3 jours" },
  { value: "7d", label: "7 jours" },
  { value: "custom", label: "Personnalisé" },
]

export default function MySoldePage() {
  const [period, setPeriod] = useState<MySoldePeriod>("today")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [balanceAt, setBalanceAt] = useState("")
  const [depPct, setDepPct] = useState<string>("")
  const [witPct, setWitPct] = useState<string>("")

  const params = useMemo(
    () => ({
      period,
      from: period === "custom" && from ? from : undefined,
      to: period === "custom" && to ? to : undefined,
      balance_at: balanceAt || undefined,
    }),
    [period, from, to, balanceAt]
  )

  const { data, isLoading } = useMySolde(params)
  const updateCommissions = useUpdateMySoldeCommissions()

  useEffect(() => {
    if (!data) return
    setDepPct(String(data.commissions.deposit_commission_percent))
    setWitPct(String(data.commissions.withdrawal_commission_percent))
  }, [
    data?.commissions.deposit_commission_percent,
    data?.commissions.withdrawal_commission_percent,
  ])

  const handleSaveCommissions = () => {
    updateCommissions.mutate({
      deposit_commission_percent: Number(depPct),
      withdrawal_commission_percent: Number(witPct),
    })
  }

  const networkChart = (data?.by_network || []).slice(0, 8).map((row) => ({
    name: row.network_name,
    Dépôts: row.deposit_amount,
    Retraits: row.withdrawal_amount,
    Gains: Math.round(row.earnings),
  }))

  const appChart = (data?.by_app || [])
    .filter((row) => row.tx_count > 0)
    .slice(0, 8)
    .map((row) => ({
      name: row.app_name,
      Dépôts: row.deposit_amount,
      Retraits: row.withdrawal_amount,
      Gains: Math.round(row.earnings),
    }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-3xl font-bold tracking-tight text-transparent">
          My Solde
        </h2>
        <p className="text-muted-foreground">
          Gains estimés, volumes par réseau/app et soldes approximatifs ({CONFIG.APP_NAME})
        </p>
      </div>

      <Card className="border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Période</CardTitle>
          <CardDescription>Filtrer les transactions acceptées</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {PERIODS.map((p) => (
              <Button
                key={p.value}
                variant={period === p.value ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod(p.value)}
              >
                {p.label}
              </Button>
            ))}
          </div>
          {period === "custom" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="from">Du</Label>
                <Input
                  id="from"
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">Au</Label>
                <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Commissions (%)</CardTitle>
          <CardDescription>
            Pourcentage appliqué sur les montants acceptés pour estimer vos gains
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="space-y-2 flex-1">
            <Label htmlFor="dep-pct">Dépôt %</Label>
            <Input
              id="dep-pct"
              type="number"
              min={0}
              max={100}
              step={0.01}
              value={depPct}
              onChange={(e) => setDepPct(e.target.value)}
            />
          </div>
          <div className="space-y-2 flex-1">
            <Label htmlFor="wit-pct">Retrait %</Label>
            <Input
              id="wit-pct"
              type="number"
              min={0}
              max={100}
              step={0.01}
              value={witPct}
              onChange={(e) => setWitPct(e.target.value)}
            />
          </div>
          <Button onClick={handleSaveCommissions} disabled={updateCommissions.isPending}>
            {updateCommissions.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Enregistrer
          </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Gains estimés
                </CardTitle>
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatMoney(data.summary.earnings)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.from} → {data.to}
                </p>
              </CardContent>
            </Card>
            <Card className="border border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Volume dépôts
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatMoney(data.summary.deposit_amount)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.summary.deposit_count} txn
                </p>
              </CardContent>
            </Card>
            <Card className="border border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Volume retraits
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatMoney(data.summary.withdrawal_amount)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.summary.withdrawal_count} txn
                </p>
              </CardContent>
            </Card>
            <Card className="border border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Transactions
                </CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(data.summary.tx_count)}</div>
                <p className="text-xs text-muted-foreground mt-1">acceptées</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Par réseau</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                {networkChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={networkChart}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Dépôts" fill={CONFIG.CHART_1} />
                      <Bar dataKey="Retraits" fill={CONFIG.CHART_3} />
                      <Bar dataKey="Gains" fill={CONFIG.CHART_5} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-12">
                    Aucune donnée sur la période
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Par plateforme</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                {appChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={appChart}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Dépôts" fill={CONFIG.CHART_1} />
                      <Bar dataKey="Retraits" fill={CONFIG.CHART_3} />
                      <Bar dataKey="Gains" fill={CONFIG.CHART_5} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-12">
                    Aucune donnée sur la période
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Détail par réseau</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Réseau</TableHead>
                    <TableHead className="text-right">Dépôts</TableHead>
                    <TableHead className="text-right">Retraits</TableHead>
                    <TableHead className="text-right">Gains</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data.by_network || []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Aucune donnée
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.by_network.map((row) => (
                      <TableRow key={String(row.network_id ?? row.network_name)}>
                        <TableCell>{row.network_name}</TableCell>
                        <TableCell className="text-right">
                          {formatMoney(row.deposit_amount)}
                          <span className="text-muted-foreground text-xs ml-1">
                            ({row.deposit_count})
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatMoney(row.withdrawal_amount)}
                          <span className="text-muted-foreground text-xs ml-1">
                            ({row.withdrawal_count})
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatMoney(row.earnings)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Détail par plateforme</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>App</TableHead>
                    <TableHead className="text-right">Solde actuel</TableHead>
                    <TableHead className="text-right">Dépôts</TableHead>
                    <TableHead className="text-right">Retraits</TableHead>
                    <TableHead className="text-right">Gains</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data.by_app || []).map((row) => (
                    <TableRow key={String(row.app_id ?? row.app_name)}>
                      <TableCell>{row.app_name}</TableCell>
                      <TableCell className="text-right">
                        {row.current_solde != null ? formatMoney(row.current_solde) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatMoney(row.deposit_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatMoney(row.withdrawal_amount)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatMoney(row.earnings)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Solde approximatif à une date</CardTitle>
              <CardDescription>
                Dernier snapshot enregistré (Celery, après txn réussie) à ou avant cette date
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end max-w-md">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="balance-at">Date</Label>
                  <Input
                    id="balance-at"
                    type="date"
                    value={balanceAt}
                    onChange={(e) => setBalanceAt(e.target.value)}
                  />
                </div>
                {balanceAt && (
                  <Button variant="outline" size="sm" onClick={() => setBalanceAt("")}>
                    Effacer
                  </Button>
                )}
              </div>
              {data.balance_at && (
                <>
                  <p className="text-sm text-muted-foreground">{data.balance_at.message}</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>App</TableHead>
                        <TableHead className="text-right">Solde</TableHead>
                        <TableHead>Snapshot</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.balance_at.apps.map((app) => (
                        <TableRow key={app.app_id}>
                          <TableCell>{app.app_name}</TableCell>
                          <TableCell className="text-right">
                            {app.found && app.solde != null ? formatMoney(app.solde) : "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {app.snapshot_at
                              ? new Date(app.snapshot_at).toLocaleString("fr-FR")
                              : "Aucun snapshot"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <p className="text-muted-foreground">Impossible de charger My Solde</p>
      )}
    </div>
  )
}
