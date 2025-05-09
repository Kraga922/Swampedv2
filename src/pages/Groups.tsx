
import { useState } from "react";
import Layout from "@/components/Layout";
import GroupCard from "@/components/GroupCard";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, User, UserPlus } from "lucide-react";

const Groups = () => {
  const { userGroups, createGroup } = useApp();
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  
  const handleCreateGroup = () => {
    if (!groupName) return;
    
    createGroup(groupName, [{ 
      id: "u1", 
      name: "Alex Johnson", 
      username: "alex_j",
      avatar: "/avatar.png",
      isAdmin: true,
      isDesignatedDriver: false, 
    }]);
    
    setIsAddingGroup(false);
    setGroupName("");
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
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="e.g., Weekend Crew"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Members</label>
              <div className="bg-gray-50 border rounded p-3">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium">Alex Johnson (You)</p>
                    <p className="text-xs text-gray-500">Group Admin</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full justify-center"
                    disabled
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    <span>Invite Members</span>
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    You can add friends after creating the group
                  </p>
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
