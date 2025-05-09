
import { useState } from "react";
import Layout from "@/components/Layout";
import { useApp } from "@/contexts/AppContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, User, Shield, Bell, MapPin } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

const Profile = () => {
  const { user } = useApp();
  const { toast } = useToast();
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email || "");
  
  const [isDesignatedDriver, setIsDesignatedDriver] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationSharingEnabled, setLocationSharingEnabled] = useState(true);
  
  const handleSave = () => {
    // In a real app, this would update the user profile
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully."
    });
  };
  
  return (
    <Layout title="Profile">
      <div className="space-y-6 max-w-md mx-auto">
        <Card className="glass-card border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold text-gradient">Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4">
                <Avatar className="h-28 w-28 ring-4 ring-app-purple/20">
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : (
                    <AvatarFallback className="text-3xl bg-app-purple text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <Button 
                  size="icon" 
                  className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-app-purple hover:bg-app-blue shadow-lg border-2 border-white"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-app-light-text">@{user.username}</p>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-app-light-text">Full Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="border-app-purple/20 focus:border-app-purple focus:ring-app-purple/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-app-light-text">Username</Label>
                <Input 
                  id="username" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)}
                  className="border-app-purple/20 focus:border-app-purple focus:ring-app-purple/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-app-light-text">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  className="border-app-purple/20 focus:border-app-purple focus:ring-app-purple/20"
                />
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={handleSave}
                  className="w-full bg-app-purple hover:bg-app-blue"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold text-gradient">Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-app-purple mt-0.5" />
                  <div>
                    <p className="font-medium">Designated Driver Mode</p>
                    <p className="text-sm text-app-light-text">You won't be able to log drinks</p>
                  </div>
                </div>
                <Switch 
                  checked={isDesignatedDriver} 
                  onCheckedChange={setIsDesignatedDriver} 
                  className="data-[state=checked]:bg-app-purple" 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-app-purple mt-0.5" />
                  <div>
                    <p className="font-medium">Notifications</p>
                    <p className="text-sm text-app-light-text">Push notifications for alerts</p>
                  </div>
                </div>
                <Switch 
                  checked={notificationsEnabled} 
                  onCheckedChange={setNotificationsEnabled} 
                  className="data-[state=checked]:bg-app-purple" 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-app-purple mt-0.5" />
                  <div>
                    <p className="font-medium">Location Sharing</p>
                    <p className="text-sm text-app-light-text">Allow friends to see your location</p>
                  </div>
                </div>
                <Switch 
                  checked={locationSharingEnabled} 
                  onCheckedChange={setLocationSharingEnabled} 
                  className="data-[state=checked]:bg-app-purple" 
                />
              </div>
            </div>
            
            <div className="pt-6">
              <Button 
                variant="outline" 
                className="w-full border-red-400 text-red-500 hover:bg-red-50"
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
