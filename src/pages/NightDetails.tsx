
import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { useApp } from "@/contexts/AppContext";
import DrinkCard from "@/components/DrinkCard";
import { formatDate, formatTime, calculateDrinkCountByType } from "@/utils/drinkUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BacTimelineChart from "@/components/BacTimelineChart";
import { MapPin, Camera } from "lucide-react";

const NightDetails = () => {
  const { nightId } = useParams<{ nightId: string }>();
  const { pastNights, getDrinkTypeById, user } = useApp();
  
  const night = pastNights.find((n) => n.id === nightId);
  
  if (!night) {
    return (
      <Layout title="Night Details">
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">Night not found</h3>
        </div>
      </Layout>
    );
  }
  
  const drinkCountByType = calculateDrinkCountByType(night.drinks);
  const userDrinks = night.drinks.filter((drink) => drink.userId === user.id);
  const hasPhotos = night.drinks.some(drink => drink.photo);
  
  return (
    <Layout title={`${night.group.name} - ${formatDate(night.startTime)}`}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Night Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium">Start Time</h3>
                <p className="text-xl">{formatTime(night.startTime)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">End Time</h3>
                <p className="text-xl">{night.endTime ? formatTime(night.endTime) : "N/A"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Total Drinks</h3>
                <p className="text-xl">{night.drinks.length}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Your Drinks</h3>
                <p className="text-xl">{userDrinks.length}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Drinks by Type</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(drinkCountByType).map(([typeId, count]) => {
                  const drinkType = getDrinkTypeById(typeId);
                  if (!drinkType) return null;
                  
                  return (
                    <div 
                      key={typeId} 
                      className="flex items-center gap-1 bg-secondary/50 rounded-full px-3 py-1"
                    >
                      <span className="text-xl">{drinkType.icon}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Your BAC Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <BacTimelineChart drinks={night.drinks} userId={user.id} />
          </CardContent>
        </Card>
        
        {hasPhotos && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="mr-2 h-5 w-5" />
                Night Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {night.drinks
                  .filter(drink => drink.photo)
                  .map((drink, index) => (
                    <div key={index} className="aspect-square rounded-md overflow-hidden">
                      <img 
                        src={drink.photo} 
                        alt={`Photo from ${formatTime(drink.timestamp)}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Visited Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from(new Set(night.drinks.map(d => d.location?.name).filter(Boolean))).map((locationName, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-secondary/20">
                  <MapPin className="h-4 w-4 text-app-purple" />
                  <span>{locationName}</span>
                </div>
              ))}
              {night.drinks.every(d => !d.location?.name) && (
                <p className="text-muted-foreground text-center py-2">No location data available</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div>
          <h2 className="font-semibold mb-3">Drink Timeline</h2>
          <div className="space-y-3">
            {night.drinks.map((drink) => (
              <DrinkCard key={drink.id} drink={drink} showUser={true} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NightDetails;
