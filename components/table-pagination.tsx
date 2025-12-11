import {Button} from "@/components/ui/button";

interface TablePaginationProps {
    page: number
    pageSize: number
    total: number
    disableNextPage: boolean
    disablePreviousPage: boolean
    onChangePage: (page: number) => void
}

export default function TablePagination({page, pageSize,total ,disableNextPage, disablePreviousPage,onChangePage}: TablePaginationProps) {
    return (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/50">
            <div className="text-sm text-muted-foreground">
                Page {page} sur {Math.ceil(total / pageSize)}
            </div>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {onChangePage(page - 1)}}
                    disabled={disablePreviousPage}
                >
                    Précédent
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onChangePage(page + 1)}
                    disabled={disableNextPage}
                >
                    Suivant
                </Button>
            </div>
        </div>
    )
}