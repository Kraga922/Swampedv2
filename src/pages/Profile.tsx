
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Camera, User, LogOut } from "lucide-react";
import { User as UserType } from "@/types/models";

const Profile = () => {
  const { session, signOut, getProfile } = useAuth();
  const [profile, setProfile] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  
  useEffect(() => {
    const loadProfile = async () => {
      if (session.user) {
        setLoading(true);
        const userProfile = await getProfile();
        if (userProfile) {
          setProfile(userProfile);
          setName(userProfile.name);
          setUsername(userProfile.username);
          setEmail(userProfile.email || "");
        }
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [session.user]);
  
  const handleSave = async () => {
    if (!profile) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          username,
          email,
        })
        .eq('id', profile.id);
      
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !profile) return;
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${profile.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    try {
      setLoading(true);
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar: publicUrl })
        .eq('id', profile.id);
      
      if (updateError) throw updateError;
      
      // Update local state
      setProfile({
        ...profile,
        avatar: publicUrl,
      });
      
      toast({
        title: "Avatar updated",
        description: "Your avatar has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout title="Profile">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6">Loading...</div>
            ) : (
              <>
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      {profile?.avatar ? (
                        <AvatarImage src={profile.avatar} alt={profile.name} />
                      ) : (
                        <AvatarFallback className="text-2xl bg-app-purple text-white">
                          {profile?.name.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <label 
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-app-purple hover:bg-app-dark-blue flex items-center justify-center cursor-pointer"
                    >
                      <Camera className="h-4 w-4 text-white" />
                      <input 
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleUploadAvatar}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <h2 className="text-xl font-semibold mt-4">{profile?.name}</h2>
                  <p className="text-gray-500">@{profile?.username}</p>
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
                      disabled
                    />
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      onClick={handleSave}
                      className="w-full bg-app-purple hover:bg-app-dark-blue"
                      disabled={loading}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </>
            )}
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
                <input 
                  type="checkbox" 
                  className="h-4 w-4" 
                  checked={profile?.isDesignatedDriver}
                  onChange={async (e) => {
                    if (!profile) return;
                    
                    try {
                      await supabase
                        .from('profiles')
                        .update({ is_designated_driver: e.target.checked })
                        .eq('id', profile.id);
                        
                      setProfile({
                        ...profile,
                        isDesignatedDriver: e.target.checked
                      });
                    } catch (error) {
                      console.error("Error updating driver mode:", error);
                    }
                  }}
                />
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
                onClick={signOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
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
