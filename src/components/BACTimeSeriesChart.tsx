
import React from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatTime } from "@/utils/drinkUtils";
import { BACReading } from "@/types/models";

interface BACTimeSeriesChartProps {
  data: BACReading[];
}

const BACTimeSeriesChart: React.FC<BACTimeSeriesChartProps> = ({ data }) => {
  // Format data for the chart
  const chartData = data.map((reading) => ({
    time: formatTime(reading.timestamp),
    timestamp: reading.timestamp,
    bac: Number(reading.value.toFixed(3)),
  }));

  // Define BAC level thresholds for reference lines
  const bacThresholds = [
    { value: 0.02, label: 'Slight Effects', color: '#4CC9F0' },
    { value: 0.05, label: 'Buzzed', color: '#4361EE' },
    { value: 0.08, label: 'Legal Limit', color: '#F72585' },
    { value: 0.15, label: 'Danger Zone', color: '#b91c1c' }
  ];

  // Get min/max values for better chart display
  const maxBAC = Math.max(...data.map(d => d.value), 0.08) * 1.2; // Add 20% for visual margin

  return (
    <ChartContainer
      config={{
        bac: {
          label: 'Blood Alcohol Content',
          color: '#7209B7',
        },
      }}
      className="w-full aspect-[4/3]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={chartData}
          margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="time" 
            tickLine={false} 
            axisLine={false} 
            tickMargin={8} 
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tickMargin={8} 
            domain={[0, maxBAC]}
            tickFormatter={(value) => value.toFixed(2)}
          />
          
          {bacThresholds.map((threshold) => (
            <ReferenceLine 
              key={threshold.value}
              y={threshold.value} 
              stroke={threshold.color}
              strokeDasharray="3 3"
              label={{ 
                position: 'right',
                value: threshold.label,
                fill: threshold.color,
                fontSize: 10
              }}
            />
          ))}
          
          <Line 
            type="monotone" 
            dataKey="bac" 
            stroke="var(--color-bac, #7209B7)" 
            strokeWidth={2} 
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          
          <ChartTooltip content={<ChartTooltipContent />} />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default BACTimeSeriesChart;
