"use client"

import { useState, FC } from "react"
import { ChevronDown, ChevronUp, Bell } from "lucide-react"
import { cn } from "@/lib/utils"

interface NotificationCardProps {
    id: string | number
    title: string
    content: string
    createdAt: string | Date
    isReaded?: boolean
}

const NotificationCard: FC<NotificationCardProps> = ({
    id,
    title,
    content,
    createdAt,
    isReaded = true,
}) => {
    const [isExpanded, setIsExpanded] = useState(false)

    const formatDate = (date: string | Date) => {
        try {
            const d = typeof date === 'string' ? new Date(date) : date
            return new Intl.DateTimeFormat("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }).format(d)
        } catch (error) {
            return "Date invalide"
        }
    }

    return (
        <div
            className={cn(
                "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200 overflow-hidden",
                !isReaded && "border-primary ring-1 ring-primary/20"
            )}
        >
            <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            {!isReaded && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                            <h3 className="font-semibold text-foreground truncate">{title}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatDate(createdAt)}</p>
                    </div>

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="rounded-full p-1.5 transition-colors hover:bg-muted shrink-0"
                        aria-label={isExpanded ? "Réduire" : "Développer"}
                    >
                        {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                    </button>
                </div>

                <div
                    className={cn(
                        "mt-3 text-sm text-muted-foreground transition-all duration-200 ease-in-out",
                        isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                    )}
                >
                    <div className="pt-2 border-t border-border/40 whitespace-pre-wrap">
                        {content}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NotificationCard
