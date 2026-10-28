"use client"

import { useState } from "react"
import {
  usePredictions,
  type PredictionAdminRow,
  type PredictionOutcome,
  type PredictionsParams,
} from "@/hooks/usePredictions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import TablePagination from "@/components/table-pagination"
import { CheckCircle2, Clock, Loader2, Search, Target, TrendingUp, XCircle } from "lucide-react"

function todayIso(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${now.getFullYear()}-${month}-${day}`
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

const OUTCOME_META: Record<
  PredictionOutcome,
  { label: string; className: string }
> = {
  won: { label: "Gagné", className: "bg-emerald-500 text-white" },
  lost: { label: "Perdu", className: "bg-rose-500 text-white" },
  pending: { label: "En attente", className: "bg-gray-400 text-white" },
  void: { label: "Annulé", className: "bg-amber-500 text-white" },
}

const CONFIDENCE_LABEL: Record<string, string> = {
  low: "Faible",
  medium: "Moyen",
  high: "Élevé",
}

const FIXTURE_STATUS_LABEL: Record<string, string> = {
  scheduled: "À venir",
  live: "En direct",
  finished: "Terminé",
  postponed: "Reporté",
  cancelled: "Annulé",
}

export default function PredictionsPage() {
  const [date, setDate] = useState(todayIso())
  const [outcome, setOutcome] = useState("all")
  const [searchInput, setSearchInput] = useState("")
  const [filters, setFilters] = useState<PredictionsParams>({
    date: todayIso(),
    page: 1,
    page_size: 20,
  })

  const { data, isLoading, isFetching } = usePredictions(filters)

  const applyFilters = () => {
    setFilters({
      date: date || undefined,
      outcome: outcome === "all" ? undefined : (outcome as PredictionOutcome),
      search: searchInput.trim() || undefined,
      page: 1,
      page_size: 20,
    })
  }

  const resetFilters = () => {
    const today = todayIso()
    setDate(today)
    setOutcome("all")
    setSearchInput("")
    setFilters({ date: today, page: 1, page_size: 20 })
  }

  const summary = data?.summary
  const page = filters.page ?? 1
  const pageSize = filters.page_size ?? 20

  const renderRow = (row: PredictionAdminRow) => {
    const meta = OUTCOME_META[row.outcome] ?? OUTCOME_META.pending
    const score =
      row.score_home !== null && row.score_away !== null
        ? `${row.score_home} - ${row.score_away}`
        : "—"

    return (
      <TableRow key={row.id}>
        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
          {formatDate(row.prediction_date)}
        </TableCell>
        <TableCell>
          <div className="font-medium">
            {row.home.name} <span className="text-muted-foreground">vs</span> {row.away.name}
          </div>
          <div className="text-xs text-muted-foreground">{row.competition.name}</div>
        </TableCell>
        <TableCell className="whitespace-nowrap text-sm">
          {formatDateTime(row.kickoff_at)}
        </TableCell>
        <TableCell>
          <div className="font-medium">{row.best_market_label}</div>
          <div className="text-xs text-muted-foreground">
            {CONFIDENCE_LABEL[row.confidence_level] ?? row.confidence_level} ·{" "}
            {(row.best_market_prob * 100).toFixed(1)}%
          </div>
        </TableCell>
        <TableCell className="text-sm">
          <div>{score}</div>
          <div className="text-xs text-muted-foreground">
            {FIXTURE_STATUS_LABEL[row.status] ?? row.status}
            {row.status === "live" && row.minute ? ` · ${row.minute}'` : ""}
          </div>
        </TableCell>
        <TableCell>
          <Badge className={meta.className}>{meta.label}</Badge>
        </TableCell>
        <TableCell>
          <Badge variant={row.is_published ? "default" : "outline"}>
            {row.is_published ? "Publié" : "Brouillon"}
          </Badge>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-3xl font-bold tracking-tight text-transparent">
            Pronostics
          </h2>
          <p className="text-muted-foreground">
            Consultation des pronostics générés automatiquement (API-Football + moteur).
          </p>
        </div>
        {isFetching && !isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Actualisation…
          </div>
        )}
      </div>

      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="border-b border-border/50 bg-muted/30">
          <CardTitle className="text-lg font-semibold">Filtres</CardTitle>
          <CardDescription className="text-sm">
            Date vide = toutes les dates. Les pronostics restent visibles ici même si le
            module est verrouillé côté application.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date du prono</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outcome">Résultat</Label>
              <Select value={outcome} onValueChange={setOutcome}>
                <SelectTrigger id="outcome">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les résultats</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="won">Gagné</SelectItem>
                  <SelectItem value="lost">Perdu</SelectItem>
                  <SelectItem value="void">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">Recherche</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Équipe, championnat, pari…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={applyFilters} className="flex-1">
                Filtrer
              </Button>
              <Button variant="outline" onClick={resetFilters}>
                Réinitialiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pronostics
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.total ?? 0}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {summary?.published ?? 0} publié(s)
            </p>
          </CardContent>
        </Card>
        <Card className="border border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gagnés</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{summary?.won ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="border border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Perdus</CardTitle>
            <XCircle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{summary?.lost ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="border border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taux de réussite
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.win_rate !== null && summary?.win_rate !== undefined
                ? `${summary.win_rate}%`
                : "—"}
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {summary?.pending ?? 0} en attente
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="border-b border-border/50 bg-muted/30">
          <CardTitle className="text-lg font-semibold">Liste des pronostics</CardTitle>
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
              Aucun pronostic pour ces filtres
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Match</TableHead>
                    <TableHead>Coup d&apos;envoi</TableHead>
                    <TableHead>Pari conseillé</TableHead>
                    <TableHead>Score / Statut</TableHead>
                    <TableHead>Résultat</TableHead>
                    <TableHead>Visibilité</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{data.results.map(renderRow)}</TableBody>
              </Table>
              <TablePagination
                page={page}
                pageSize={pageSize}
                total={data.count}
                disablePreviousPage={!data.previous}
                disableNextPage={!data.next}
                onChangePage={(nextPage) =>
                  setFilters((prev) => ({ ...prev, page: nextPage }))
                }
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
