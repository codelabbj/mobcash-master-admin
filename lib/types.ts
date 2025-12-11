export interface Paginated<T>{
    count: number
    next: string | null
    previous: string | null
    results: T[]
}

export interface AppFile {
    id: number;
    file: string;
}