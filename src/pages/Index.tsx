
import Layout from "@/components/Layout";
import NightSummary from "@/components/NightSummary";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

const Index = () => {
  const { pastNights } = useApp();
  const navigate = useNavigate();
  
  return (
    <Layout
      title="Past Nights"
      rightAction={
        <Button 
          onClick={() => navigate("/groups")}
          className="bg-app-purple hover:bg-app-dark-blue"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Night
        </Button>
      }
    >
      <div className="space-y-4">
        {pastNights.length > 0 ? (
          pastNights.map((night) => (
            <NightSummary key={night.id} night={night} />
          ))
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No past nights yet</h3>
            <p className="text-gray-500 mb-6">Start tracking your nights out with friends</p>
            <Button 
              onClick={() => navigate("/groups")}
              className="bg-app-purple hover:bg-app-dark-blue"
            >
              <Plus className="h-5 w-5 mr-2" />
              Start a Night
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;
