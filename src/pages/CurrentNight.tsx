
import { useState } from "react";
import Layout from "@/components/Layout";
import DrinkCard from "@/components/DrinkCard";
import UserBacCard from "@/components/UserBacCard";
import AddDrinkForm from "@/components/AddDrinkForm";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { calculateDrinkCountByType } from "@/utils/drinkUtils";
import { Settings } from "lucide-react";

const CurrentNight = () => {
  const { activeNight, endNight, getDrinkTypeById } = useApp();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  
  const handleEndNight = () => {
    if (activeNight) {
      endNight(activeNight.id);
      navigate("/");
    }
  };
  
  if (!activeNight) {
    return (
      <Layout title="Current Night">
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No Active Night</h3>
          <p className="text-gray-500 mb-6">Start a night to track your drinks</p>
          <Button 
            onClick={() => navigate("/groups")}
            className="bg-app-purple hover:bg-app-dark-blue"
          >
            Start a Night
          </Button>
        </div>
      </Layout>
    );
  }
  
  const drinkCountByType = calculateDrinkCountByType(activeNight.drinks);
  
  return (
    <Layout 
      title={`${activeNight.group.name}`}
      rightAction={
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-5 w-5" />
          </Button>
          <AddDrinkForm />
        </div>
      }
    >
      {showSettings && (
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border animate-slide-up">
          <h3 className="font-semibold mb-3">Night Settings</h3>
          
          {activeNight.settings && (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Call Uber Threshold</p>
                <p className="text-gray-600">{activeNight.settings.uberThreshold} drinks</p>
              </div>
              <div>
                <p className="text-sm font-medium">Food Suggestion Threshold</p>
                <p className="text-gray-600">{activeNight.settings.foodThreshold} drinks</p>
              </div>
              <div>
                <p className="text-sm font-medium">Warning Notification Threshold</p>
                <p className="text-gray-600">{activeNight.settings.notificationThreshold} drinks</p>
              </div>
              <div className="pt-2">
                <Button 
                  onClick={handleEndNight} 
                  variant="destructive"
                  className="w-full"
                >
                  End Night
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <h2 className="font-semibold mb-3">Group Members</h2>
      
      <div className="space-y-3 mb-6">
        {activeNight.group.members.map((member) => (
          <UserBacCard key={member.id} user={member} />
        ))}
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Drinks Summary</h2>
        <span className="text-gray-500">Total: {activeNight.drinks.length}</span>
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
        {activeNight.drinks.length > 0 ? (
          activeNight.drinks.map((drink) => (
            <DrinkCard key={drink.id} drink={drink} showUser={true} />
          ))
        ) : (
          <div className="text-center py-8 bg-white rounded-lg border">
            <p className="text-gray-500">No drinks logged yet</p>
            <div className="mt-4">
              <AddDrinkForm />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CurrentNight;
