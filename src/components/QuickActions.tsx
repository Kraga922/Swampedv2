
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MapPin, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const QuickActions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-card/80 backdrop-blur-xl px-3 py-2 rounded-full shadow-lg border border-border/30 z-50 animate-fade-in">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full bg-primary/10 hover:bg-primary/20 text-primary"
        onClick={() => {
          navigate("/location");
          toast({
            title: "Location Sharing",
            description: "Opening location sharing view",
            duration: 2000,
          });
        }}
      >
        <MapPin className="h-5 w-5" />
      </Button>
      
      <Button
        variant="ghost" 
        size="icon"
        className="rounded-full bg-primary/10 hover:bg-primary/20 text-primary"
        onClick={() => {
          navigate("/friends");
          toast({
            title: "Friends",
            description: "Opening friends list",
            duration: 2000,
          });
        }}
      >
        <Users className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default QuickActions;
