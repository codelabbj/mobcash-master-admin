"use client"

import { useState, useEffect } from "react"
import { useSendNotification } from "@/hooks/useNotifications"
import { useBotUsers } from "@/hooks/useBotUsers"
import { useUsers } from "@/hooks/use-profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
    Loader2, 
    Send, 
    Users, 
    User, 
    Bot, 
    Search,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ArrowLeft
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

type RecipientType = "regular" | "bot"
type BroadcastMode = "all" | "specific"

export default function NotificationSenderPage() {
    const router = useRouter()
    const [recipientType, setRecipientType] = useState<RecipientType>("regular")
    const [broadcastMode, setBroadcastMode] = useState<BroadcastMode>("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [selectedUserId, setSelectedUserId] = useState<string | number | null>(null)
    
    const [formData, setFormData] = useState({
        title: "",
        content: ""
    })

    const sendNotification = useSendNotification()
    
    // Search debouncing
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400)
        return () => clearTimeout(timer)
    }, [searchTerm])

    const { data: usersData, isLoading: isLoadingUsers } = useUsers(recipientType === "regular" ? debouncedSearch : "")
    const { data: botUsersData, isLoading: isLoadingBotUsers } = useBotUsers({ search: recipientType === "bot" ? debouncedSearch : "" })

    const users = (recipientType === "regular" ? usersData?.results : botUsersData) || []
    const isLoading = recipientType === "regular" ? isLoadingUsers : isLoadingBotUsers

    const handleSend = () => {
        if (!formData.title || !formData.content) return

        const payload = {
            title: formData.title,
            content: formData.content,
            user_id: broadcastMode === "all" ? null : selectedUserId
        }

        sendNotification.mutate(payload, {
            onSuccess: () => {
                setFormData({ title: "", content: "" })
                setSelectedUserId(null)
                setBroadcastMode("all")
            }
        })
    }

    const canSend = formData.title && formData.content && (broadcastMode === "all" || selectedUserId)

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 -ml-2 text-muted-foreground hover:text-primary"
                            onClick={() => router.push("/dashboard/notifications")}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Communication</span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Envoyer Notification
                    </h2>
                    <p className="text-muted-foreground">Créez et diffusez des messages ciblés à vos utilisateurs.</p>
                </div>
            </div>

            <Card className="border-border/40 shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/40 pb-0">
                    <div className="flex gap-4">
                        <button
                            className={cn(
                                "px-6 py-4 text-sm font-semibold transition-all border-b-2",
                                recipientType === "regular" 
                                    ? "border-primary text-primary" 
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                            onClick={() => {
                                setRecipientType("regular")
                                setSelectedUserId(null)
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Utilisateurs réguliers
                            </div>
                        </button>
                        <button
                            className={cn(
                                "px-6 py-4 text-sm font-semibold transition-all border-b-2",
                                recipientType === "bot" 
                                    ? "border-primary text-primary" 
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                            onClick={() => {
                                setRecipientType("bot")
                                setSelectedUserId(null)
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <Bot className="h-4 w-4" />
                                Utilisateurs du bot
                            </div>
                        </button>
                    </div>
                </CardHeader>

                <CardContent className="p-8 space-y-8">
                    {/* Message Details SECTION */}
                    <div className="space-y-6">
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="title" className="text-sm font-bold uppercase tracking-tight">Titre du Message</Label>
                                <Input
                                    id="title"
                                    placeholder="Ex: Mise à jour système importante..."
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="bg-background/80 h-12 text-base focus-visible:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="content" className="text-sm font-bold uppercase tracking-tight">Contenu</Label>
                                <Textarea
                                    id="content"
                                    placeholder="Écrivez votre message ici..."
                                    rows={5}
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="bg-background/80 text-base focus-visible:ring-primary/20 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-border/40" />

                    {/* RECIPIENTS SECTION */}
                    <div className="space-y-6">
                        <div className="flex flex-col gap-4">
                            <Label className="text-sm font-bold uppercase tracking-tight">Ciblage des Destinataires</Label>
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    type="button"
                                    variant={broadcastMode === "all" ? "default" : "outline"}
                                    onClick={() => {
                                        setBroadcastMode("all")
                                        setSelectedUserId(null)
                                    }}
                                    className={cn(
                                        "h-11 px-6 rounded-full font-medium transition-all",
                                        broadcastMode === "all" && "shadow-lg shadow-primary/20 scale-105"
                                    )}
                                >
                                    <Users className="mr-2 h-4 w-4" />
                                    Tous les utilisateurs
                                </Button>
                                <Button
                                    type="button"
                                    variant={broadcastMode === "specific" ? "default" : "outline"}
                                    onClick={() => setBroadcastMode("specific")}
                                    className={cn(
                                        "h-11 px-6 rounded-full font-medium transition-all",
                                        broadcastMode === "specific" && "shadow-lg shadow-primary/20 scale-105"
                                    )}
                                >
                                    <User className="mr-2 h-4 w-4" />
                                    Utilisateur spécifique
                                </Button>
                            </div>
                        </div>

                        {broadcastMode === "specific" && (
                            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={`Rechercher un ${recipientType === 'bot' ? 'utilisateur bot' : 'utilisateur'}...`}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 h-11 bg-background/50 border-border/60"
                                    />
                                    {isLoading && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        </div>
                                    )}
                                </div>

                                <div className="border border-border/60 rounded-xl overflow-hidden bg-background/30 max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {users.length > 0 ? (
                                        <div className="divide-y divide-border/40">
                                            {users.map((user: any) => {
                                                const id = recipientType === "regular" ? user.id : user.telegram_user_id
                                                const name = recipientType === "regular" 
                                                    ? `${user.first_name} ${user.last_name} (${user.username})`
                                                    : `${user.first_name} ${user.last_name}`
                                                const email = user.email || (recipientType === 'bot' ? `ID: ${user.telegram_user_id}` : 'Pas d\'email')
                                                
                                                return (
                                                    <div
                                                        key={id}
                                                        className={cn(
                                                            "flex items-center justify-between p-4 cursor-pointer transition-all hover:bg-primary/5",
                                                            selectedUserId === id && "bg-primary/10 border-l-4 border-l-primary"
                                                        )}
                                                        onClick={() => setSelectedUserId(id)}
                                                    >
                                                        <div className="space-y-0.5">
                                                            <div className="font-semibold text-sm flex items-center gap-2 text-foreground">
                                                                {name}
                                                                {selectedUserId === id && <CheckCircle2 className="h-3 w-3 text-primary" />}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground font-medium">
                                                                {email}
                                                            </div>
                                                        </div>
                                                        <div className={cn(
                                                            "w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center",
                                                            selectedUserId === id ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
                                                        )}>
                                                            {selectedUserId === id && <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-muted-foreground font-medium italic">
                                            {searchTerm ? "Aucun utilisateur ne correspond à votre recherche" : "Entrez un nom pour commencer la recherche"}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:justify-end border-t border-border/40">
                        <Button
                            variant="ghost"
                            size="lg"
                            className="font-semibold h-12 px-8 text-muted-foreground hover:text-foreground"
                            onClick={() => router.push("/dashboard/notifications")}
                            disabled={sendNotification.isPending}
                        >
                            Annuler
                        </Button>
                        <Button
                            size="lg"
                            className="h-12 px-10 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
                            disabled={!canSend || sendNotification.isPending}
                            onClick={handleSend}
                        >
                            {sendNotification.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Envoi en cours...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-5 w-5" />
                                    Diffuser le Message
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
