
import { useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, X, Share, Download, Heart } from "lucide-react";

const Gallery = () => {
  const { nightId } = useParams<{ nightId: string }>();
  const { pastNights, activeNight } = useApp();
  
  // Find the current night
  const currentNight = nightId 
    ? [...pastNights, activeNight].find(night => night?.id === nightId) 
    : activeNight;
  
  // Mock photo data
  const [photos, setPhotos] = useState([
    { id: "p1", url: "https://images.unsplash.com/photo-1581824043583-6904b080a19c?auto=format&fit=crop&q=80&w=300&h=300", timestamp: "2023-05-09T22:30:00Z", userId: "u1", likes: 3 },
    { id: "p2", url: "https://images.unsplash.com/photo-1575444758702-4a6b9222336e?auto=format&fit=crop&q=80&w=300&h=300", timestamp: "2023-05-09T23:15:00Z", userId: "u2", likes: 5 },
    { id: "p3", url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=300&h=300", timestamp: "2023-05-10T00:45:00Z", userId: "u1", likes: 2 },
    { id: "p4", url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=300&h=300", timestamp: "2023-05-10T01:30:00Z", userId: "u3", likes: 7 },
  ]);
  
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  
  const handleUpload = () => {
    // In a real app, this would open the camera and allow uploading
    alert("Camera functionality would open here");
  };
  
  const handleLike = (id: string) => {
    setPhotos(photos.map(photo => 
      photo.id === id ? { ...photo, likes: photo.likes + 1 } : photo
    ));
  };
  
  const renderPhotoDetail = () => {
    if (!selectedPhoto) return null;
    
    const photo = photos.find(p => p.id === selectedPhoto);
    if (!photo) return null;
    
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
        <div className="flex justify-between items-center p-4">
          <h3 className="text-white font-medium">Photo Detail</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/20"
            onClick={() => setSelectedPhoto(null)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4">
          <img 
            src={photo.url} 
            alt="Selected photo" 
            className="max-w-full max-h-full object-contain"
          />
        </div>
        
        <div className="p-4 flex justify-around bg-black/50">
          <Button variant="ghost" className="text-white hover:bg-white/20">
            <Heart className="h-6 w-6 mr-1" />
            <span>{photo.likes}</span>
          </Button>
          <Button variant="ghost" className="text-white hover:bg-white/20">
            <Share className="h-6 w-6" />
          </Button>
          <Button variant="ghost" className="text-white hover:bg-white/20">
            <Download className="h-6 w-6" />
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <Layout title={currentNight ? `${currentNight.group.name} Photos` : "Night Gallery"} rightAction={
      <Button 
        onClick={handleUpload}
        className="bg-app-purple hover:bg-app-dark-blue"
        size="sm"
      >
        <Camera className="h-4 w-4 mr-1" />
        Add Photo
      </Button>
    }>
      {renderPhotoDetail()}
      
      <div className="space-y-6">
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {photos.map(photo => (
              <Card 
                key={photo.id} 
                className="overflow-hidden aspect-square relative"
                onClick={() => setSelectedPhoto(photo.id)}
              >
                <img 
                  src={photo.url} 
                  alt="Night photo" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white">
                      {new Date(photo.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 w-7 p-0 text-white hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(photo.id);
                      }}
                    >
                      <Heart className="h-4 w-4" />
                      <span className="text-xs ml-1">{photo.likes}</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Camera className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-xl font-medium mb-2">No photos yet</h3>
            <p className="text-gray-500 mb-6">Be the first to capture a moment from this night</p>
            <Button 
              onClick={handleUpload}
              className="bg-app-purple hover:bg-app-dark-blue"
            >
              <Camera className="h-5 w-5 mr-2" />
              Take a Photo
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Gallery;
