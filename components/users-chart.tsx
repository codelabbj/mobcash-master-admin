"use client"

import {Area, AreaChart, CartesianGrid, XAxis} from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent, ChartConfig,
} from "@/components/ui/chart"


interface Props {
    data: Array<{
        date: string
        count: number
    }>
}

const chartConfig = {
    count: {
        label: "Utilisateurs",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

export function UsersChart({data}: Props) {

    return (
        <ChartContainer
            config={chartConfig}
            className="h-[400px] w-full"
        >
            <AreaChart
                accessibilityLayer
                data={data}
                margin={{
                    left: 12,
                    right: 12,
                }}
            >
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                />
                <ChartTooltip
                    content={<ChartTooltipContent indicator="line" />}
                    cursor={{ fill: "hsl(var(--muted))" }}
                />
                <Area
                    dataKey="count"
                    type="natural"
                    fill="var(--color-chart-3))"
                    fillOpacity={0.4}
                    stroke="var(--color-chart-1)"
                />
            </AreaChart>
        </ChartContainer>
    )
}
