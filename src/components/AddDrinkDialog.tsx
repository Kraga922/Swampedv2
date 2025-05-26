
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface AddDrinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableUsers: any[];
  allDrinkTypes: any[];
  selectedUserId: string;
  setSelectedUserId: (id: string) => void;
  selectedDrinkType: string;
  setSelectedDrinkType: (type: string) => void;
  onAddDrink: () => void;
  location: any;
  loading: boolean;
  error: string | null;
  getCurrentLocation: () => void;
}

const AddDrinkDialog = ({
  open,
  onOpenChange,
  availableUsers,
  allDrinkTypes,
  selectedUserId,
  setSelectedUserId,
  selectedDrinkType,
  setSelectedDrinkType,
  onAddDrink,
  location,
  loading,
  error,
  getCurrentLocation
}: AddDrinkDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a Drink</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Who is drinking?</label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a person" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        {user.avatar ? (
                          <AvatarImage src={user.avatar} alt={user.name} />
                        ) : (
                          <AvatarFallback className="bg-app-purple text-white text-xs">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span>{user.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Drink Type</label>
            <Select value={selectedDrinkType} onValueChange={setSelectedDrinkType}>
              <SelectTrigger>
                <SelectValue placeholder="Select a drink" />
              </SelectTrigger>
              <SelectContent>
                {allDrinkTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <span className="flex items-center">
                      <span className="mr-2">{type.icon}</span>
                      <span>{type.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <div className="flex items-center p-3 bg-gray-50 rounded-md">
              <User className="h-5 w-5 text-gray-500 mr-2" />
              {loading ? (
                <p className="text-gray-500">Getting your location...</p>
              ) : error ? (
                <p className="text-red-500 text-sm">{error}</p>
              ) : location ? (
                <p className="text-sm">{location.name}</p>
              ) : (
                <p className="text-gray-500">No location data</p>
              )}
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              className="w-full mt-2"
              onClick={getCurrentLocation}
              disabled={loading}
            >
              <User className="h-4 w-4 mr-2" />
              {loading ? 'Getting location...' : 'Update location'}
            </Button>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onAddDrink}>
            Add Drink
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddDrinkDialog;
