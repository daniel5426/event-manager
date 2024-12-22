'use client';

import * as React from "react";
import { PieChart, Pie, Cell, Label } from 'recharts';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getParticipants } from "../actions";

const chartConfig = {
  participants: {
    label: "משתתפים",
  },
  arrived: {
    label: "נוכחים",
    color: "hsl(var(--chart-1))",
  },
  exited: {
    label: "יצאו",
    color: "hsl(var(--chart-2))",
  },
  notArrived: {
    label: "לא הגיעו",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function ParticipantsPieChart({ eventId }: { eventId: number }) {
  const [data, setData] = useState<{ name: string; value: number; fill: string }[]>([]);
  
  const fetchData = async () => {
    const participants = await getParticipants(eventId);
    const arrivedData = participants.filter(p => p.arrivedTime !== null && p.exitedTime === null);
    const exitedData = participants.filter(p => p.exitedTime !== null);
    const notArrivedData = participants.filter(p => p.arrivedTime === null && p.exitedTime === null);
    
    setData([
      {
        name: "נוכחים",
        value: arrivedData.length,
        fill: "hsl(var(--chart-1))"
      },
      {
        name: "יצאו",
        value: exitedData.length,
        fill: "hsl(var(--chart-2))"
      },
      {
        name: "לא הגיעו",
        value: notArrivedData.length,
        fill: "hsl(var(--chart-3))"
      }
    ]);
  };

  useEffect(() => {
    fetchData(); // Initial fetch

    // Set up interval for periodic updates
    const intervalId = setInterval(fetchData, 10000); // 10 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [eventId]);

  const totalParticipants = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0);
  }, [data]);

  return (
    <Card className="flex flex-col w-full md:w-1/2 mr-0 md:ml-auto">
      <CardHeader className="items-center pb-0">
        <CardTitle>סטטוס משתתפים</CardTitle>
        <CardDescription>התפלגות סטטוס משתתפים באירוע</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[200px] md:h-[250px]"
        >
          <PieChart width={400} height={400}>
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
              innerRadius={45}
              outerRadius={65}
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
                          className="fill-foreground text-2xl md:text-3xl font-bold"
                        >
                          {totalParticipants.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-muted-foreground text-sm md:text-base"
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
        
        <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-6 mt-4 text-sm">
          {data.map((entry, index) => (
            <div key={index} className="flex items-center justify-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.fill }}
              />
              <span>{entry.name}: {entry.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 