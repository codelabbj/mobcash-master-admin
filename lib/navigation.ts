import {
    Users,
    Network,
    Phone,
    Award as IdCard,
    Bell,
    Gift,
    ArrowLeftRight,
    Settings,
    LayoutDashboard,
    Wallet,
    Layers,
    Bot,
    Ticket,
    Megaphone,
    CreditCard,
    LucideIcon,
} from "lucide-react"

import { CONFIG } from "./config"

export type NavFeature = keyof typeof CONFIG.FEATURES | null

export interface NavItem {
    href: string
    label: string
    icon: LucideIcon
    feature: NavFeature
}

export const navItems: NavItem[] = [
    { href: "/dashboard", label: "Tableau de Bord", icon: LayoutDashboard, feature: null },
    { href: "/dashboard/users", label: "Utilisateurs", icon: Users, feature: "USERS" },
    { href: "/dashboard/bot-users", label: "Utilisateurs Bot", icon: Users, feature: "BOT_USERS" },
    { href: "/dashboard/networks", label: "Réseaux", icon: Network, feature: "NETWORKS" },
    { href: "/dashboard/telephones", label: "Téléphones", icon: Phone, feature: "TELEPHONES" },
    { href: "/dashboard/user-app-ids", label: "IDs Utilisateur", icon: IdCard, feature: "USER_APP_IDS" },
    { href: "/dashboard/notifications", label: "Notifications", icon: Bell, feature: "NOTIFICATIONS" },
    { href: "/dashboard/bonuses", label: "Bonus", icon: Gift, feature: "BONUSES" },
    { href: "/dashboard/coupons", label: "Coupons", icon: Ticket, feature: "COUPONS" },
    { href: "/dashboard/advertisements", label: "Publicités", icon: Megaphone, feature: "ADVERTISEMENTS" },
    { href: "/dashboard/transactions", label: "Transactions", icon: ArrowLeftRight, feature: "TRANSACTIONS" },
    { href: "/dashboard/recharges", label: "Recharges", icon: CreditCard, feature: "RECHARGES" },
    { href: "/dashboard/bot-transactions", label: "Transactions Bot", icon: Bot, feature: "BOT_TRANSACTIONS" },
    { href: "/dashboard/platforms", label: "Plateformes", icon: Layers, feature: "PLATFORMS" },
    { href: "/dashboard/deposits", label: "Caisses", icon: Wallet, feature: "DEPOSITS" },
    { href: "/dashboard/settings", label: "Paramètres", icon: Settings, feature: "SETTINGS" },
]
