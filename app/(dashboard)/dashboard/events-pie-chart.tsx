'use client';

import * as React from "react";
import { PieChart, Pie, Cell, Label } from 'recharts';
import { useEffect, useState } from 'react';
import { getEventsData } from './actions';
import { TrendingUp } from 'lucide-react';
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
  participants: {
    label: "משתתפים",
  },
  event1: {
    label: "אירוע 1",
    color: "hsl(var(--chart-1))",
  },
  event2: {
    label: "אירוע 2",
    color: "hsl(var(--chart-2))",
  },
  event3: {
    label: "אירוע 3",
    color: "hsl(var(--chart-3))",
  },
  event4: {
    label: "אירוע 4",
    color: "hsl(var(--chart-4))",
  },
  event5: {
    label: "אירוע 5",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export function EventsPieChart() {
  const [data, setData] = useState<{ name: string; value: number; fill: string }[]>([]);
  
  useEffect(() => {
    getEventsData().then(rawData => {
      const colors = [
        "hsl(var(--chart-1))",
        "hsl(var(--chart-2))",
        "hsl(var(--chart-3))",
        "hsl(var(--chart-4))",
        "hsl(var(--chart-5))"
      ];
      
      setData(rawData.map((item, index) => ({
        ...item,
        fill: colors[index % colors.length]
      })));
    });
  }, []);

  const totalParticipants = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0);
  }, [data]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>משתתפים לפי אירוע</CardTitle>
        <CardDescription>התפלגות משתתפים בכל אירוע</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[250px]"
        >
          <PieChart width={500} height={500}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              strokeWidth={1}
              stroke="hsl(var(--background))"
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.fill}
                />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalParticipants.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          משתתפים
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          מציג נתונים עבור 6 חודשים אחרונים
        </div>
      </CardFooter>
    </Card>
  );
} 