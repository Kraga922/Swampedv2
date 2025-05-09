
import { User } from "@/types/models";
import { calculateBAC, getBacLevel } from "@/utils/drinkUtils";
import { useApp } from "@/contexts/AppContext";
import { Progress } from "@/components/ui/progress";

interface UserBacCardProps {
  user: User;
}

const UserBacCard = ({ user }: UserBacCardProps) => {
  const { activeNight } = useApp();
  
  if (!activeNight) return null;
  
  const bac = calculateBAC(activeNight.drinks, user.id);
  const { level, color } = getBacLevel(bac);
  
  const getBacDescription = (level: string) => {
    switch (level) {
      case 'sober':
        return 'Minimal impairment';
      case 'buzzed':
        return 'Slight euphoria';
      case 'tipsy':
        return 'Reduced judgement';
      case 'drunk':
        return 'Significant impairment';
      case 'danger':
        return 'Serious risk! Seek help';
      default:
        return '';
    }
  };
  
  const userDrinks = activeNight.drinks.filter(d => d.userId === user.id);
  
  return (
    <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full" />
            ) : (
              <span>{user.name.charAt(0)}</span>
            )}
          </div>
          <div>
            <h4 className="font-medium">{user.name}</h4>
            <div className="flex items-center">
              {user.isDesignatedDriver && (
                <span className="text-xs bg-app-purple text-white px-2 py-0.5 rounded-full mr-1">
                  DD
                </span>
              )}
              {user.isAdmin && (
                <span className="text-xs bg-app-blue text-white px-2 py-0.5 rounded-full">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <div className={`text-sm font-semibold ${color.replace('bg-', 'text-')}`}>
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </div>
          <div className="text-xs text-gray-500">{userDrinks.length} drinks</div>
        </div>
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm">Estimated BAC</span>
          <span className="font-medium">{bac.toFixed(3)}%</span>
        </div>
        <Progress 
          value={Math.min(bac * 100 / 0.2, 100)} 
          className={`h-2 ${color}`} 
        />
      </div>
      
      <div className="text-xs text-gray-500">
        {getBacDescription(level)}
      </div>
    </div>
  );
};

export default UserBacCard;
