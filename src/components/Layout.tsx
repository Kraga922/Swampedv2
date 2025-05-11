
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Settings } from "lucide-react";
import QuickActions from "./QuickActions";

interface LayoutProps {
  title?: string;
  showBackButton?: boolean;
  children: React.ReactNode;
  rightAction?: React.ReactNode;
}

const Layout = ({ 
  title, 
  showBackButton = false,
  children,
  rightAction
}: LayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50 safe-area-top">
        <div className="container flex h-14 items-center">
          <div className="flex flex-1 items-center">
            {showBackButton ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            ) : (
              <div className="flex items-center mr-2">
                <img 
                  src="/lovable-uploads/218aadd5-f65a-4ca8-a62b-eeed1ef83b9a.png" 
                  alt="Swamped Logo" 
                  className="h-8 w-8 mr-2" 
                />
              </div>
            )}
            {title && <h1 className="text-lg font-medium">{title}</h1>}
          </div>
          
          <div className="flex items-center">
            {rightAction}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/profile")}
              className="ml-2"
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 container py-6 max-w-2xl safe-area-bottom">
        {children}
      </main>
      
      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
};

export default Layout;
