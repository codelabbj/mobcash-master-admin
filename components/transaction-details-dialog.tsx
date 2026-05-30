"use client"

import type React from "react"
import { type Transaction, type TransactionStatusEntry } from "@/hooks/useTransactions"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CopyButton } from "@/components/copy-button"
import {
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    User,
    Smartphone,
    CreditCard,
    Building2,
    Activity,
    Webhook,
    History,
    MessageSquare,
    Zap,
    DollarSign,
    ArrowRightLeft,
    Globe,
} from "lucide-react"

interface TransactionDetailsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    transaction: Transaction | null
}

const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    })
}

const StatusBoolBadge = ({ value, trueLabel = "Oui", falseLabel = "Non" }: { value: boolean; trueLabel?: string; falseLabel?: string }) => (
    <Badge
        variant={value ? "default" : "secondary"}
        className={`text-xs font-semibold ${value ? "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}
    >
        {value ? <CheckCircle2 className="h-3 w-3 mr-1 inline" /> : <XCircle className="h-3 w-3 mr-1 inline" />}
        {value ? trueLabel : falseLabel}
    </Badge>
)

const InfoRow = ({ label, value, mono = false, children }: { label: string; value?: string | number | null; mono?: boolean; children?: React.ReactNode }) => (
    <div className="flex justify-between items-center text-sm py-1.5 border-b border-border/20 last:border-0">
        <span className="text-muted-foreground shrink-0 mr-3">{label}</span>
        {children ?? (
            <span className={`font-medium text-right break-all ${mono ? "font-mono text-xs" : ""}`}>
                {value ?? <span className="text-muted-foreground/50 italic">—</span>}
            </span>
        )}
    </div>
)

const SectionHeader = ({ icon: Icon, title, color = "bg-primary" }: { icon: any; title: string; color?: string }) => (
    <div className="flex items-center gap-2 mb-3">
        <div className={`h-5 w-1 ${color} rounded-full`} />
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h4 className="font-bold text-base">{title}</h4>
    </div>
)

const parseConnectProResponse = (raw: string | null): any => {
    if (!raw) return null
    try {
        // Strip Python bytes literal prefix b'...'
        const cleaned = raw.replace(/^b'|'$/g, "").replace(/\\"/g, '"')
        return JSON.parse(cleaned)
    } catch {
        return raw
    }
}

const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
        case "accept": return "default"
        case "reject": case "error": return "destructive"
        case "pending": case "init_payment": return "secondary"
        case "timeout": return "outline"
        default: return "secondary"
    }
}

const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
        case "accept": return "Accepté"
        case "reject": return "Rejeté"
        case "pending": return "En attente"
        case "timeout": return "Expiré"
        case "init_payment": return "Étape 1/2"
        case "error": return "Erreur"
        default: return status
    }
}

export function TransactionDetailsDialog({ open, onOpenChange, transaction }: TransactionDetailsDialogProps) {
    if (!transaction) return null

    const connectProParsed = parseConnectProResponse(transaction.connect_pro_response)
    const allStatus: TransactionStatusEntry[] = transaction.all_status ?? []

    const typeLabel = transaction.type_trans === "deposit" ? "Dépôt" : transaction.type_trans === "withdrawal" ? "Retrait" : "Récompense"
    const typeColor = transaction.type_trans === "deposit" ? "text-blue-600" : transaction.type_trans === "withdrawal" ? "text-orange-600" : "text-purple-600"

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col gap-0 p-0 overflow-hidden">
                {/* Sticky header */}
                <div className="px-6 pt-6 pb-4 border-b border-border/50 bg-gradient-to-r from-background to-muted/30 shrink-0">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Détails de la Transaction #{transaction.id}
                        </DialogTitle>
                        <DialogDescription className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{transaction.reference}</span>
                            <CopyButton value={transaction.reference} />
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <ScrollArea className="flex-1 overflow-auto">
                    <div className="px-6 py-5 space-y-6">

                        {/* ── Summary Cards ── */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="p-4 rounded-xl bg-card border shadow-sm space-y-1">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" /> Montant brut
                                </p>
                                <p className="text-xl font-bold text-primary">{transaction.amount.toLocaleString()} <span className="text-sm">FCFA</span></p>
                            </div>
                            <div className="p-4 rounded-xl bg-card border shadow-sm space-y-1">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" /> Net payable
                                </p>
                                <p className="text-xl font-bold text-emerald-600">
                                    {transaction.net_payable_amout != null ? `${transaction.net_payable_amout.toLocaleString()} FCFA` : <span className="text-muted-foreground text-sm italic">—</span>}
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-card border shadow-sm space-y-1">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                    <ArrowRightLeft className="h-3 w-3" /> Type
                                </p>
                                <p className={`text-lg font-bold ${typeColor}`}>{typeLabel}</p>
                                {transaction.source && (
                                    <Badge variant="outline" className="text-xs capitalize">{transaction.source}</Badge>
                                )}
                            </div>
                            <div className="p-4 rounded-xl bg-card border shadow-sm space-y-1">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Statut</p>
                                <div className="flex flex-col gap-1">
                                    <Badge variant={getStatusVariant(transaction.status)} className="w-fit font-semibold">
                                        {getStatusLabel(transaction.status)}
                                    </Badge>
                                    {transaction.old_status && transaction.old_status !== transaction.status && (
                                        <span className="text-xs text-muted-foreground">Avant: <span className="font-medium">{getStatusLabel(transaction.old_status)}</span></span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── Main Grid: Client + Transaction Info ── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Client Info */}
                            <div className="space-y-3">
                                <SectionHeader icon={User} title="Informations Client" color="bg-blue-500" />
                                <div className="bg-muted/20 p-4 rounded-xl border space-y-0.5">
                                    <InfoRow label="Nom complet" value={`${transaction.user.first_name} ${transaction.user.last_name}`} />
                                    <InfoRow label="Email" value={transaction.user.email} />
                                    <InfoRow label="Téléphone" value={transaction.phone_number} mono />
                                    <InfoRow label="ID Pari (App)" value={transaction.user_app_id} mono />
                                    <InfoRow label="Source">
                                        {transaction.source ? <Badge variant="outline" className="capitalize">{transaction.source}</Badge> : <span className="text-muted-foreground/50 italic text-sm">—</span>}
                                    </InfoRow>
                                    <InfoRow label="Crédits utilisés" value={transaction.credit_used ?? 0} />
                                </div>
                            </div>

                            {/* Transaction Info */}
                            <div className="space-y-3">
                                <SectionHeader icon={CreditCard} title="Identifiants Transaction" color="bg-purple-500" />
                                <div className="bg-muted/20 p-4 rounded-xl border space-y-0.5">
                                    <InfoRow label="ID" value={String(transaction.id)} mono />
                                    <InfoRow label="Référence">
                                        <div className="flex items-center gap-1">
                                            <span className="font-mono text-xs break-all">{transaction.reference}</span>
                                            <CopyButton value={transaction.reference} />
                                        </div>
                                    </InfoRow>
                                    <InfoRow label="Public ID">
                                        {transaction.public_id ? (
                                            <div className="flex items-center gap-1">
                                                <span className="font-mono text-xs">{transaction.public_id}</span>
                                                <CopyButton value={transaction.public_id} />
                                            </div>
                                        ) : <span className="text-muted-foreground/50 italic text-sm">—</span>}
                                    </InfoRow>
                                    <InfoRow label="API" value={transaction.api ?? "—"} mono />
                                    <InfoRow label="Code retrait" value={transaction.withdriwal_code} mono />
                                    <InfoRow label="Code USSD" value={transaction.ussd_code} mono />
                                    <InfoRow label="Code OTP" value={transaction.otp_code} mono />
                                    <InfoRow label="Réseau ID" value={transaction.network != null ? String(transaction.network) : null} mono />
                                </div>
                            </div>
                        </div>

                        {/* ── App Configuration ── */}
                        {transaction.app_details && (
                            <div className="space-y-3">
                                <SectionHeader icon={Building2} title="Configuration Application" color="bg-amber-500" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-muted/20 p-4 rounded-xl border space-y-0.5">
                                        <InfoRow label="Plateforme" value={transaction.app_details.name} />
                                        <InfoRow label="Ville" value={transaction.app_details.city} />
                                        <InfoRow label="Rue / Réseau" value={transaction.app_details.street} />
                                        <InfoRow label="Actif (Dépôt)">
                                            <StatusBoolBadge value={transaction.app_details.active_for_deposit} />
                                        </InfoRow>
                                        <InfoRow label="Actif (Retrait)">
                                            <StatusBoolBadge value={transaction.app_details.active_for_with} />
                                        </InfoRow>
                                    </div>
                                    <div className="bg-muted/20 p-4 rounded-xl border space-y-0.5">
                                        <InfoRow label="Dépôt min." value={`${transaction.app_details.minimun_deposit.toLocaleString()} FCFA`} />
                                        <InfoRow label="Dépôt max." value={`${transaction.app_details.max_deposit.toLocaleString()} FCFA`} />
                                        <InfoRow label="Retrait min." value={`${transaction.app_details.minimun_with.toLocaleString()} FCFA`} />
                                        <InfoRow label="Gain max." value={`${transaction.app_details.max_win.toLocaleString()} FCFA`} />
                                        <InfoRow label="Récompense dépôt" value={transaction.deposit_reward_amount != null ? `${transaction.deposit_reward_amount.toLocaleString()} FCFA` : null} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Timeline ── */}
                        <div className="space-y-3">
                            <SectionHeader icon={Clock} title="Suivi Temporel" color="bg-muted-foreground" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {[
                                    { label: "Créé le", value: formatDate(transaction.created_at) },
                                    { label: "Validé le", value: formatDate(transaction.validated_at) ?? "Non validé" },
                                    { label: "Webhook reçu le", value: formatDate(transaction.wehook_receive_at) ?? "Non reçu" },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex flex-col gap-1 bg-muted/20 p-3 rounded-lg border">
                                        <span className="text-muted-foreground text-xs uppercase font-bold">{label}</span>
                                        <span className="text-sm font-medium">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Status Flags ── */}
                        <div className="space-y-3">
                            <SectionHeader icon={Activity} title="Indicateurs de Traitement" color="bg-cyan-500" />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { label: "Paiement démarré", value: transaction.payout_started },
                                    { label: "Paiement terminé", value: transaction.payout_done },
                                    { label: "Fixé par admin", value: transaction.fixed_by_admin },
                                    { label: "Déjà traité", value: transaction.already_process },
                                    { label: "Évènement envoyé", value: transaction.event_send },
                                    { label: "Fonds calculés", value: transaction.fond_calculate },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex flex-col gap-1.5 bg-muted/20 p-3 rounded-lg border">
                                        <span className="text-muted-foreground text-xs font-semibold">{label}</span>
                                        <StatusBoolBadge value={value} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Webhook Delivery ── */}
                        <div className="space-y-3">
                            <SectionHeader icon={Webhook} title="Livraison des Webhooks" color="bg-violet-500" />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { label: "Succès", value: transaction.success_webhook_send },
                                    { label: "Échec", value: transaction.fail_webhook_send },
                                    { label: "En attente", value: transaction.pending_webhook_send },
                                    { label: "Expiré", value: transaction.timeout_webhook_send },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex flex-col gap-1.5 bg-muted/20 p-3 rounded-lg border">
                                        <span className="text-muted-foreground text-xs font-semibold">{label}</span>
                                        <StatusBoolBadge value={value} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Message / Error ── */}
                        {(transaction.message || transaction.error_message) && (
                            <div className="space-y-3">
                                <SectionHeader icon={MessageSquare} title="Messages Système" color="bg-orange-500" />
                                {transaction.message && (
                                    <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-1">
                                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Message</p>
                                        <p className="text-sm">{transaction.message}</p>
                                    </div>
                                )}
                                {transaction.error_message && (
                                    <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl space-y-1">
                                        <p className="text-xs font-bold text-destructive uppercase tracking-wide flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" /> Détails de l'Erreur
                                        </p>
                                        <p className="text-sm">{transaction.error_message}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Status History ── */}
                        {allStatus.length > 0 && (
                            <div className="space-y-3">
                                <SectionHeader icon={History} title="Historique des Statuts" color="bg-teal-500" />
                                <div className="relative pl-4 space-y-0">
                                    <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" />
                                    {allStatus.map((entry, i) => (
                                        <div key={i} className="relative flex items-start gap-4 pb-4 last:pb-0">
                                            <div className={`relative z-10 mt-1 h-3 w-3 rounded-full border-2 shrink-0 ${
                                                entry.status === "accept" ? "bg-emerald-500 border-emerald-600" :
                                                entry.status === "reject" || entry.status === "error" ? "bg-destructive border-destructive" :
                                                entry.status === "pending" ? "bg-yellow-400 border-yellow-500" :
                                                "bg-muted-foreground/40 border-muted-foreground/60"
                                            }`} />
                                            <div className="bg-muted/20 p-3 rounded-lg border flex-1">
                                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={getStatusVariant(entry.status)} className="text-xs font-semibold">
                                                            {getStatusLabel(entry.status)}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs">
                                                            <Globe className="h-2.5 w-2.5 mr-1" />
                                                            {entry.source}
                                                        </Badge>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground font-mono">
                                                        {formatDate(entry.timestamp)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Connect Pro Response ── */}
                        {connectProParsed && (
                            <div className="space-y-3">
                                <SectionHeader icon={Zap} title="Réponse Connect Pro" color="bg-indigo-500" />
                                <div className="bg-muted/20 p-4 rounded-xl border">
                                    {typeof connectProParsed === "object" ? (() => {
                                        const d = connectProParsed?.data
                                        return (
                                            <div className="space-y-3">
                                                {/* Top line */}
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <StatusBoolBadge value={connectProParsed.success === true} trueLabel="Succès" falseLabel="Échec" />
                                                    {connectProParsed.message && (
                                                        <span className="text-sm text-muted-foreground">{connectProParsed.message}</span>
                                                    )}
                                                    {connectProParsed.status_code && (
                                                        <Badge variant="outline" className="font-mono text-xs">HTTP {connectProParsed.status_code}</Badge>
                                                    )}
                                                </div>
                                                {connectProParsed.reference && (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs text-muted-foreground">Référence:</span>
                                                        <span className="font-mono text-xs font-semibold">{connectProParsed.reference}</span>
                                                        <CopyButton value={connectProParsed.reference} />
                                                    </div>
                                                )}
                                                {d && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-border/30">
                                                        {[
                                                            { label: "UID", value: d.uid, mono: true },
                                                            { label: "Type", value: d.type_display ?? d.type },
                                                            { label: "Montant", value: d.formatted_amount ?? d.amount },
                                                            { label: "Téléphone destinataire", value: d.recipient_phone, mono: true },
                                                            { label: "Nom destinataire", value: d.recipient_name },
                                                            { label: "Réseau", value: d.network ? `${d.network.nom} (${d.network.code})` : null },
                                                            { label: "Statut CP", value: d.status_display ?? d.status },
                                                            { label: "Objet", value: d.objet },
                                                            { label: "Priorité", value: d.priority != null ? String(d.priority) : null },
                                                            { label: "Tentatives", value: d.retry_count != null ? `${d.retry_count} / ${d.max_retries}` : null },
                                                            { label: "Erreur CP", value: d.error_message },
                                                        ].filter(x => x.value).map(({ label, value, mono }) => (
                                                            <InfoRow key={label} label={label} value={value} mono={mono} />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })() : (
                                        <pre className="text-xs whitespace-pre-wrap break-all text-muted-foreground">{String(connectProParsed)}</pre>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── Webhook Data ── */}
                        {transaction.webhook_data && (
                            <div className="space-y-3">
                                <SectionHeader icon={Webhook} title="Données Webhook (Paiement)" color="bg-pink-500" />
                                <div className="bg-muted/20 p-4 rounded-xl border">
                                    {(() => {
                                        const data = transaction.webhook_data
                                        const skip = ["fcm_notifications", "all_status"]
                                        if (typeof data === "object" && data !== null) {
                                            return (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5">
                                                    {Object.entries(data).filter(([k]) => !skip.includes(k)).map(([key, val]) => (
                                                        <InfoRow key={key} label={key} value={val === null || val === undefined ? null : typeof val === "object" ? JSON.stringify(val) : String(val)} mono />
                                                    ))}
                                                </div>
                                            )
                                        }
                                        return <pre className="text-xs whitespace-pre-wrap text-muted-foreground">{JSON.stringify(data, null, 2)}</pre>
                                    })()}
                                </div>
                            </div>
                        )}

                        {/* ── MobCash Response ── */}
                        {(transaction as any).mobcash_response && (
                            <div className="space-y-3">
                                <SectionHeader icon={Smartphone} title="Réponse MobCash" color="bg-rose-500" />
                                <div className="bg-muted/20 p-4 rounded-xl border">
                                    <pre className="text-xs whitespace-pre-wrap text-muted-foreground">
                                        {JSON.stringify((transaction as any).mobcash_response, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}

                    </div>
                </ScrollArea>

                <DialogFooter className="border-t px-6 py-4 shrink-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="px-8 shadow-sm">Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
