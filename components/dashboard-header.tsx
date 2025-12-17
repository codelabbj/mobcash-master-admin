"use client"

import { useLogout } from "@/hooks/useAuth"
import { getUserData, debugAuthState } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, User, Moon, Sun, Bug, Menu, X } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import Image from "next/image";
import logo from "@/public/logo.png"

interface DashboardHeaderProps {
  onToggleSidebar?: () => void
  sidebarOpen?: boolean
}

export function DashboardHeader({ onToggleSidebar, sidebarOpen }: DashboardHeaderProps = {}) {
  const logout = useLogout()
  const { theme, setTheme } = useTheme()
  const [userData, setUserData] = useState<ReturnType<typeof getUserData>>(null)

  useEffect(() => {
    setUserData(getUserData())
  }, [])

  const initials = userData
    ? `${userData.first_name?.[0] || ""}${userData.last_name?.[0] || ""}`.toUpperCase() || "AD"
    : "AD"

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="flex h-20 items-center justify-between px-8">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="md:hidden rounded-xl hover:bg-muted/80 transition-colors"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          )}

          <div className="flex items-center gap-3">
              <Image src={logo} alt="logo" className="rounded-lg h-15 w-auto"/>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Zefast Admin
              </h1>
              <p className="text-xs text-muted-foreground font-medium">Gérez votre plateforme</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="rounded-xl hover:bg-muted/80 transition-colors"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-11 w-11 rounded-xl hover:bg-muted/80 transition-all hover:scale-105">
                <Avatar className="ring-2 ring-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-xl border-border/50 shadow-xl">
              <DropdownMenuLabel className="p-4">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none">
                    {userData?.first_name} {userData?.last_name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground font-medium">{userData?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-lg cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>
              {/* <DropdownMenuItem onClick={debugAuthState} className="rounded-lg cursor-pointer">
                <Bug className="mr-2 h-4 w-4" />
                Debug Auth
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout.mutate()} className="text-destructive rounded-lg cursor-pointer focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
