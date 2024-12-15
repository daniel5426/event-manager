'use client';

import { useState, useEffect } from 'react';
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { getMonthlyParticipants } from './actions';
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
    label: "סה״כ משתתפים",
    color: "hsl(var(--chart-1))",
  },
  arriving: {
    label: "מגיעים",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function MonthlyParticipantsChart() {
  const [data, setData] = useState<{ 
    month: string; 
    total: number;
    arriving: number;
  }[]>([]);

  useEffect(() => {
    getMonthlyParticipants().then(rawData => {
      setData(rawData.map(item => ({
        ...item,
        month: new Date(item.month).toLocaleString('default', { month: 'long' })
      })));
    });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>ממוצע הגעות חודשי</CardTitle>
        <CardDescription>משתתפים פעילים ומגיעים בכל חודש</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-[600px]">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar 
              dataKey="total" 
              fill="var(--color-total)" 
              radius={4} 
            />
            <Bar 
              dataKey="arriving" 
              fill="var(--color-arriving)" 
              radius={4} 
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          מציג נתונים עבור 6 חודשים אחרונים
        </div>
      </CardFooter>
    </Card>
  );
} 