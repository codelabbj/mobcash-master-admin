import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import api from "@/lib/axios";
import {Paginated} from "@/lib/types";

export interface UserProfile{
    id: string
    username: string
    email: string
    first_name: string
    last_name: string
    phone: string
    is_superuser: boolean
    is_staff: boolean
}

export function useProfile(){
    return useQuery({
        queryKey: ["profile"],
        queryFn: async ()=>{
            const res = await api.get<UserProfile>("/auth/me")
            return res.data
        }
    })
}

export function useUpdateProfile(){
    const query = useQueryClient()

    return useMutation({
        mutationFn: async (data : UserProfile)=>{
            const res = await api.patch<UserProfile>("/auth/edit",data)
            return res.data
        }
    })
}

export function useChangePassword(){
    const query = useQueryClient()

    return useMutation({
        mutationFn: async (data:{new_password:string,confirm_new_password:string,old_password:string})=>{
            const res = await api.post('/auth/change_password',data)
            return res.data
        }
    })
}

export function useUsers(search:string){
    return useQuery({
        queryKey: ["user_list",search],
        queryFn: async ()=>{
            const res = await api.get<Paginated<UserProfile>>("/auth/users",{params:{search:search}})
            return res.data
        }
    })
}