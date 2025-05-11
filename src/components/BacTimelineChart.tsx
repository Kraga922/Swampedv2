
import React from "react";
import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Drink, User } from "@/types/models";
import { calculateBAC, getBacLevel, formatTime } from "@/utils/drinkUtils";

interface BacTimelineChartProps {
  drinks: Drink[];
  userId: string;
}

const BacTimelineChart = ({ drinks, userId }: BacTimelineChartProps) => {
  // Sort drinks by timestamp
  const sortedDrinks = [...drinks]
    .filter(drink => drink.userId === userId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  if (sortedDrinks.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center border rounded-lg bg-secondary/20">
        <p className="text-muted-foreground">No drinks recorded</p>
      </div>
    );
  }

  // Calculate BAC at each drink time
  const timelineData = sortedDrinks.map((drink, index) => {
    const drinksToThisPoint = sortedDrinks.slice(0, index + 1);
    const bac = calculateBAC(drinksToThisPoint, userId);
    const { color } = getBacLevel(bac);
    
    return {
      time: formatTime(drink.timestamp),
      bac: parseFloat(bac.toFixed(3)),
      drinkCount: index + 1,
      color: color.replace('bg-', '')
    };
  });

  return (
    <div className="h-64">
      <ChartContainer
        config={{
          bac: {
            label: "BAC Level",
            theme: {
              light: "#8B5CF6",
              dark: "#4CC9F0",
            },
          },
          drinkCount: {
            label: "Drinks",
            theme: {
              light: "#D946EF",
              dark: "#D946EF",
            },
          }
        }}
      >
        <LineChart data={timelineData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="time" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.5rem'
            }} 
          />
          <Legend />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="bac" 
            name="BAC Level"
            stroke="var(--color-bac, #8B5CF6)" 
            strokeWidth={2}
            activeDot={{ r: 6 }}
          />
          <Line 
            yAxisId="right"
            type="stepAfter" 
            dataKey="drinkCount" 
            name="Drink Count"
            stroke="var(--color-drinkCount, #D946EF)" 
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
};

export default BacTimelineChart;
