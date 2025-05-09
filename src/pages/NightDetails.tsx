
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import DrinkCard from "@/components/DrinkCard";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { calculateDrinkCountByType, formatDate } from "@/utils/drinkUtils";
import { ArrowLeft, MapPin, Calendar, Clock } from "lucide-react";

const NightDetails = () => {
  const { nightId } = useParams<{ nightId: string }>();
  const { pastNights, getDrinkTypeById } = useApp();
  const navigate = useNavigate();
  
  const night = pastNights.find((n) => n.id === nightId);
  
  if (!night) {
    return (
      <Layout
        showNavigation={false}
        rightAction={
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        }
      >
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">Night Not Found</h3>
          <Button onClick={() => navigate("/")}>Go Back</Button>
        </div>
      </Layout>
    );
  }
  
  const drinkCountByType = calculateDrinkCountByType(night.drinks);
  
  return (
    <Layout
      showNavigation={false}
      rightAction={
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      }
    >
      <div className="mb-6">
        <h1 className="text-xl font-semibold mb-2">{night.group.name}</h1>
        
        <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {formatDate(night.startTime)}
          </div>
          {night.endTime && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {new Date(night.startTime).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })} - {new Date(night.endTime).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          )}
          {night.drinks.length > 0 && night.drinks[0].location && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {night.drinks[0].location.name}
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <h2 className="font-semibold mb-3">Group Members ({night.group.members.length})</h2>
          <div className="flex flex-wrap gap-2">
            {night.group.members.map((member) => (
              <div key={member.id} className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                <div className="h-5 w-5 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs">{member.name.charAt(0)}</span>
                  )}
                </div>
                <span className="text-sm">{member.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Drinks Summary</h2>
        <span className="text-gray-500">Total: {night.drinks.length}</span>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(drinkCountByType).map(([typeId, count]) => {
          const drinkType = getDrinkTypeById(typeId);
          if (!drinkType) return null;
          
          return (
            <div 
              key={typeId} 
              className="flex items-center gap-1 bg-white rounded-full px-3 py-2 border shadow-sm"
            >
              <span className="text-xl">{drinkType.icon}</span>
              <span className="font-medium">{count}</span>
            </div>
          );
        })}
      </div>
      
      <h2 className="font-semibold mb-3">Drink Timeline</h2>
      
      <div className="space-y-3">
        {night.drinks.map((drink) => (
          <DrinkCard key={drink.id} drink={drink} showUser={true} />
        ))}
      </div>
    </Layout>
  );
};

export default NightDetails;
