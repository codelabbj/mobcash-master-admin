"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Plus } from "lucide-react"
import { toast } from "react-hot-toast"
import { useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCreateBonus } from "@/hooks/useBonuses"
import { CreateBonusPayload } from "@/hooks/useBonuses"

const formSchema = z.object({
    email: z.string().email({ message: "Email invalide" }),
    amount: z.coerce.number().min(1, { message: "Le montant doit être supérieur à 0" }),
    reason_bonus: z.string().optional(),
    transaction: z.string().optional(), 
})

export function CreateBonusModal() {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()
    const { mutate: createBonus, isPending } = useCreateBonus()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            amount: 0,
            reason_bonus: "",
            transaction: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        const payload: CreateBonusPayload = {
            email: values.email,
            amount: values.amount,
            reason_bonus: values.reason_bonus,
            transaction: values.transaction && values.transaction !== "" ? Number(values.transaction) : undefined
        }

        createBonus(payload, {
            onSuccess: () => {
                toast.success("Bonus créé avec succès")
                queryClient.invalidateQueries({ queryKey: ["bonuses"] })
                setOpen(false)
                form.reset()
            },
            onError: (error: any) => {
                toast.error(error?.response?.data?.message || "Une erreur est survenue lors de la création du bonus")
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Créer un bonus
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Créer un bonus</DialogTitle>
                    <DialogDescription>
                        Créditez manuellement un bonus à un utilisateur.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email utilisateur</FormLabel>
                                    <FormControl>
                                        <Input placeholder="utilisateur@exemple.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Montant (FCFA)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="1000" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="reason_bonus"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Raison (Optionnel)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Bonus de bienvenue"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="transaction"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ID Transaction (Optionnel)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="45" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Créer
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
