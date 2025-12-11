"use client"

import React, {useEffect} from "react"

import { useState } from "react"
import { useSendNotification } from "@/hooks/useNotifications"
import { useBotUsers } from "@/hooks/useBotUsers"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Loader2, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {useUsers} from "@/hooks/use-profile";

interface SendNotificationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

type NotificationType = "all" | "bot_user" | "normal_user"

export function SendNotificationDialog({ open, onOpenChange }: SendNotificationDialogProps) {

    const [usersSearchTerm, setUsersSearchTerm] = useState("")
    const [botUsersSearchTerm, setBotUsersSearchTerm] = useState("")
    const [debouncedUsersSearchTerm, setDebouncedUsersSearchTerm] = useState("")
    const [debouncedBotUsersSearchTerm, setDebouncedBotUsersSearchTerm] = useState("")
    const [notificationType, setNotificationType] = useState<NotificationType>("all")
    const sendNotification = useSendNotification()
    const { data: botUsers, isLoading: isLoadingBotUsers } = useBotUsers({search: debouncedBotUsersSearchTerm})
    const {data:users , isLoading: isLoadingUser} = useUsers(debouncedUsersSearchTerm)

    // Debounce bot users search (300ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedBotUsersSearchTerm(botUsersSearchTerm)
        }, 300)

        return () => clearTimeout(timer)
    }, [botUsersSearchTerm])

    // Debounce normal users search (300ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedUsersSearchTerm(usersSearchTerm)
        }, 300)

        return () => clearTimeout(timer)
    }, [usersSearchTerm])

    const [formData, setFormData] = useState<{
        title: string,
        content: string,
        user_id: string|null|number,
    }>({
        title: "",
        content: "",
        user_id: null,
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        let payloadData = { ...formData }

        if (notificationType === "all") {
            payloadData = { title: formData.title, content: formData.content, user_id: null }
        }

        sendNotification.mutate(payloadData, {
            onSuccess: () => {
                onOpenChange(false)
                setFormData({ title: "", content: "", user_id: null })
                setNotificationType("all")
            },
        })

    useEffect(() => {
        console.log("Available normal users",users)
    }, [users,debouncedUsersSearchTerm]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Envoyer une Notification</DialogTitle>
                    <DialogDescription>Envoyer une notification à un utilisateur spécifique</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="notification_type">Type de Notification *</Label>
                        <Select
                            value={notificationType}
                            onValueChange={(value) => {
                                setNotificationType(value as NotificationType)
                                setFormData({ ...formData, user_id: null })
                            }}
                            disabled={sendNotification.isPending}
                        >
                            <SelectTrigger id="notification_type">
                                <SelectValue placeholder="Sélectionner un type..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les utilisateurs</SelectItem>
                                <SelectItem value="bot_user">Utilisateur Bot</SelectItem>
                                <SelectItem value="normal_user">Utilisateur Normal</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {notificationType === "bot_user" && (
                        <div className="space-y-2">
                            <Label>Sélectionner un Utilisateur Bot *</Label>
                            <BotUserCombobox
                                selected={formData.user_id as number | null}
                                onSelect={(userId) => setFormData({ ...formData, user_id: userId })}
                                searchTerm={botUsersSearchTerm}
                                onSearchChange={setBotUsersSearchTerm}
                                isLoading={isLoadingBotUsers}
                                users={botUsers}
                                disabled={sendNotification.isPending}
                            />
                        </div>
                    )}

                    {notificationType === "normal_user" && (
                        <div className="space-y-2">
                            <Label>Sélectionner un Utilisateur Normal *</Label>
                            <NormalUserCombobox
                                selected={formData.user_id as string | null}
                                onSelect={(userId) => setFormData({ ...formData, user_id: userId })}
                                searchTerm={usersSearchTerm}
                                onSearchChange={setUsersSearchTerm}
                                users={users?.results}
                                isLoading={isLoadingUser}
                                disabled={sendNotification.isPending}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="title">Titre *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Titre de la notification"
                            required
                            disabled={sendNotification.isPending}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Contenu *</Label>
                        <Textarea
                            id="content"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Contenu de la notification..."
                            rows={4}
                            required
                            disabled={sendNotification.isPending}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={sendNotification.isPending}
                            className="hover:bg-primary/10"
                        >
                            Annuler
                        </Button>
                        <Button type="submit" disabled={sendNotification.isPending}>
                            {sendNotification.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Envoi...
                                </>
                            ) : (
                                "Envoyer la Notification"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

interface BotUser {
    id: number
    telegram_user_id: string
    first_name: string
    last_name: string
    email?: string
}

interface BotUserComboboxProps {
    selected: number | null
    onSelect: (userId: number) => void
    searchTerm: string
    onSearchChange: (term: string) => void
    isLoading: boolean
    users: BotUser[] | undefined
    disabled: boolean
}

function BotUserCombobox({
                             selected,
                             onSelect,
                             searchTerm,
                             onSearchChange,
                             isLoading,
                             users,
                             disabled,
                         }: BotUserComboboxProps) {
    const [open, setOpen] = useState(false)

    const selectedUser = users?.find((user) => user.id === selected)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    disabled={disabled || isLoading}
                >
                    {selectedUser
                        ? `${selectedUser.first_name} ${selectedUser.last_name}`
                        : "Sélectionner un utilisateur..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Rechercher un utilisateur..."
                        value={searchTerm}
                        onValueChange={onSearchChange}
                    />
                    {isLoading ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <CommandList>
                            {!users || users.length === 0 ? (
                                <CommandEmpty>Aucun utilisateur trouvé.</CommandEmpty>
                            ) : (
                                <CommandGroup>
                                    {users.map((user) => (
                                        <CommandItem
                                            key={user.id}
                                            value={String(user.id)}
                                            onSelect={() => {
                                                onSelect(user.id)
                                                setOpen(false)
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selected === user.id ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div className="flex flex-col">
                        <span className="font-medium">
                          {user.first_name} {user.last_name}
                        </span>
                                                <span className="text-xs text-muted-foreground">
                          {user.email || "Aucun email"}
                        </span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                        </CommandList>
                    )}
                </Command>
            </PopoverContent>
        </Popover>
    )
}

interface UserProfile {
    id: string
    username: string
    email: string
    first_name: string
    last_name: string
}

interface NormalUserComboboxProps {
    selected: string | null
    onSelect: (userId: string) => void
    searchTerm: string
    onSearchChange: (term: string) => void
    users: UserProfile[] | undefined
    isLoading: boolean
    disabled: boolean
}

function NormalUserCombobox({
                                selected,
                                onSelect,
                                searchTerm,
                                onSearchChange,
                                users,
                                isLoading,
                                disabled,
                            }: NormalUserComboboxProps) {
    const [open, setOpen] = useState(false)

    const selectedUser = users?.find((user) => user.id === selected)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    disabled={disabled || isLoading}
                >
                    {selected && selectedUser ? selectedUser.username : "Sélectionner un utilisateur..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Rechercher un utilisateur..."
                        value={searchTerm}
                        onValueChange={onSearchChange}
                    />
                    {isLoading ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <CommandList>
                            {!users || users.length === 0 ? (
                                <CommandEmpty>Aucun utilisateur trouvé.</CommandEmpty>
                            ) : (
                                <CommandGroup>
                                    {users.map((user) => (
                                        <CommandItem
                                            key={user.id}
                                            value={user.id}
                                            onSelect={() => {
                                                onSelect(user.id)
                                                setOpen(false)
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selected === user.id ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div className="flex flex-col">
                                                <span className="font-medium">{user.username}</span>
                                                <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                        </CommandList>
                    )}
                </Command>
            </PopoverContent>
        </Popover>
    )
}
