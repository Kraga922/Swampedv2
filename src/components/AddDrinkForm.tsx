
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useApp } from "@/contexts/AppContext";
import { Plus } from "lucide-react";

interface AddDrinkFormProps {
  userId?: string;
}

const AddDrinkForm = ({ userId }: AddDrinkFormProps) => {
  const { user, allDrinkTypes, addDrink } = useApp();
  const [open, setOpen] = useState(false);
  const [selectedDrinkType, setSelectedDrinkType] = useState("");
  const [location, setLocation] = useState("");
  
  const handleAddDrink = () => {
    if (!selectedDrinkType) return;
    
    addDrink({
      userId: userId || user.id,
      typeId: selectedDrinkType,
      timestamp: new Date().toISOString(),
      location: location ? { name: location } : undefined,
    });
    
    setOpen(false);
    setSelectedDrinkType("");
    setLocation("");
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-app-purple hover:bg-app-dark-blue">
          <Plus className="h-5 w-5 mr-2" />
          Add Drink
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a New Drink</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Drink Type</label>
            <div className="grid grid-cols-3 gap-2">
              {allDrinkTypes.map((type) => (
                <button
                  key={type.id}
                  className={`p-3 flex flex-col items-center justify-center rounded-lg border transition-colors ${
                    selectedDrinkType === type.id
                      ? "border-app-purple bg-purple-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => setSelectedDrinkType(type.id)}
                >
                  <span className="text-3xl mb-1">{type.icon}</span>
                  <span className="text-sm">{type.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Location (optional)</label>
            <input
              type="text"
              placeholder="Enter location"
              className="w-full p-2 border rounded"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={handleAddDrink} 
            disabled={!selectedDrinkType}
            className="bg-app-purple hover:bg-app-dark-blue"
          >
            Add Drink
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddDrinkForm;
