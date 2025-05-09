
import { Group } from "@/types/models";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";

interface GroupCardProps {
  group: Group;
}

const GroupCard = ({ group }: GroupCardProps) => {
  const { startNight, activeNight } = useApp();
  const navigate = useNavigate();
  
  const handleStartNight = () => {
    startNight(group.id);
    navigate("/current");
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-3 border">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg">{group.name}</h3>
        <Button 
          onClick={handleStartNight}
          disabled={!!activeNight}
          className="bg-app-purple hover:bg-app-dark-blue"
        >
          Start Night
        </Button>
      </div>
      
      <div className="mb-3">
        <p className="text-sm text-gray-500">Members ({group.members.length})</p>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        {group.members.map((member) => (
          <div key={member.id} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
            <div className="h-5 w-5 rounded-full bg-gray-300 mr-2 flex items-center justify-center overflow-hidden">
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
            {member.isAdmin && <span className="ml-1 text-xs text-app-blue">(Admin)</span>}
            {member.isDesignatedDriver && <span className="ml-1 text-xs text-app-purple">(DD)</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupCard;
