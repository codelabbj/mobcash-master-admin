import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import ErrorBoundary from "@/components/ErrorBoundary"
import { Providers } from "@/components/providers"
import { CONFIG } from "@/lib/config"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: CONFIG.APP_TITLE,
  description: CONFIG.APP_DESCRIPTION,
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
          html:root {
            --primary: ${CONFIG.PRIMARY_COLOR};
            --accent: ${CONFIG.ACCENT_COLOR};
            --ring: ${CONFIG.PRIMARY_COLOR};
            --sidebar-primary: ${CONFIG.PRIMARY_COLOR};
            --sidebar-accent: ${CONFIG.ACCENT_COLOR};
            --sidebar-ring: ${CONFIG.PRIMARY_COLOR};
            --stat-card-rust: ${CONFIG.STAT_CARD_RUST};
            --stat-card-orange: ${CONFIG.STAT_CARD_ORANGE};
            --stat-card-dark: ${CONFIG.STAT_CARD_DARK};
            --stat-card-amber: ${CONFIG.STAT_CARD_AMBER};
            --stat-card-emerald: ${CONFIG.STAT_CARD_EMERALD};
            --stat-card-purple: ${CONFIG.STAT_CARD_PURPLE};
            --stat-card-rose: ${CONFIG.STAT_CARD_ROSE};
            --stat-card-cyan: ${CONFIG.STAT_CARD_CYAN};
            --chart-1: ${CONFIG.CHART_1};
            --chart-2: ${CONFIG.CHART_2};
            --chart-3: ${CONFIG.CHART_3};
            --chart-4: ${CONFIG.CHART_4};
            --chart-5: ${CONFIG.CHART_5};
          }
          .dark {
            --primary: ${CONFIG.PRIMARY_COLOR};
            --accent: ${CONFIG.ACCENT_COLOR};
            --ring: ${CONFIG.PRIMARY_COLOR};
            --sidebar-primary: ${CONFIG.PRIMARY_COLOR};
            --sidebar-accent: ${CONFIG.ACCENT_COLOR};
            --sidebar-ring: ${CONFIG.PRIMARY_COLOR};
          }
        `}} />
      </head>
      <body className={`font-sans antialiased`}>
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
