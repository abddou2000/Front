// Dans : src/app/components/UserActivityChart.tsx
"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// ==========================================================
// LA SEULE MODIFICATION EST ICI
// ==========================================================
const chartData = [
  { month: "Janv",  utilisateurs: 186 },
  { month: "Févr",  utilisateurs: 305 },
  { month: "Mars",  utilisateurs: 237 },
  { month: "Avril", utilisateurs: 173 },
  { month: "Mai",   utilisateurs: 209 },
  { month: "Juin",  utilisateurs: 214 },
  { month: "Juil",  utilisateurs: 322 },
  { month: "Août",  utilisateurs: 289 },
  { month: "Sept",  utilisateurs: 255 },
  { month: "Oct",   utilisateurs: 310 },
  { month: "Nov",   utilisateurs: 290 },
  { month: "Déc",   utilisateurs: 340 },
]
// ==========================================================
// FIN DE LA MODIFICATION
// ==========================================================


// Configuration visuelle du graphique
const chartConfig = {
  utilisateurs: {
    label: "Utilisateurs",
    color: "hsl(var(--chart-1))",
  },
}

export function UserActivityChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution de l'activité des utilisateurs</CardTitle>
        <CardDescription>
          Nombre d'utilisateurs actifs sur les 12 derniers mois
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartConfig.utilisateurs.color}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig.utilisateurs.color}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="utilisateurs"
              type="natural"
              fill="url(#fillDesktop)"
              stroke={chartConfig.utilisateurs.color}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}