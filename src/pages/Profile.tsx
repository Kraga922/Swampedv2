
import { useState } from "react";
import Layout from "@/components/Layout";
import { useApp } from "@/contexts/AppContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, User } from "lucide-react";

const Profile = () => {
  const { user } = useApp();
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email || "");
  
  const handleSave = () => {
    // In a real app, this would update the user profile
    // For now, just display a success message
    alert("Profile updated successfully!");
  };
  
  return (
    <Layout title="Profile">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : (
                    <AvatarFallback className="text-2xl bg-app-purple text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <Button 
                  size="icon" 
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-app-purple hover:bg-app-dark-blue"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="text-xl font-semibold mt-4">{user.name}</h2>
              <p className="text-gray-500">@{user.username}</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                />
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={handleSave}
                  className="w-full bg-app-purple hover:bg-app-dark-blue"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Designated Driver Mode</p>
                  <p className="text-sm text-gray-500">You won't be able to log drinks</p>
                </div>
                <input type="checkbox" className="h-4 w-4" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notifications</p>
                  <p className="text-sm text-gray-500">Push notifications for alerts</p>
                </div>
                <input type="checkbox" checked className="h-4 w-4" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Location Sharing</p>
                  <p className="text-sm text-gray-500">Allow friends to see your location</p>
                </div>
                <input type="checkbox" checked className="h-4 w-4" />
              </div>
            </div>
            
            <div className="pt-6">
              <Button 
                variant="outline" 
                className="w-full border-red-500 text-red-500 hover:bg-red-50"
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;
