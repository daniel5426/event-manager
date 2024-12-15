'use client';

import { useState, useEffect } from 'react';
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { getBimonthlyEvents } from './actions';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  total: {
    label: "סה״כ אירועים",
    color: "hsl(var(--chart-1))",
  },
  active: {
    label: "אירועים פעילים",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function EventsAreaChart() {
  const [data, setData] = useState<{ 
    period: string;
    total: number;
    active: number;
  }[]>([]);

  useEffect(() => {
    getBimonthlyEvents().then(rawData => {
      setData(rawData.map(item => ({
        period: new Date(item.period).toLocaleString('default', { month: 'long' }),
        total: item.events,
        active: Math.round(item.events * 0.6) // Adjust the ratio as needed
      })));
    });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>אירועים לאורך זמן</CardTitle>
        <CardDescription>
          מציג נתונים עבור 12 חודשים אחרונים
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer 
          config={chartConfig}
          className="h-[200px] w-[600px]"
        >
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              top: 8,
              left: 12,
              right: 12,
              bottom: 8
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="total"
              type="monotone"
              fill="var(--color-total)"
              fillOpacity={0.4}
              stroke="var(--color-total)"
            />
            <Area
              dataKey="active"
              type="monotone"
              fill="var(--color-active)"
              fillOpacity={0.4}
              stroke="var(--color-active)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
} 