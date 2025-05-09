
import Layout from "@/components/Layout";
import { useApp } from "@/contexts/AppContext";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Beer, AlertTriangle } from "lucide-react";

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
                  <span className="text-sm font-medium">{healthInsight.weeklyAverage} drinks</span>
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
                <span className="text-sm font-medium">-{healthInsight.estimatedLifeImpact} years</span>
              </div>
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
              <p className="capitalize">{healthInsight.monthlyTrend}</p>
            </div>
            
            <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Detailed trend chart will appear here</p>
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
