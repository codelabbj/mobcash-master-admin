"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {useEffect, useState} from "react";


interface Props {
    data: Array<{
        date: string
        type_trans: string
        total_amount: number
        count: number
    }>
}

export function TransactionsChart({data}: Props) {
    const [processedData, setProcessedData] = useState<{
        date: string;
        deposit: number;
        withdrawal: number
    }[]>([])

    useEffect(() => {
        if (!data) return;
        setProcessedData(data.reduce((acc, item) => {
            let entry = acc.find(e => e.date === item.date)
            if (!entry) {
                entry = { date: item.date, deposit: 0, withdrawal: 0 }
                acc.push(entry)
            }
            if (item.type_trans === "deposit") {
                entry.deposit += item.total_amount
            } else if (item.type_trans === "withdrawal") {
                entry.withdrawal += item.total_amount
            }
            return acc
        }, [] as { date: string; deposit: number; withdrawal: number }[]))
    }, [data]);

  return (
      <ChartContainer
          config={{
              deposit: {
                  label: "Dépôts",
                  color: "hsl(var(--chart-1))",
              },
              withdrawal: {
                  label: "Retraits",
                  color: "hsl(var(--chart-2))",
              },
          }}
          className="h-[400px] w-full"
      >
          <BarChart data={processedData}>
              <CartesianGrid vertical={false} />
              <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
              />
              <YAxis
                  tickFormatter={(value) => `${value.toLocaleString()} FCFA`}
              />
              <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={{ fill: "hsl(var(--muted))" }}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                  dataKey="deposit"
                  fill="var(--color-chart-1)"
                  radius={[4, 4, 0, 0]}
              />
              <Bar
                  dataKey="withdrawal"
                  fill="var(--color-chart-2)"
                  radius={[4, 4, 0, 0]}
              />
          </BarChart>
      </ChartContainer>
  )
}
