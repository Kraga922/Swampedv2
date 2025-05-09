
import Layout from "@/components/Layout";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { healthInsight } from "@/data/mockData";
import { useApp } from "@/contexts/AppContext";
import { Beer } from "lucide-react";

const Health = () => {
  const { pastNights } = useApp();
  
  const totalDrinks = pastNights.reduce(
    (total, night) => total + night.drinks.filter(drink => drink.userId === "u1").length,
    0
  );
  
  const lifeImpact = healthInsight.estimatedLifeImpact;
  const weeklyAverage = healthInsight.weeklyAverage;
  
  return (
    <Layout title="Health Insights">
      <div className="space-y-6">
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Beer className="h-5 w-5 mr-2" />
              Lifetime Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="text-5xl font-bold text-gradient mb-2">
                {totalDrinks}
              </div>
              <p className="text-gray-500 mb-4">Total Lifetime Drinks</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Estimated Life Impact</span>
                  <span className="text-sm font-medium">
                    {lifeImpact} {lifeImpact === 1 ? 'year' : 'years'}
                  </span>
                </div>
                <Progress 
                  value={lifeImpact * 20} 
                  className="h-2" 
                  indicatorColor={lifeImpact > 2 ? 'bg-red-500' : 'bg-orange-500'}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Weekly Average</span>
                  <span className="text-sm font-medium">{weeklyAverage} drinks</span>
                </div>
                <Progress 
                  value={weeklyAverage * 10} 
                  className="h-2" 
                  indicatorColor={weeklyAverage > 7 ? 'bg-red-500' : 'bg-yellow-500'}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {healthInsight.recommendations.map((rec, index) => (
                <li 
                  key={index} 
                  className="flex items-start gap-2 p-2 rounded-md bg-blue-50"
                >
                  <div className="h-5 w-5 rounded-full bg-app-blue text-white flex items-center justify-center text-xs flex-shrink-0">
                    {index + 1}
                  </div>
                  <p>{rec}</p>
                </li>
              ))}
            </ul>
            
            <div className="mt-6 p-4 border rounded-md bg-gray-50">
              <h3 className="font-medium mb-2">Monthly Trend</h3>
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${
                  healthInsight.monthlyTrend === 'decreasing' 
                    ? 'bg-green-500' 
                    : healthInsight.monthlyTrend === 'stable'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}></div>
                <span className="capitalize">{healthInsight.monthlyTrend}</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Your drinking habits are {healthInsight.monthlyTrend} compared to last month.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>About Alcohol Health</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-3">
              Moderate drinking means up to 1 drink per day for women and up to 2 drinks per day for men.
            </p>
            <p className="text-gray-700 mb-3">
              Heavy drinking is defined as consuming 8 or more drinks per week for women and 15 or more drinks per week for men.
            </p>
            <p className="text-gray-700">
              These insights are estimates based on general health guidelines and your drinking patterns. For personalized advice, consult a healthcare professional.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Health;
