"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Network, ArrowLeftRight, Wallet, TrendingUp, UserCheck, UserX, Bot, Gift, CreditCard, DollarSign, Receipt, Share2, Award, Megaphone, BarChart3, Smartphone, Globe } from "lucide-react"
import { useStatistics } from "@/hooks/useStatistics"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CONFIG } from "@/lib/config"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

function formatNumber(num: number): string {
  return new Intl.NumberFormat("fr-FR").format(num)
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
  } catch {
    return dateString
  }
}

export default function DashboardPage() {
  const { data: statistics, isLoading } = useStatistics()

  const stats = [
    {
      title: "Solde Net",
      value: statistics?.volume_transactions.net_volume ? `${formatNumber(statistics.volume_transactions.net_volume)} FCFA` : "-",
      description: "Solde net des transactions",
      icon: TrendingUp,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-600/10",
    },
    {
      title: "Total Utilisateurs",
      value: statistics?.dashboard_stats.total_users ?? "-",
      description: "Utilisateurs enregistrés",
      icon: Users,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      title: "Utilisateurs Actifs",
      value: statistics?.dashboard_stats.active_users ?? "-",
      description: "Utilisateurs actifs",
      icon: UserCheck,
      iconColor: "text-green-600",
      iconBg: "bg-green-600/10",
    },
    {
      title: "Total Transactions",
      value: statistics?.dashboard_stats.total_transactions ?? "-",
      description: "Toutes les transactions",
      icon: ArrowLeftRight,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      title: "Total Bonus",
      value: statistics?.dashboard_stats.total_bonus ? `${formatNumber(statistics.dashboard_stats.total_bonus)} FCFA` : "-",
      description: "Bonus distribués",
      icon: Gift,
      iconColor: "text-yellow-600",
      iconBg: "bg-yellow-600/10",
    },
    {
      title: "Utilisateurs Bot",
      value: statistics?.dashboard_stats.bot_stats.total_users ?? "-",
      description: "Utilisateurs du bot",
      icon: Bot,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-600/10",
    },
    {
      title: "Publicités Actives",
      value: statistics?.dashboard_stats.advertisements.active ?? "-",
      description: `${statistics?.dashboard_stats.advertisements.total ? "sur " + statistics.dashboard_stats.advertisements.total + " total" : ""}`,
      icon: Megaphone,
      iconColor: "text-cyan-600",
      iconBg: "bg-cyan-600/10",
    },
    {
      title: "Parrainages",
      value: statistics?.referral_system.parrainages_count ?? "-",
      description: `${statistics?.referral_system.total_referral_bonus ? formatNumber(statistics.referral_system.total_referral_bonus) + " FCFA bonus" : ""}`,
      icon: Share2,
      iconColor: "text-teal-600",
      iconBg: "bg-teal-600/10",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Tableau de Bord
        </h2>
        <p className="text-muted-foreground text-lg">Bienvenue sur le tableau de bord administrateur {CONFIG.APP_NAME}</p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="border border-border/50 bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-10 rounded-lg" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-3" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Card
                  key={stat.title}
                  className="group relative border border-border/50 bg-card hover:border-primary/30 transition-all duration-200 hover:shadow-md"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-sm font-semibold text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2.5 rounded-lg ${stat.iconBg} ${stat.iconColor} transition-colors`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl font-bold text-foreground">
                        {stat.value}
                      </div>
                      <TrendingUp className="h-4 w-4 text-muted-foreground/60" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-3 font-medium">{stat.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Transactions by App */}
          {statistics?.dashboard_stats.transactions_by_app && Object.keys(statistics.dashboard_stats.transactions_by_app).length > 0 && (
            <Card className="border border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Transactions par Application
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Application</TableHead>
                        <TableHead className="text-right">Dépôts (Nbr)</TableHead>
                        <TableHead className="text-right">Dépôts (Total)</TableHead>
                        <TableHead className="text-right">Retraits (Nbr)</TableHead>
                        <TableHead className="text-right">Retraits (Total)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(statistics.dashboard_stats.transactions_by_app).map(([app, data]) => (
                        <TableRow key={app}>
                          <TableCell className="font-medium">{app}</TableCell>
                          <TableCell className="text-right">{data.deposit.count}</TableCell>
                          <TableCell className="text-right text-emerald-600 font-medium whitespace-nowrap">
                            {formatNumber(data.deposit.total_amount)} FCFA
                          </TableCell>
                          <TableCell className="text-right">{data.withdrawal.count}</TableCell>
                          <TableCell className="text-right text-orange-600 font-medium whitespace-nowrap">
                            {formatNumber(data.withdrawal.total_amount)} FCFA
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transaction Evolution Charts */}
          {statistics?.volume_transactions.evolution.daily && statistics.volume_transactions.evolution.daily.length > 0 && (
            <div className="grid gap-6">
              <Card className="border border-border/50 bg-card overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Évolution des Transactions (Quotidien)
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[400px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={Object.values(
                        statistics.volume_transactions.evolution.daily.reduce((acc: any, curr) => {
                          if (!acc[curr.date]) {
                            acc[curr.date] = { date: curr.date, deposit: 0, withdrawal: 0 }
                          }
                          acc[curr.date][curr.type_trans] = curr.total_amount
                          return acc
                        }, {})
                      ).slice(-15)}
                      margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
                        }}
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={30}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${formatNumber(value)}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        itemStyle={{ fontSize: '12px' }}
                        labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: 'hsl(var(--foreground))' }}
                        labelFormatter={(value) => formatDate(value)}
                        formatter={(value: number) => [`${formatNumber(value)} FCFA`]}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Line
                        type="monotone"
                        dataKey="deposit"
                        name="Dépôts"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#10b981", strokeWidth: 2 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="withdrawal"
                        name="Retraits"
                        stroke="#f97316"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#f97316", strokeWidth: 2 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* User Growth and Source */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Users by Source */}
            {statistics?.user_growth.users_by_source && statistics.user_growth.users_by_source.length > 0 && (
              <Card className="border border-border/50 bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Utilisateurs par Source
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {statistics.user_growth.users_by_source.map((source) => (
                      <div key={source.source} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {source.source === "mobile" && <Smartphone className="h-4 w-4 text-muted-foreground" />}
                          {source.source === "web" && <Globe className="h-4 w-4 text-muted-foreground" />}
                          {source.source === "bot" && <Bot className="h-4 w-4 text-muted-foreground" />}
                          <span className="font-medium capitalize">{source.source}</span>
                        </div>
                        <span className="text-lg font-bold">{source.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* User Status Breakdown */}
            {statistics?.user_growth.status && (
              <Card className="border border-border/50 bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Statut des Utilisateurs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-green-600">Actifs</span>
                      <span className="text-lg font-bold">{statistics.user_growth.status.active}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-600">Inactifs</span>
                      <span className="text-lg font-bold">{statistics.user_growth.status.inactive}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-red-600">Bloqués</span>
                      <span className="text-lg font-bold">{statistics.user_growth.status.blocked}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>


          {/* User Growth - Recent Daily */}
          {statistics?.user_growth.new_users.daily && statistics.user_growth.new_users.daily.length > 0 && (
            <Card className="border border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Nouveaux Utilisateurs (Quotidien)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Nouveaux Utilisateurs</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {statistics.user_growth.new_users.daily.slice(-10).map((item, index) => (
                        <TableRow key={`${item.date}-${index}`}>
                          <TableCell>{formatDate(item.date)}</TableCell>
                          <TableCell className="text-right font-bold">{item.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
