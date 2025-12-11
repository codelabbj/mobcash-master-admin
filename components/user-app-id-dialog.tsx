"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useCreateUserAppId, useUpdateUserAppId, type UserAppId, type UserAppIdInput } from "@/hooks/useUserAppIds"
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
import { Loader2 } from "lucide-react"
import {usePlatforms} from "@/hooks/usePlatforms";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

interface UserAppIdDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    userAppId?: UserAppId
}

export function UserAppIdDialog({ open, onOpenChange, userAppId }: UserAppIdDialogProps) {
    const createUserAppId = useCreateUserAppId()
    const updateUserAppId = useUpdateUserAppId()
    const {data:platforms} = usePlatforms({})

    const [formData, setFormData] = useState<UserAppIdInput>({
        user_app_id: "",
        app_name: "",
    })

    useEffect(() => {
        if (userAppId) {
            setFormData({
                user_app_id: userAppId.user_app_id,
                app_name: userAppId.app_name,
            })
        } else {
            setFormData({
                user_app_id: "",
                app_name: "",
            })
        }
    }, [userAppId])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (userAppId) {
            updateUserAppId.mutate(
                { id: userAppId.id, data: formData },
                {
                    onSuccess: () => onOpenChange(false),
                },
            )
        } else {
            createUserAppId.mutate(formData, {
                onSuccess: () => {
                    onOpenChange(false)
                    setFormData({ user_app_id: "", app_name: "" })
                },
            })
        }
    }

    const isPending = createUserAppId.isPending || updateUserAppId.isPending

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{userAppId ? "Modifier l'ID d'application utilisateur" : "Ajouter un ID d'application utilisateur"}</DialogTitle>
                    <DialogDescription>
                        {userAppId ? "Mettez à jour les détails de l'ID d'application utilisateur ci-dessous." : "Ajoutez un nouvel ID d'application utilisateur au système."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="user_app_id">ID d'application utilisateur *</Label>
                        <Input
                            id="user_app_id"
                            value={formData.user_app_id}
                            onChange={(e) => setFormData({ ...formData, user_app_id: e.target.value })}
                            placeholder="ABC123456789"
                            required
                            disabled={isPending}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="app_name">Plateforme*</Label>
                        <Select
                            value={formData.app_name}
                            onValueChange={(value) => setFormData({ ...formData, app_name: value })}
                            disabled={isPending}
                        >
                            <SelectTrigger id="app_name">
                                <SelectValue placeholder="Sélectionner une plateforme" />
                            </SelectTrigger>
                            <SelectContent>
                                {platforms?.map((platform) => (
                                    <SelectItem key={platform.id} value={platform.id}>
                                        {platform.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {userAppId ? "Mise à jour..." : "Création..."}
                                </>
                            ) : userAppId ? (
                                "Mettre à jour"
                            ) : (
                                "Créer"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
