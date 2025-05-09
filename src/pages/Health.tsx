
import Layout from "@/components/Layout";
import { useApp } from "@/contexts/AppContext";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Beer, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, CartesianGrid, Tooltip, Legend } from "recharts";

const Health = () => {
  const { user } = useApp();
  
  // This would typically come from the backend
  const healthInsight = {
    lifetimeDrinks: 347,
    estimatedLifeImpact: 1.2, // years
    weeklyAverage: 8.5,
    monthlyTrend: 'decreasing' as const,
    recommendations: [
      'Consider taking a break from drinking for a week',
      'Try alternating alcoholic drinks with water',
      'Set a limit before going out and stick to it'
    ],
    weeklyData: [
      { day: 'Mon', drinks: 0 },
      { day: 'Tue', drinks: 1 },
      { day: 'Wed', drinks: 2 },
      { day: 'Thu', drinks: 0 },
      { day: 'Fri', drinks: 5 },
      { day: 'Sat', drinks: 6 },
      { day: 'Sun', drinks: 2 },
    ],
    monthlyData: [
      { month: 'Jan', drinks: 32 },
      { month: 'Feb', drinks: 28 },
      { month: 'Mar', drinks: 31 },
      { month: 'Apr', drinks: 24 },
      { month: 'May', drinks: 18 },
      { month: 'Jun', drinks: 21 },
    ],
    bacTrend: [
      { time: '12 AM', bac: 0.00 },
      { time: '1 AM', bac: 0.02 },
      { time: '2 AM', bac: 0.05 },
      { time: '3 AM', bac: 0.07 },
      { time: '4 AM', bac: 0.06 },
      { time: '5 AM', bac: 0.04 },
      { time: '6 AM', bac: 0.02 },
      { time: '7 AM', bac: 0.01 },
      { time: '8 AM', bac: 0.00 },
    ]
  };
  
  // Calculate health score (0-100)
  const healthScore = Math.max(0, 100 - (healthInsight.lifetimeDrinks / 20));
  
  return (
    <Layout title="Health Insights">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Beer className="h-6 w-6 mr-2 text-app-purple" />
              Lifetime Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <span className="text-4xl font-bold text-app-purple">
                {healthInsight.lifetimeDrinks}
              </span>
              <p className="text-muted-foreground">Total Drinks Consumed</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Health Impact</span>
                  <span className="text-sm font-medium">{healthScore.toFixed(0)}%</span>
                </div>
                <Progress 
                  value={healthScore} 
                  className="h-2"
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Weekly Average</span>
                  <span className="text-sm font-medium">{healthInsight.weeklyAverage} drinks</span>
                </div>
                <Progress 
                  value={(healthInsight.weeklyAverage / 14) * 100} 
                  className="h-2"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-100 dark:border-amber-900">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                  <span className="text-sm font-medium">Estimated Life Impact</span>
                </div>
                <span className="text-sm font-medium">-{healthInsight.estimatedLifeImpact} years</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Weekly Consumption</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ChartContainer
                config={{
                  drinks: {
                    label: "Drinks",
                    theme: {
                      light: "#8B5CF6",
                      dark: "#8B5CF6",
                    },
                  },
                }}
              >
                <BarChart data={healthInsight.weeklyData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip content={(props) => (
                    <ChartTooltipContent {...props} />
                  )} />
                  <Bar dataKey="drinks" name="drinks" fill="var(--color-drinks, #8B5CF6)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <div className={`h-3 w-3 rounded-full mr-2 ${
                healthInsight.monthlyTrend === 'decreasing' 
                  ? 'bg-green-500' 
                  : healthInsight.monthlyTrend === 'stable' 
                    ? 'bg-amber-500'
                    : 'bg-red-500'
              }`}></div>
              <p className="capitalize flex items-center">
                {healthInsight.monthlyTrend} 
                {healthInsight.monthlyTrend === 'decreasing' ? (
                  <TrendingDown className="ml-1 h-4 w-4 text-green-500" />
                ) : healthInsight.monthlyTrend === 'increasing' ? (
                  <TrendingUp className="ml-1 h-4 w-4 text-red-500" />
                ) : null}
              </p>
            </div>
            
            <div className="h-64">
              <ChartContainer
                config={{
                  drinks: {
                    label: "Monthly Drinks",
                    theme: {
                      light: "#D946EF",
                      dark: "#D946EF",
                    },
                  },
                }}
              >
                <LineChart data={healthInsight.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={(props) => (
                    <ChartTooltipContent {...props} />
                  )} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="drinks" 
                    name="drinks"
                    stroke="var(--color-drinks, #D946EF)" 
                    strokeWidth={2}
                    dot={{ r: 4 }} 
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average BAC Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ChartContainer
                config={{
                  bac: {
                    label: "BAC Level",
                    theme: {
                      light: "#3A0CA3",
                      dark: "#4CC9F0",
                    },
                  },
                }}
              >
                <LineChart data={healthInsight.bacTrend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip content={(props) => (
                    <ChartTooltipContent {...props} />
                  )} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="bac" 
                    name="bac"
                    stroke="var(--color-bac, #3A0CA3)" 
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {healthInsight.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-app-purple text-white text-xs mr-2">
                    {index + 1}
                  </span>
                  <p>{rec}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Health;
