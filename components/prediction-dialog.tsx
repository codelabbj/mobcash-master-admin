"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
  useUpdatePrediction,
  type PredictionAdminRow,
  type PredictionOutcome,
} from "@/hooks/usePredictions"
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
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

const MARKET_OPTIONS: { value: string; label: string }[] = [
  { value: "home", label: "Victoire domicile" },
  { value: "draw", label: "Match nul" },
  { value: "away", label: "Victoire extérieur" },
  { value: "double_chance_1x", label: "Double chance 1X" },
  { value: "double_chance_12", label: "Double chance 12" },
  { value: "double_chance_x2", label: "Double chance X2" },
  { value: "over_25", label: "Plus de 2.5 buts" },
  { value: "under_25", label: "Moins de 2.5 buts" },
  { value: "ah_home_plus_1", label: "Handicap dom +1" },
  { value: "ah_away_plus_1", label: "Handicap ext +1" },
  { value: "home_minus_15", label: "Domicile -1.5 buts" },
  { value: "home_minus_25", label: "Domicile -2.5 buts" },
  { value: "away_minus_15", label: "Extérieur -1.5 buts" },
]

interface PredictionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prediction: PredictionAdminRow | null
}

export function PredictionDialog({ open, onOpenChange, prediction }: PredictionDialogProps) {
  const updatePrediction = useUpdatePrediction()

  const [market, setMarket] = useState("")
  const [marketLabel, setMarketLabel] = useState("")
  const [probability, setProbability] = useState("")
  const [confidence, setConfidence] = useState<"low" | "medium" | "high">("medium")
  const [outcome, setOutcome] = useState<PredictionOutcome>("pending")
  const [published, setPublished] = useState(true)

  useEffect(() => {
    if (!open || !prediction) return
    setMarket(prediction.best_market)
    setMarketLabel(prediction.best_market_label)
    setProbability((prediction.best_market_prob * 100).toFixed(1))
    setConfidence(prediction.confidence_level)
    setOutcome(prediction.outcome)
    setPublished(prediction.is_published)
  }, [open, prediction])

  const handleMarketChange = (value: string) => {
    setMarket(value)
    const option = MARKET_OPTIONS.find((item) => item.value === value)
    if (option) setMarketLabel(option.label)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prediction) return

    const prob = Number(probability)
    updatePrediction.mutate(
      {
        id: prediction.id,
        data: {
          best_market: market,
          best_market_label: marketLabel,
          best_market_prob: Number.isFinite(prob) ? Math.min(Math.max(prob / 100, 0), 1) : undefined,
          confidence_level: confidence,
          outcome,
          is_published: published,
        },
      },
      {
        onSuccess: () => onOpenChange(false),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier le pronostic</DialogTitle>
          <DialogDescription>
            {prediction
              ? `${prediction.home.name} vs ${prediction.away.name} — ${prediction.competition.name}`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="market">Pari conseillé</Label>
            <Select value={market} onValueChange={handleMarketChange}>
              <SelectTrigger id="market">
                <SelectValue placeholder="Choisir un marché" />
              </SelectTrigger>
              <SelectContent>
                {MARKET_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="market-label">Libellé affiché</Label>
            <Input
              id="market-label"
              value={marketLabel}
              onChange={(e) => setMarketLabel(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="probability">Probabilité (%)</Label>
              <Input
                id="probability"
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={probability}
                onChange={(e) => setProbability(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confidence">Confiance</Label>
              <Select
                value={confidence}
                onValueChange={(value) => setConfidence(value as "low" | "medium" | "high")}
              >
                <SelectTrigger id="confidence">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyen</SelectItem>
                  <SelectItem value="high">Élevé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="outcome">Validation</Label>
              <Select
                value={outcome}
                onValueChange={(value) => setOutcome(value as PredictionOutcome)}
              >
                <SelectTrigger id="outcome">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="won">Gagné ✓</SelectItem>
                  <SelectItem value="lost">Perdu ✗</SelectItem>
                  <SelectItem value="void">Annulé / remboursé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <div className="flex w-full items-center justify-between rounded-md border border-border/60 px-3 py-2">
                <Label htmlFor="published" className="cursor-pointer">
                  Visible côté users
                </Label>
                <Switch id="published" checked={published} onCheckedChange={setPublished} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={updatePrediction.isPending}>
              {updatePrediction.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
