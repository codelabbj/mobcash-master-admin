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
import { Input } from "@/components/ui/input"
import { useFinalizeTransaction, type Transaction } from "@/hooks/useTransactions"

const formSchema = z.object({
    reference: z.string().min(1, { message: "La référence est requise" }),
})

interface FinalizeTransactionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    transaction: Transaction | null
}

export function FinalizeTransactionDialog({ open, onOpenChange, transaction }: FinalizeTransactionDialogProps) {
    const { mutate: finalizeTransaction, isPending } = useFinalizeTransaction()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            reference: "",
        },
    })

    // Update form when transaction changes
    useEffect(() => {
        if (transaction) {
            form.setValue("reference", transaction.reference)
        }
    }, [transaction, form])

    function onSubmit(values: z.infer<typeof formSchema>) {
        finalizeTransaction(values, {
            onSuccess: () => {
                onOpenChange(false)
                form.reset()
            },
        })
    }

    const isDeposit = transaction?.type_trans === "deposit"
    const title = isDeposit ? "Finaliser Dépôt" : "Finaliser Retrait"

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Entrez la référence de la transaction pour la finaliser manuellement.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="reference"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Référence Transaction</FormLabel>
                                    <FormControl>
                                        <Input placeholder="ref-123..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Finaliser
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
