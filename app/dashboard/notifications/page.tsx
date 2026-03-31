"use client"

import { useState } from "react"
import { useNotifications } from "@/hooks/useNotifications"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, RotateCw, Bell } from "lucide-react"
import NotificationCard from "@/components/notification-card"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export default function NotificationsPage() {
    const [page, setPage] = useState(1)
    const { data: notificationsData, isLoading, refetch } = useNotifications(page)
    const router = useRouter()

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-6">
                <div className="flex items-center gap-3">
                    <h2
                        className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => refetch()}
                    >
                        Notifications
                    </h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => refetch()}
                        disabled={isLoading}
                    >
                        <RotateCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => router.push("/dashboard/notification_sender")}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow transition-all font-medium"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Envoyer Notification
                    </Button>
                </div>
            </div>

            <div className="min-h-[400px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-muted-foreground animate-pulse font-medium">Chargement des notifications...</p>
                    </div>
                ) : notificationsData && notificationsData.results.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {notificationsData.results.map((notification) => (
                            <NotificationCard
                                key={notification.id}
                                id={notification.id}
                                title={notification.title}
                                content={notification.content}
                                createdAt={notification.created_at}
                                isReaded={true} // Defaulting to true as the API seems to manage notifications sent by admins
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border/60 rounded-xl bg-muted/20">
                        <Bell className="h-12 w-12 text-muted-foreground/40 mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">Aucune notification trouvée</p>
                    </div>
                )}
            </div>

            {notificationsData && (notificationsData.next || notificationsData.previous) && (
                <div className="flex items-center justify-between px-2 pt-6 border-t border-border/40">
                    <div className="text-sm font-medium text-muted-foreground">
                        Page <span className="text-foreground">{page}</span> sur <span className="text-foreground">{Math.ceil((notificationsData.count || 0) / 10)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-card shadow-sm font-medium min-w-24 border-border/60"
                            onClick={() => setPage(page - 1)}
                            disabled={!notificationsData.previous || page <= 1}
                        >
                            Précédent
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-card shadow-sm font-medium min-w-24 border-border/60"
                            onClick={() => setPage(page + 1)}
                            disabled={!notificationsData.next}
                        >
                            Suivant
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
