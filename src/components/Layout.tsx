
import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, User, Calendar, Clock, Beer, MapPin, Camera, Settings, Users, LogIn, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";

interface LayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
  title?: string;
  rightAction?: ReactNode;
}

const Layout = ({ 
  children, 
  showNavigation = true, 
  title, 
  rightAction 
}: LayoutProps) => {
  const { user, userNotifications, activeNight } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  
  const unreadNotifications = userNotifications.filter((notif) => !notif.read);
  
  const navItems = [
    {
      name: "Past Nights",
      icon: <Calendar className="h-6 w-6" />,
      path: "/",
      active: location.pathname === "/",
    },
    {
      name: "Current Night",
      icon: <Clock className="h-6 w-6" />,
      path: "/current",
      active: location.pathname === "/current",
      disabled: !activeNight,
    },
    {
      name: "Map",
      icon: <Map className="h-6 w-6" />,
      path: "/location",
      active: location.pathname === "/location",
    },
    {
      name: "Friends",
      icon: <Users className="h-6 w-6" />,
      path: "/friends",
      active: location.pathname === "/friends",
    },
    {
      name: "Health",
      icon: <Beer className="h-6 w-6" />,
      path: "/health",
      active: location.pathname === "/health",
    },
  ];
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10 safe-area-top shadow-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            {title ? (
              <h1 className="text-xl font-bold">{title}</h1>
            ) : (
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gradient">Swamped</h1>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />

            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="rounded-full"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-app-red text-white">
                    {unreadNotifications.length}
                  </Badge>
                )}
              </Button>
              
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-card rounded-lg shadow-lg overflow-hidden z-20 border animate-in fade-in slide-in">
                  <div className="p-3 border-b">
                    <h3 className="font-medium">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {userNotifications.length > 0 ? (
                      userNotifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`p-3 border-b ${notification.read ? 'bg-card' : 'bg-accent/30'}`}
                          onClick={() => navigate(`/notifications/${notification.id}`)}
                        >
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground/80 mt-1">
                            {new Date(notification.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        No notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              >
                <Avatar className="h-8 w-8">
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Button>
              
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-card rounded-lg shadow-lg overflow-hidden z-20 border animate-in fade-in slide-in">
                  <div className="p-3 border-b">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10">
                        {user.avatar ? (
                          <AvatarImage src={user.avatar} alt={user.name} />
                        ) : (
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="ml-3">
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-1">
                    <button 
                      className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-accent"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate("/profile");
                      }}
                    >
                      <User className="h-4 w-4 mr-3" />
                      Profile
                    </button>
                    
                    <button 
                      className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-accent"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate("/friends");
                      }}
                    >
                      <Users className="h-4 w-4 mr-3" />
                      Friends
                    </button>
                    
                    <button 
                      className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-accent"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate("/gallery");
                      }}
                    >
                      <Camera className="h-4 w-4 mr-3" />
                      Gallery
                    </button>
                    
                    <button 
                      className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-accent"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate("/settings");
                      }}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </button>
                    
                    <div className="border-t my-1"></div>
                    
                    <button 
                      className="flex items-center w-full px-4 py-2 text-sm text-left text-destructive hover:bg-accent"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate("/login");
                      }}
                    >
                      <LogIn className="h-4 w-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {rightAction || null}
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 container py-4">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      {showNavigation && (
        <nav className="sticky bottom-0 bg-card border-t z-10 safe-area-bottom shadow-[0_-1px_2px_rgba(0,0,0,0.05)]">
          <div className="flex justify-around items-center">
            {navItems.map((item) => (
              <button
                key={item.name}
                className={`flex flex-col items-center justify-center py-2 px-4 ${
                  item.active 
                    ? "text-primary" 
                    : item.disabled
                      ? "text-muted-foreground/30 pointer-events-none"
                      : "text-muted-foreground"
                }`}
                onClick={() => navigate(item.path)}
                disabled={item.disabled}
              >
                {item.icon}
                <span className="text-xs mt-1 font-medium">{item.name}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
};

export default Layout;
