"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { Loader2 } from "lucide-react"
import { navItems } from "@/lib/navigation"
import { CONFIG } from "@/lib/config"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      return
    }

    // Client-side authentication and access control check
    const checkAuthAndAccess = () => {
      try {
        const authenticated = isAuthenticated()
        if (!authenticated) {
          router.push("/login")
          return
        }

        // Feature flag access control
        const currentItem = navItems.find(item => item.href === pathname)
        if (currentItem?.feature && !CONFIG.FEATURES[currentItem.feature]) {
          console.warn(`Access denied to disabled feature: ${currentItem.feature}`)
          router.push("/dashboard")
          return
        }

        setIsChecking(false)
      } catch (error) {
        console.error("Auth check error:", error)
        // On error, redirect to login as fallback
        router.push("/login")
      }
    }

    // Small delay to ensure localStorage is ready
    const timer = setTimeout(checkAuthAndAccess, 100)

    // Fallback timeout - if still checking after 2 seconds, proceed anyway
    const fallbackTimer = setTimeout(() => {
      setIsChecking(false)
    }, 2000)

    return () => {
      clearTimeout(timer)
      clearTimeout(fallbackTimer)
    }
  }, [router, pathname])

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      <DashboardHeader
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-72 flex-col border-r border-border/40 bg-card/30 backdrop-blur-sm
          transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:flex
          h-[calc(100vh-5rem)] md:h-[calc(100vh-5rem)] overflow-y-auto
        `}>
          <div className="p-6">
            <DashboardNav onNavigate={() => setSidebarOpen(false)} />
          </div>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto h-[calc(100vh-5rem)]">{children}</main>
      </div>
      <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm py-4 px-8">
        <div className="text-center text-sm text-muted-foreground">
          Développé par{" "}
          <a
            href="https://codelab.bj"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:text-primary/80 transition-colors"
          >
            CodeLab
          </a>
        </div>
      </footer>
    </div>
  )
}
