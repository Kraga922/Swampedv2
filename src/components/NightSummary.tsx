
import { Night } from "@/types/models";
import { formatDate, calculateDrinkCountByType, calculateUserDrinks } from "@/utils/drinkUtils";
import { useApp } from "@/contexts/AppContext";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NightSummaryProps {
  night: Night;
  onClick?: () => void;
}

const NightSummary = ({ night, onClick }: NightSummaryProps) => {
  const { user, getDrinkTypeById } = useApp();
  const navigate = useNavigate();
  
  const totalDrinks = night.drinks.length;
  const userDrinks = calculateUserDrinks(night.drinks, user.id);
  const drinkCountByType = calculateDrinkCountByType(night.drinks);
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/night/${night.id}`);
    }
  };
  
  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-sm mb-4 border"
      onClick={handleClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">
            {night.group.name} - {formatDate(night.startTime)}
          </h3>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="flex items-center mb-3">
          <div className="bg-app-purple text-white rounded-full h-8 w-8 flex items-center justify-center mr-2">
            {totalDrinks}
          </div>
          <span className="text-sm">Total Drinks</span>
          <div className="mx-3 h-4 border-r border-gray-200"></div>
          <div className="bg-app-blue text-white rounded-full h-8 w-8 flex items-center justify-center mr-2">
            {userDrinks.length}
          </div>
          <span className="text-sm">Your Drinks</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {Object.entries(drinkCountByType).map(([typeId, count]) => {
            const drinkType = getDrinkTypeById(typeId);
            if (!drinkType) return null;
            
            return (
              <div key={typeId} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                <span className="mr-1">{drinkType.icon}</span>
                <span className="text-sm">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="bg-gray-50 p-3 border-t">
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {night.group.members.slice(0, 3).map((member) => (
              <div
                key={member.id}
                className="h-6 w-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center overflow-hidden"
              >
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
            ))}
            
            {night.group.members.length > 3 && (
              <div className="h-6 w-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center">
                <span className="text-xs">+{night.group.members.length - 3}</span>
              </div>
            )}
          </div>
          <span className="text-sm text-gray-600">
            {night.group.members.length} {night.group.members.length === 1 ? "person" : "people"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NightSummary;
