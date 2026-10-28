"use client"

import { useMemo, useState } from "react"
import {
  useDeletePrediction,
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
import { PredictionDialog } from "@/components/prediction-dialog"
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
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  Pencil,
  Search,
  Target,
  Trash2,
  TrendingUp,
  X,
  XCircle,
} from "lucide-react"

type Period = "today" | "week" | "month" | "all"

const PERIODS: { value: Period; label: string }[] = [
  { value: "today", label: "Aujourd'hui" },
  { value: "week", label: "Cette semaine" },
  { value: "month", label: "30 derniers jours" },
  { value: "all", label: "Tout" },
]

function toIso(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

function todayIso(): string {
  return toIso(new Date())
}

function startOfWeekIso(): string {
  const date = new Date()
  const mondayOffset = (date.getDay() + 6) % 7
  date.setDate(date.getDate() - mondayOffset)
  return toIso(date)
}

function daysAgoIso(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return toIso(date)
}

function periodToDateParams(period: Period): Pick<PredictionsParams, "date" | "from" | "to"> {
  switch (period) {
    case "today":
      return { date: todayIso() }
    case "week":
      return { from: startOfWeekIso(), to: todayIso() }
    case "month":
      return { from: daysAgoIso(29), to: todayIso() }
    default:
      return {}
  }
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

const OUTCOME_META: Record<PredictionOutcome, { label: string; className: string }> = {
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
  const [period, setPeriod] = useState<Period>("week")
  const [outcome, setOutcome] = useState("all")
  const [searchInput, setSearchInput] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [search, setSearch] = useState("")

  const filters = useMemo<PredictionsParams>(
    () => ({
      ...periodToDateParams(period),
      outcome: outcome === "all" ? undefined : (outcome as PredictionOutcome),
      search: search || undefined,
      page,
      page_size: pageSize,
    }),
    [period, outcome, search, page, pageSize]
  )

  const { data, isLoading, isFetching } = usePredictions(filters)
  const deletePrediction = useDeletePrediction()

  const [editingPrediction, setEditingPrediction] = useState<PredictionAdminRow | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PredictionAdminRow | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const openEdit = (row: PredictionAdminRow) => {
    setEditingPrediction(row)
    setEditOpen(true)
  }

  const openDelete = (row: PredictionAdminRow) => {
    setDeleteTarget(row)
    setDeleteOpen(true)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    deletePrediction.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteOpen(false)
        setDeleteTarget(null)
      },
    })
  }

  const applySearch = () => {
    setPage(1)
    setSearch(searchInput.trim())
  }

  const changePeriod = (value: Period) => {
    setPeriod(value)
    setPage(1)
  }

  const changeOutcome = (value: string) => {
    setOutcome(value)
    setPage(1)
  }

  const resetFilters = () => {
    setPeriod("week")
    setOutcome("all")
    setSearchInput("")
    setSearch("")
    setPage(1)
  }

  const summary = data?.summary

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
        <TableCell className="whitespace-nowrap text-sm">{formatDateTime(row.kickoff_at)}</TableCell>
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
          <Badge className={meta.className}>
            {row.outcome === "won" && <Check className="h-3 w-3" />}
            {row.outcome === "lost" && <X className="h-3 w-3" />}
            {meta.label}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge variant={row.is_published ? "default" : "outline"}>
            {row.is_published ? "Publié" : "Brouillon"}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              title="Modifier"
              onClick={() => openEdit(row)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Supprimer"
              onClick={() => openDelete(row)}
            >
              <Trash2 className="h-4 w-4 text-rose-500" />
            </Button>
          </div>
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
            Historique des pronostics générés automatiquement, avec résultats et taux de réussite.
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
          <CardTitle className="text-lg font-semibold">Période et filtres</CardTitle>
          <CardDescription className="text-sm">
            Tous les pronostics déjà générés sont consultables, y compris ceux verrouillés côté
            application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap gap-2">
            {PERIODS.map((item) => (
              <Button
                key={item.value}
                variant={period === item.value ? "default" : "outline"}
                size="sm"
                onClick={() => changePeriod(item.value)}
              >
                {item.label}
              </Button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="outcome">Résultat</Label>
              <Select value={outcome} onValueChange={changeOutcome}>
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
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="search">Recherche</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Équipe, championnat, pari…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applySearch()}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={applySearch} className="flex-1">
                Filtrer
              </Button>
              <Button variant="outline" onClick={resetFilters}>
                Réinitialiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
              En attente
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.pending ?? 0}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {summary?.void ?? 0} annulé(s)
            </p>
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
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-primary/20">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${summary?.win_rate ?? 0}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="border-b border-border/50 bg-muted/30">
          <CardTitle className="text-lg font-semibold">Liste des pronostics</CardTitle>
          <CardDescription className="mt-1 text-sm">Total : {data?.count ?? 0}</CardDescription>
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
                    <TableHead>Validation</TableHead>
                    <TableHead>Visibilité</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                onChangePage={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      <PredictionDialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) setEditingPrediction(null)
        }}
        prediction={editingPrediction}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce pronostic ?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `${deleteTarget.home.name} vs ${deleteTarget.away.name} (${formatDate(
                    deleteTarget.prediction_date
                  )})`
                : ""}
              <br />
              Il ne sera plus visible par les utilisateurs. Cette action est définitive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deletePrediction.isPending}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {deletePrediction.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
