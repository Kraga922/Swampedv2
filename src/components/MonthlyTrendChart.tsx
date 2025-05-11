
import React from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface MonthlyTrendChartProps {
  data: {
    month: string;
    drinks: number;
    average: number;
  }[];
}

const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({ data }) => {
  return (
    <ChartContainer
      config={{
        drinks: {
          label: 'Total Drinks',
          color: '#7209B7',
        },
        average: {
          label: 'Weekly Average',
          color: '#4361EE',
        },
      }}
      className="w-full aspect-[4/3]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="month" 
            tickLine={false} 
            axisLine={false} 
            tickMargin={8} 
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tickMargin={8}
          />
          
          <Bar 
            dataKey="drinks" 
            fill="var(--color-drinks, #7209B7)" 
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="average" 
            fill="var(--color-average, #4361EE)" 
            radius={[4, 4, 0, 0]}
          />
          
          <ChartTooltip content={<ChartTooltipContent />} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default MonthlyTrendChart;
