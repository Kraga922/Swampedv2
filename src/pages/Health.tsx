
import Layout from "@/components/Layout";
import { useApp } from "@/contexts/AppContext";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Beer, ChevronDown, ChevronUp, Info } from "lucide-react";
import { useState } from "react";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { formatDate, calculateDrinkCountByType } from "@/utils/drinkUtils";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Health = () => {
  const { user, drinks, drinkTypes, pastNights } = useApp();
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState<string | null>("impact");
  
  // This would typically come from the backend
  const healthInsight = {
    lifetimeDrinks: drinks.length,
    estimatedLifeImpact: drinks.length > 100 ? (drinks.length / 100).toFixed(1) : 0.5,
    weeklyAverage: 8.5,
    monthlyTrend: 'decreasing' as const,
    recommendations: [
      'Consider taking a break from drinking for a week',
      'Try alternating alcoholic drinks with water',
      'Set a limit before going out and stick to it'
    ]
  };
  
  // Calculate health score (0-100)
  const healthScore = Math.max(0, 100 - (healthInsight.lifetimeDrinks / 20));
  
  // Mock BAC time series data (in a real app, this would come from backend)
  const generateMockBacData = (nightId: string) => {
    const night = pastNights.find(n => n.id === nightId);
    if (!night) return [];
    
    let data = [];
    const startTime = new Date(night.startTime).getTime();
    const endTime = new Date(night.endTime || Date.now()).getTime();
    const step = (endTime - startTime) / 12; // 12 data points
    
    let bac = 0;
    for (let i = 0; i <= 12; i++) {
      const time = new Date(startTime + i * step);
      
      // Simulate BAC rising and then falling
      if (i <= 6) {
        bac += 0.014 * Math.random(); // Rising
      } else {
        bac -= 0.008 * Math.random(); // Falling
      }
      
      bac = Math.max(0, Math.min(0.25, bac));
      
      data.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        bac: Number(bac.toFixed(3)),
        timestamp: time
      });
    }
    
    return data;
  };
  
  // Get drink counts by type
  const drinkCountByType = calculateDrinkCountByType(drinks);
  
  const drinkTypeData = Object.entries(drinkCountByType).map(([typeId, count]) => {
    const drinkType = drinkTypes.find(t => t.id === typeId);
    return {
      name: drinkType?.name || 'Unknown',
      value: count,
      icon: drinkType?.icon || '🥃'
    };
  });
  
  const COLORS = ['#63B3ED', '#4FD1C5', '#F6AD55', '#FC8181', '#B794F4', '#F687B3'];
  
  // Weekly drinking pattern
  const weeklyData = [
    { day: 'Mon', drinks: 1 },
    { day: 'Tue', drinks: 0 },
    { day: 'Wed', drinks: 3 },
    { day: 'Thu', drinks: 2 },
    { day: 'Fri', drinks: 7 },
    { day: 'Sat', drinks: 10 },
    { day: 'Sun', drinks: 4 },
  ];
  
  // Most recent BAC data
  const mostRecentNightId = pastNights.length > 0 ? pastNights[0].id : null;
  const bacTimeSeriesData = mostRecentNightId ? generateMockBacData(mostRecentNightId) : [];
  
  // Toggle section expansion
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  return (
    <Layout title="Health Insights">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center">
                <div className="flex items-center">
                  <Beer className="h-5 w-5 mr-2 text-primary" />
                  Lifetime Impact
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => toggleSection('impact')}
                >
                  {expandedSection === 'impact' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <span className="text-4xl font-bold text-primary">
                  {healthInsight.lifetimeDrinks}
                </span>
                <p className="text-muted-foreground">Total Drinks Consumed</p>
              </div>
              
              {expandedSection === 'impact' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Health Score</span>
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
                  
                  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                      <span className="text-sm font-medium">Estimated Life Impact</span>
                    </div>
                    <span className="text-sm font-medium">-{healthInsight.estimatedLifeImpact} years</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center">
                <div>Monthly Trend</div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => toggleSection('trend')}
                >
                  {expandedSection === 'trend' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-2">
                <div className={`h-3 w-3 rounded-full mr-2 ${
                  healthInsight.monthlyTrend === 'decreasing' 
                    ? 'bg-green-500' 
                    : healthInsight.monthlyTrend === 'stable' 
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                }`}></div>
                <p className="capitalize">{healthInsight.monthlyTrend}</p>
              </div>
              
              {expandedSection === 'trend' && (
                <div className="mt-4">
                  <ChartContainer 
                    className="h-64"
                    config={{
                      drinks: {
                        theme: {
                          light: '#22c55e',
                          dark: '#22c55e'
                        }
                      }
                    }}
                  >
                    <AreaChart data={[
                      { month: 'Jan', drinks: 45 },
                      { month: 'Feb', drinks: 52 },
                      { month: 'Mar', drinks: 48 },
                      { month: 'Apr', drinks: 61 },
                      { month: 'May', drinks: 55 },
                      { month: 'Jun', drinks: 67 },
                      { month: 'Jul', drinks: 52 },
                      { month: 'Aug', drinks: 40 },
                      { month: 'Sep', drinks: 36 },
                      { month: 'Oct', drinks: 28 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="drinks" 
                        name="drinks" 
                        stroke="#22c55e" 
                        fill="#22c55e" 
                        fillOpacity={0.3} 
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center">
                <div>Recommendations</div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => toggleSection('recommendations')}
                >
                  {expandedSection === 'recommendations' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expandedSection === 'recommendations' ? (
                <ul className="space-y-2">
                  {healthInsight.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs mr-2">
                        {index + 1}
                      </span>
                      <p>{rec}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-muted-foreground text-sm">
                  We have personalized recommendations based on your drinking patterns. Click to expand.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>BAC Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {mostRecentNightId ? (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">
                      Blood Alcohol Content (BAC) over time during your most recent night out
                    </p>
                  </div>
                  
                  <ChartContainer 
                    className="h-64" 
                    config={{
                      bac: {
                        theme: {
                          light: '#22c55e',
                          dark: '#22c55e'
                        }
                      }
                    }}
                  >
                    <LineChart data={bacTimeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="time" 
                        padding={{ left: 20, right: 20 }}
                      />
                      <YAxis 
                        domain={[0, 0.25]} 
                        ticks={[0, 0.05, 0.08, 0.15, 0.2, 0.25]} 
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="bac" 
                        name="bac" 
                        stroke="#22c55e" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
                      />
                      {/* Legal limit reference line */}
                      <RechartsTooltip />
                    </LineChart>
                  </ChartContainer>
                  
                  <div className="flex items-center mt-4 px-4 py-2 bg-amber-950/30 rounded-lg">
                    <Info className="h-5 w-5 text-amber-500 mr-2" />
                    <p className="text-sm">0.08% is the legal driving limit in most countries</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No night data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Drink Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                {drinkTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={drinkTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {drinkTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <RechartsTooltip formatter={(value, name) => [`${value} drinks`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <p>No drink data available yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Pattern</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer 
                className="h-64"
                config={{
                  drinks: {
                    theme: {
                      light: '#22c55e',
                      dark: '#22c55e'
                    }
                  }
                }}
              >
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                  />
                  <Bar 
                    dataKey="drinks" 
                    name="drinks" 
                    fill="#22c55e" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ChartContainer>
              
              <div className="mt-4 p-3 bg-secondary rounded-lg">
                <h4 className="text-sm font-medium mb-1">Insight</h4>
                <p className="text-sm text-muted-foreground">
                  Your drinking pattern shows the highest consumption on weekends,
                  with Friday and Saturday accounting for 46% of your total consumption.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-center mt-6">
            <Button 
              variant="default" 
              onClick={() => navigate("/")}
              className="bg-primary hover:bg-primary/80 text-white"
            >
              View Past Nights
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Health;
