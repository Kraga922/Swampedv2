
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin, Camera, Users } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle, Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

const NightDetails = () => {
  const { nightId } = useParams<{ nightId: string }>();
  const { pastNights, activeNight, getUserById } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Find the night by ID from past nights or active night
  const night = pastNights.find(n => n.id === nightId) || 
                (activeNight?.id === nightId ? activeNight : null);
                
  const [selectedTab, setSelectedTab] = useState("timeline");
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  
  // Mock photos data (in a real app, this would come from Supabase)
  const [photos, setPhotos] = useState([
    { id: "p1", url: "https://images.unsplash.com/photo-1581824043583-6904b080a19c?auto=format&fit=crop&q=80&w=300&h=300", timestamp: "2023-05-09T22:30:00Z", userId: "u1", likes: 3 },
    { id: "p2", url: "https://images.unsplash.com/photo-1575444758702-4a6b9222336e?auto=format&fit=crop&q=80&w=300&h=300", timestamp: "2023-05-09T23:15:00Z", userId: "u2", likes: 5 },
    { id: "p3", url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=300&h=300", timestamp: "2023-05-10T00:45:00Z", userId: "u1", likes: 2 },
  ]);
  
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  
  if (!night) {
    return (
      <Layout title="Night Not Found">
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-3">Night not found</h2>
          <p className="text-gray-500 mb-6">The night you're looking for doesn't exist or has been deleted</p>
          <Button 
            onClick={() => navigate("/")}
            className="bg-app-purple hover:bg-app-dark-blue"
          >
            Go to Home
          </Button>
        </div>
      </Layout>
    );
  }
  
  const formattedDate = format(new Date(night.date), "EEEE, MMMM d, yyyy");
  const startTime = format(new Date(night.startTime), "h:mm a");
  const endTime = night.endTime ? format(new Date(night.endTime), "h:mm a") : "Ongoing";
  
  const handleTakePhoto = () => {
    setShowPhotoUpload(true);
  };
  
  const handleUploadPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // In a real app, this would upload to Supabase storage
    const reader = new FileReader();
    reader.onload = (e) => {
      const newPhoto = {
        id: `p${photos.length + 1}`,
        url: e.target?.result as string,
        timestamp: new Date().toISOString(),
        userId: "u1", // Current user
        likes: 0
      };
      
      setPhotos([newPhoto, ...photos]);
      setShowPhotoUpload(false);
      
      toast({
        title: "Photo added",
        description: "Your photo has been added to the gallery"
      });
    };
    
    reader.readAsDataURL(file);
  };
  
  const renderSelectedPhoto = () => {
    if (!selectedPhoto) return null;
    
    const photo = photos.find(p => p.id === selectedPhoto);
    if (!photo) return null;
    
    return (
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Photo Detail</DialogTitle>
          </DialogHeader>
          
          <div className="flex justify-center p-2">
            <img 
              src={photo.url} 
              alt="Selected photo" 
              className="max-w-full max-h-[60vh] object-contain rounded-md"
            />
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <div className="text-sm text-gray-500">
              {format(new Date(photo.timestamp), "MMM d, yyyy h:mm a")}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedPhoto(null)}>
                Close
              </Button>
              <Button size="sm" className="bg-app-purple hover:bg-app-dark-blue">
                Share
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <Layout title={`${night.group.name} Night`}>
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-xl">{night.group.name}</h2>
            {night.isActive && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formattedDate}</span>
            </div>
            
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span>{startTime} - {endTime}</span>
            </div>
            
            <div className="flex items-center text-gray-600">
              <Users className="h-4 w-4 mr-2" />
              <span>{night.group.members.length} members</span>
            </div>
            
            {night.drinks.length > 0 && night.drinks[0].location && (
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{night.drinks[0].location.name}</span>
              </div>
            )}
          </div>
        </div>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
          </TabsList>
          
          <TabsContent value="timeline">
            <div className="space-y-4">
              {night.drinks.length > 0 ? (
                night.drinks.map((drink, index) => {
                  const drinkUser = getUserById(drink.userId);
                  return (
                    <div key={drink.id} className="bg-white p-4 rounded-lg shadow-sm border">
                      <div className="flex items-center mb-3">
                        <Avatar className="h-8 w-8">
                          {drinkUser?.avatar ? (
                            <AvatarImage src={drinkUser.avatar} alt={drinkUser.name} />
                          ) : (
                            <AvatarFallback className="bg-app-purple text-white">
                              {drinkUser?.name.charAt(0).toUpperCase() || '?'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="ml-2">
                          <p className="font-medium">{drinkUser?.name || 'Unknown User'}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(drink.timestamp), "h:mm a")}
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-gray-700">
                        Added a drink {drink.location && `at ${drink.location.name}`}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-center py-4 text-gray-500">No drinks recorded for this night yet</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="members">
            <div className="space-y-4">
              {night.group.members.map((member) => (
                <div key={member.id} className="bg-white p-4 rounded-lg shadow-sm border flex items-center">
                  <Avatar className="h-10 w-10">
                    {member.avatar ? (
                      <AvatarImage src={member.avatar} alt={member.name} />
                    ) : (
                      <AvatarFallback className="bg-app-purple text-white">
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="ml-3">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-500">
                      {member.isAdmin ? "Admin" : "Member"}
                      {member.isDesignatedDriver && " • Designated Driver"}
                    </p>
                  </div>
                  
                  <div className="ml-auto text-right">
                    <p className="font-medium">
                      {night.drinks.filter(d => d.userId === member.id).length}
                    </p>
                    <p className="text-sm text-gray-500">drinks</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="gallery">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="font-medium">{photos.length} Photos</h3>
              <Button 
                onClick={handleTakePhoto}
                className="bg-app-purple hover:bg-app-dark-blue"
                size="sm"
              >
                <Camera className="h-4 w-4 mr-2" />
                Add Photo
              </Button>
            </div>
            
            {photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {photos.map(photo => (
                  <Card 
                    key={photo.id} 
                    className="overflow-hidden cursor-pointer"
                    onClick={() => setSelectedPhoto(photo.id)}
                  >
                    <CardContent className="p-0">
                      <div className="aspect-square relative">
                        <img 
                          src={photo.url} 
                          alt="Night photo" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                          <p className="text-xs text-white">
                            {format(new Date(photo.timestamp), "h:mm a")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Camera className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">No photos for this night yet</p>
                <Button 
                  onClick={handleTakePhoto}
                  className="mt-4 bg-app-purple hover:bg-app-dark-blue"
                  size="sm"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Add First Photo
                </Button>
              </div>
            )}
            
            {renderSelectedPhoto()}
            
            {/* Photo upload dialog */}
            <Dialog open={showPhotoUpload} onOpenChange={setShowPhotoUpload}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a Photo</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <p className="text-sm text-gray-500">
                    Upload a photo from your night with {night.group.name}
                  </p>
                  
                  <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
                    <Camera className="h-10 w-10 text-gray-400 mb-3" />
                    <p className="text-sm text-gray-500 mb-2">
                      Click to upload or take a photo
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleUploadPhoto}
                    />
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => setShowPhotoUpload(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default NightDetails;
