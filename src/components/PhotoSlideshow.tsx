
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Image } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface PhotoSlideshowProps {
  photos: string[];
  autoPlay?: boolean;
  interval?: number;
}

const PhotoSlideshow = ({ 
  photos, 
  autoPlay = true, 
  interval = 4000 
}: PhotoSlideshowProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Handle automatic slideshow if enabled
  useEffect(() => {
    if (!autoPlay || photos.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
    }, interval);
    
    return () => clearInterval(timer);
  }, [autoPlay, interval, photos.length]);

  // Navigation functions
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex + 1) % photos.length
    );
  };

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 bg-secondary/50 rounded-lg border border-border/50">
        <Image className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground text-sm">No photos available</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg h-48 bg-secondary/20">
      {photos.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40"
            onClick={goToNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}
      
      <div className="relative h-full w-full">
        <img
          src={photos[currentIndex]}
          alt={`Photo ${currentIndex + 1}`}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        />
      </div>
      
      {photos.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {photos.map((_, index) => (
            <button
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
              }`}
              onClick={() => setCurrentIndex(index)}
            ></button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoSlideshow;
