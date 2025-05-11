
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useApp } from "@/contexts/AppContext";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Beer, AlertTriangle, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { calculateBAC, calculateTotalDrinks, estimateLifeImpact } from "@/utils/drinkUtils";
import BACTimeSeriesChart from "@/components/BACTimeSeriesChart";
import MonthlyTrendChart from "@/components/MonthlyTrendChart";
import { BACReading, Drink } from "@/types/models";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Health = () => {
  const { session } = useAuth();
  const { activeNight } = useApp();
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [bacReadings, setBacReadings] = useState<BACReading[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Generate mock health insights based on real drink data
  const generateHealthInsights = (userDrinks: Drink[]) => {
    const totalDrinks = calculateTotalDrinks(userDrinks);
    const lifeImpact = estimateLifeImpact(totalDrinks);
    
    // Calculate weekly average (assuming data for last 3 months)
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    
    const recentDrinks = userDrinks.filter(drink => 
      new Date(drink.timestamp) >= threeMonthsAgo
    );
    
    const weekCount = Math.max(1, Math.ceil((now.getTime() - threeMonthsAgo.getTime()) / (7 * 24 * 60 * 60 * 1000)));
    const weeklyAverage = recentDrinks.length / weekCount;
    
    // Determine trend (mock logic)
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    
    // Group by month to determine trend
    const byMonth: Record<string, number> = {};
    recentDrinks.forEach(drink => {
      const monthYear = new Date(drink.timestamp).toISOString().substring(0, 7);
      byMonth[monthYear] = (byMonth[monthYear] || 0) + 1;
    });
    
    const months = Object.keys(byMonth).sort();
    if (months.length >= 2) {
      const lastMonth = byMonth[months[months.length - 1]];
      const previousMonth = byMonth[months[months.length - 2]];
      
      if (lastMonth > previousMonth * 1.2) trend = 'increasing';
      else if (lastMonth < previousMonth * 0.8) trend = 'decreasing';
    }
    
    return {
      lifetimeDrinks: totalDrinks,
      estimatedLifeImpact: lifeImpact,
      weeklyAverage: weeklyAverage,
      monthlyTrend: trend,
      recommendations: [
        weeklyAverage > 14 ? 'Consider reducing your weekly drinks to stay within health guidelines' : 
                            'Your weekly average is within moderate drinking guidelines',
        trend === 'increasing' ? 'Your monthly consumption is trending upward - be mindful of this change' :
                                'Keep tracking your drinks to maintain awareness',
        'Consider taking alcohol-free days each week to reduce health impacts',
      ]
    };
  };
  
  useEffect(() => {
    const fetchDrinks = async () => {
      if (!session?.user?.id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('drinks')
          .select('*')
          .eq('user_id', session.user.id)
          .order('timestamp', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          // Convert data to match our model
          const formattedDrinks = data.map(item => ({
            id: item.id,
            userId: item.user_id,
            typeId: item.type_id,
            timestamp: item.timestamp,
            location: item.location_name ? {
              name: item.location_name,
              lat: item.location_lat,
              lng: item.location_lng
            } : undefined,
            photo: item.photo
          }));
          
          setDrinks(formattedDrinks);
          
          // Generate BAC time series data
          if (formattedDrinks.length > 0) {
            generateBACTimeSeries(formattedDrinks);
            generateMonthlyData(formattedDrinks);
          }
        }
      } catch (error) {
        console.error('Error fetching drinks:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDrinks();
  }, [session?.user?.id]);
  
  // Generate BAC time series data
  const generateBACTimeSeries = (userDrinks: Drink[]) => {
    if (userDrinks.length === 0) return;
    
    // Sort drinks by timestamp
    const sortedDrinks = [...userDrinks].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    // Generate a time series for BAC levels
    const readings: BACReading[] = [];
    
    // Get earliest and latest timestamps
    const firstDrink = new Date(sortedDrinks[0].timestamp);
    const lastDrink = new Date(sortedDrinks[sortedDrinks.length - 1].timestamp);
    
    // Create time intervals (every 30 minutes)
    const interval = 30 * 60 * 1000; // 30 minutes in milliseconds
    const userId = sortedDrinks[0].userId;
    
    for (let time = firstDrink.getTime(); time <= lastDrink.getTime() + 6 * 60 * 60 * 1000; time += interval) {
      const timestamp = new Date(time).toISOString();
      
      // Get all drinks consumed before this time
      const drinksBeforeTime = sortedDrinks.filter(
        drink => new Date(drink.timestamp).getTime() <= time
      );
      
      // Calculate BAC at this time point
      const bac = calculateBAC(drinksBeforeTime, userId);
      
      readings.push({
        timestamp,
        value: bac
      });
      
      // If BAC is close to zero and we're past the last drink by 6 hours, stop
      if (bac < 0.001 && time > lastDrink.getTime() + 3 * 60 * 60 * 1000) break;
    }
    
    setBacReadings(readings);
  };
  
  // Generate monthly data for trends
  const generateMonthlyData = (userDrinks: Drink[]) => {
    if (userDrinks.length === 0) return;
    
    const byMonth: Record<string, number> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Get the last 6 months
    const now = new Date();
    const monthData = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = monthDate.toISOString().substring(0, 7);
      const monthName = `${monthNames[monthDate.getMonth()]} ${monthDate.getFullYear()}`.substring(0, 6);
      
      const monthDrinks = userDrinks.filter(drink => 
        drink.timestamp.substring(0, 7) === monthKey
      );
      
      const drinksCount = monthDrinks.length;
      const weeksInMonth = Math.ceil(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate() / 7);
      const weeklyAvg = drinksCount > 0 ? +(drinksCount / weeksInMonth).toFixed(1) : 0;
      
      monthData.push({
        month: monthName,
        drinks: drinksCount,
        average: weeklyAvg
      });
    }
    
    setMonthlyData(monthData);
  };

  const healthInsight = generateHealthInsights(drinks);
  
  // Calculate health score (0-100)
  const healthScore = Math.max(0, 100 - (healthInsight.lifetimeDrinks / 20));
  
  // Get active night BAC if available
  const activeNightBAC = activeNight && session?.user?.id ? calculateBAC(activeNight.drinks, session.user.id) : 0;
  
  return (
    <Layout title="Health Insights">
      <div className="space-y-6">
        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="insights">Health Insights</TabsTrigger>
            <TabsTrigger value="trends">Drinking Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="insights" className="space-y-4 pt-4">
            {activeNightBAC > 0.01 && (
              <Card className="border-app-purple">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Beer className="h-5 w-5 mr-2 text-app-purple" />
                    Current BAC Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <span className="text-4xl font-bold text-app-purple">
                      {activeNightBAC.toFixed(3)}
                    </span>
                    <p className="text-gray-500">Blood Alcohol Content</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Progress 
                      value={Math.min(activeNightBAC / 0.15 * 100, 100)} 
                      className="h-3 bg-secondary"
                    />
                    
                    <div className="flex justify-between text-xs mt-1">
                      <span>0.00</span>
                      <span className="text-blue-400">0.02</span>
                      <span className="text-yellow-400">0.05</span>
                      <span className="text-orange-500">0.08</span>
                      <span className="text-red-500">0.15+</span>
                    </div>
                    
                    <div className="h-1 w-full flex mt-1">
                      <div className="flex-1 bg-blue-400"></div>
                      <div className="flex-1 bg-yellow-400"></div>
                      <div className="flex-1 bg-orange-500"></div>
                      <div className="flex-1 bg-red-500"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
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
                  <p className="text-gray-500">Total Drinks Consumed</p>
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
                      <span className="text-sm font-medium">{healthInsight.weeklyAverage.toFixed(1)} drinks</span>
                    </div>
                    <Progress 
                      value={(healthInsight.weeklyAverage / 14) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                      <span className="text-sm font-medium">Estimated Life Impact</span>
                    </div>
                    <span className="text-sm font-medium">-{healthInsight.estimatedLifeImpact.toFixed(1)} years</span>
                  </div>
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
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-app-purple" />
                  Monthly Trend
                </CardTitle>
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
                  <p className="capitalize">{healthInsight.monthlyTrend}</p>
                </div>
                
                {loading ? (
                  <div className="h-64 bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-500">Loading...</p>
                  </div>
                ) : monthlyData.length > 0 ? (
                  <MonthlyTrendChart data={monthlyData} />
                ) : (
                  <div className="h-64 bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-500">Not enough data to show trends</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-app-purple" />
                  BAC Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-64 bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-500">Loading...</p>
                  </div>
                ) : bacReadings.length > 0 ? (
                  <BACTimeSeriesChart data={bacReadings} />
                ) : (
                  <div className="h-64 bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-500">No BAC data available</p>
                  </div>
                )}
                
                <div className="mt-4 text-sm text-gray-500">
                  <p>Blood Alcohol Content (BAC) measures the amount of alcohol in your bloodstream.</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><span className="text-app-light-blue font-semibold">0.02</span>: Slight effects, relaxation</li>
                    <li><span className="text-app-blue font-semibold">0.05</span>: Feeling of wellbeing, relaxation, reduced inhibitions</li>
                    <li><span className="text-app-red font-semibold">0.08</span>: Legal limit for driving in most places</li>
                    <li><span className="text-red-600 font-semibold">0.15+</span>: Major impairment of motor skills, significant loss of control</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Health;
