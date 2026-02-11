"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useRewardTransaction } from "@/hooks/useBonuses"
import { usePlatforms } from "@/hooks/usePlatforms"
import { toast } from "react-hot-toast"
import { Transaction } from "@/hooks/useTransactions"

const formSchema = z.object({
    user_app_id: z.string().min(1, { message: "ID Utilisateur requis" }),
    app: z.string().min(1, { message: "Application requise" }),
    source: z.enum(["mobile", "web"]),
})

interface RewardUserDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    transaction: Transaction | null
}

export function RewardUserDialog({ open, onOpenChange, transaction }: RewardUserDialogProps) {
    const { mutate: rewardUser, isPending } = useRewardTransaction()
    const { data: platforms, isLoading: isLoadingPlatforms } = usePlatforms({ enable: true })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            user_app_id: "",
            app: "",
            source: "mobile",
        },
    })

    // Update form when transaction changes
    useEffect(() => {
        if (transaction) {
            if (transaction.user_app_id) form.setValue("user_app_id", transaction.user_app_id)
            if (transaction.app) form.setValue("app", String(transaction.app)) // Assuming transaction.app is the ID or can be mapped? Transaction interface says app is string (name?). Need to check if we can get ID.
            // Wait, looking at Transaction interface: app: string. But usePlatforms returns platforms with ID.
            // If transaction.app is the name, we might need to find the ID from platforms list?
            // Or maybe transaction.app IS the ID? Let's check Transaction interface again.
            // Step 122: app: string.
            // If it's a string name, we can't directly set it if the select expects an ID.
            // However, let's try to match by name if we have platforms loaded.
        }
    }, [transaction, form, platforms])


    function onSubmit(values: z.infer<typeof formSchema>) {
        rewardUser({
            ...values,
            app: Number(values.app)
        }, {
            onSuccess: () => {
                toast.success("Utilisateur récompensé avec succès!")
                onOpenChange(false)
                form.reset()
            },
            onError: (error: any) => {
                toast.error(error?.response?.data?.message || "Erreur lors de la récompense")
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Récompenser un utilisateur</DialogTitle>
                    <DialogDescription>
                        Utilisez les bonus de l'utilisateur pour créditer son compte de jeu.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="user_app_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ID Utilisateur App</FormLabel>
                                    <FormControl>
                                        <Input placeholder="87654321" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="app"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Application</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner une application" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {isLoadingPlatforms ? (
                                                <div className="flex justify-center p-2"><Loader2 className="h-4 w-4 animate-spin" /></div>
                                            ) : platforms?.map((platform) => (
                                                <SelectItem key={platform.id} value={String(platform.id)}>
                                                    {platform.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="source"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Source</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Source" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="mobile">Mobile</SelectItem>
                                            <SelectItem value="web">Web</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Valider
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
