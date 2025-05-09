
import { useState } from "react";
import { formatTime, getDrinkTypeById } from "@/utils/drinkUtils";
import { Drink, User } from "@/types/models";
import { useApp } from "@/contexts/AppContext";
import { MapPin, User as UserIcon } from "lucide-react";

interface DrinkCardProps {
  drink: Drink;
  showUser?: boolean;
}

const DrinkCard = ({ drink, showUser = true }: DrinkCardProps) => {
  const { getUserById } = useApp();
  const [expanded, setExpanded] = useState(false);
  
  const user = getUserById(drink.userId);
  const drinkType = getDrinkTypeById(drink.typeId);
  
  if (!drinkType) return null;
  
  return (
    <div 
      className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="text-2xl">{drinkType.icon}</div>
          <div>
            <h4 className="font-medium">{drinkType.name}</h4>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <span>{formatTime(drink.timestamp)}</span>
              {drink.location && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {drink.location.name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {showUser && user && (
          <div className="flex items-center gap-1">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-6 w-6 rounded-full"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-gray-500" />
              </div>
            )}
            <span className="text-sm">{user.name}</span>
          </div>
        )}
      </div>
      
      {expanded && (
        <div className="mt-3 pt-3 border-t text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-gray-500">Alcohol Content</p>
              <p>{drinkType.alcoholContent}%</p>
            </div>
            <div>
              <p className="text-gray-500">Standard Drinks</p>
              <p>{drinkType.standardDrinks}</p>
            </div>
            <div>
              <p className="text-gray-500">Volume</p>
              <p>{drinkType.volume} ml</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrinkCard;
