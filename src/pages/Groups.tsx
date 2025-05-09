
import { useState } from "react";
import Layout from "@/components/Layout";
import GroupCard from "@/components/GroupCard";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, User, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const Groups = () => {
  const { userGroups, createGroup, user } = useApp();
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [showFriendSelector, setShowFriendSelector] = useState(false);
  const { toast } = useToast();
  
  // Mock friends data (in a real app, this would come from the context)
  const [availableFriends, setAvailableFriends] = useState([
    { id: "f1", name: "Alex Johnson", username: "alexj", avatar: null },
    { id: "f2", name: "Sarah Williams", username: "sarahw", avatar: null },
    { id: "f3", name: "Mike Chen", username: "mikec", avatar: null },
    { id: "f4", name: "Taylor Lee", username: "taylorl", avatar: null },
  ]);
  
  const handleCreateGroup = () => {
    if (!groupName) return;
    
    const members = [
      { 
        id: user.id, 
        name: user.name, 
        username: user.username,
        avatar: user.avatar,
        isAdmin: true,
        isDesignatedDriver: false, 
      },
      ...availableFriends.filter(friend => selectedFriends.includes(friend.id)).map(friend => ({
        id: friend.id,
        name: friend.name,
        username: friend.username,
        avatar: friend.avatar,
        isAdmin: false,
        isDesignatedDriver: false,
      }))
    ];
    
    createGroup(groupName, members);
    
    toast({
      title: "Group created",
      description: `"${groupName}" has been created with ${members.length} members.`
    });
    
    setIsAddingGroup(false);
    setGroupName("");
    setSelectedFriends([]);
  };
  
  const handleToggleFriend = (friendId: string) => {
    setSelectedFriends(prev => 
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };
  
  return (
    <Layout
      title="Groups"
      rightAction={
        <Button 
          onClick={() => setIsAddingGroup(true)}
          className="bg-app-purple hover:bg-app-dark-blue"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Group
        </Button>
      }
    >
      <div className="space-y-2 mb-6">
        <h2 className="font-semibold">Your Groups</h2>
        <p className="text-gray-500 text-sm">
          Select a group to start a night or manage members
        </p>
      </div>
      
      <div className="space-y-4">
        {userGroups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
        
        <Button 
          variant="outline" 
          className="w-full py-6 border-dashed flex items-center justify-center gap-2"
          onClick={() => setIsAddingGroup(true)}
        >
          <UserPlus className="h-5 w-5" />
          <span>Create New Group</span>
        </Button>
      </div>
      
      <Dialog open={isAddingGroup} onOpenChange={setIsAddingGroup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Group</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">Group Name</label>
              <Input
                type="text"
                placeholder="e.g., Weekend Crew"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Members</label>
              <div className="bg-gray-50 border rounded p-3">
                {/* Current user (always in group) */}
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    {user.avatar ? (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium">{user.name} (You)</p>
                    <p className="text-xs text-gray-500">Group Admin</p>
                  </div>
                </div>
                
                {/* Selected friends */}
                {selectedFriends.length > 0 && (
                  <div className="mt-2">
                    {selectedFriends.map(friendId => {
                      const friend = availableFriends.find(f => f.id === friendId);
                      if (!friend) return null;
                      
                      return (
                        <div key={friend.id} className="flex items-center mt-2 pl-2 py-1 border-t">
                          <Avatar className="h-7 w-7">
                            {friend.avatar ? (
                              <AvatarImage src={friend.avatar} alt={friend.name} />
                            ) : (
                              <AvatarFallback>{friend.name[0]}</AvatarFallback>
                            )}
                          </Avatar>
                          <div className="ml-2">
                            <p className="text-sm">{friend.name}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="ml-auto h-6 text-red-500"
                            onClick={() => handleToggleFriend(friend.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                <div className="mt-3 pt-3 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full justify-center"
                    onClick={() => setShowFriendSelector(!showFriendSelector)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    <span>{showFriendSelector ? "Hide Friends" : "Add Friends"}</span>
                  </Button>
                  
                  {showFriendSelector && (
                    <div className="mt-2 border rounded max-h-40 overflow-y-auto">
                      {availableFriends.filter(f => !selectedFriends.includes(f.id)).length > 0 ? (
                        availableFriends.filter(f => !selectedFriends.includes(f.id)).map(friend => (
                          <div key={friend.id} className="flex items-center p-2 hover:bg-gray-50 border-b last:border-b-0">
                            <Checkbox 
                              id={`friend-${friend.id}`} 
                              checked={selectedFriends.includes(friend.id)}
                              onCheckedChange={() => handleToggleFriend(friend.id)}
                            />
                            <Avatar className="h-7 w-7 ml-2">
                              {friend.avatar ? (
                                <AvatarImage src={friend.avatar} alt={friend.name} />
                              ) : (
                                <AvatarFallback>{friend.name[0]}</AvatarFallback>
                              )}
                            </Avatar>
                            <label htmlFor={`friend-${friend.id}`} className="ml-2 text-sm cursor-pointer flex-1">
                              {friend.name}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-2 text-sm text-gray-500">All friends added</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleCreateGroup} 
              disabled={!groupName}
              className="w-full bg-app-purple hover:bg-app-dark-blue"
            >
              Create Group
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Groups;
