
import { Drink } from "@/types/models";
import { formatTime } from "@/utils/drinkUtils";
import { useApp } from "@/contexts/AppContext";
import { MapPin } from "lucide-react";

interface DrinkCardProps {
  drink: Drink;
  showUser?: boolean;
}

const DrinkCard = ({ drink, showUser = false }: DrinkCardProps) => {
  const { getUserById, getDrinkTypeById } = useApp();
  
  const user = getUserById(drink.userId);
  const drinkType = getDrinkTypeById(drink.typeId);
  
  if (!user || !drinkType) return null;
  
  return (
    <div className="bg-card rounded-lg p-4 border shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          {showUser && (
            <div className="mr-3">
              <div className="h-10 w-10 rounded-full bg-app-purple/20 flex items-center justify-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-app-purple font-medium">{user.name.charAt(0)}</span>
                )}
              </div>
            </div>
          )}
          
          <div>
            <div className="flex items-center">
              <span className="text-xl mr-2">{drinkType.icon}</span>
              <span className="font-medium">{drinkType.name}</span>
              
              {user.isDesignatedDriver && (
                <span className="ml-2 text-xs bg-app-purple text-white px-2 py-0.5 rounded-full">
                  DD
                </span>
              )}
            </div>
            
            {showUser && <p className="text-sm text-muted-foreground">{user.name}</p>}
            
            {drink.location && (
              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{drink.location.name}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <span className="text-sm text-muted-foreground">
            {formatTime(drink.timestamp)}
          </span>
          
          <div className="flex items-center justify-end mt-1">
            <span className="text-xs px-2 py-0.5 bg-app-purple/10 rounded-full">
              {drinkType.standardDrinks} standard
            </span>
          </div>
        </div>
      </div>
      
      {drink.photo && (
        <div className="mt-3">
          <img
            src={drink.photo}
            alt="Drink photo"
            className="w-full h-48 object-cover rounded-md"
          />
        </div>
      )}
    </div>
  );
};

export default DrinkCard;
