"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface Props {
    totalTransactions: number
    totalDeposits: number
    totalWithdrawals: number
}

export function BotTransactionsChart({ totalTransactions, totalDeposits, totalWithdrawals }: Props) {
    const data = [
        {
            name: "Dépôts",
            value: totalDeposits,
        },
        {
            name: "Retraits",
            value: totalWithdrawals,
        }
    ]

    const colors = ["#F59E0B", "#7C3AED"]

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            const percentage = totalTransactions > 0 ? ((data.value / totalTransactions) * 100).toFixed(1) : 0
            return (
                <div className="bg-card border border-border rounded-lg p-2 shadow-md">
                    <p className="text-sm font-semibold text-foreground">{data.name}</p>
                    <p className="text-sm text-muted-foreground">{data.value.toLocaleString()} FCFA</p>
                    <p className="text-xs text-primary font-bold">{percentage}%</p>
                </div>
            )
        }
        return null
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-full gap-4">
            <div className="relative w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={85}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} cursor={false} />
                        <Legend
                            verticalAlign="bottom"
                            height={20}
                            wrapperStyle={{ paddingTop: "8px" }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="text-center w-full">
                <p className="text-xs text-muted-foreground mb-1">Total Transactions Bot</p>
                <p className="text-2xl font-bold text-primary">
                    {totalTransactions.toLocaleString()}
                </p>
            </div>
        </div>
    )
}