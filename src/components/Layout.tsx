
import { ReactNode, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, User, Calendar, Clock, Beer, MapPin, Camera, Settings, Users, LogIn, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";

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
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true' || 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const { toast } = useToast();
  
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
      name: "Groups",
      icon: <Users className="h-6 w-6" />,
      path: "/groups",
      active: location.pathname === "/groups",
    },
    {
      name: "Venues",
      icon: <MapPin className="h-6 w-6" />,
      path: "/venues",
      active: location.pathname === "/venues",
    },
    {
      name: "Health",
      icon: <Beer className="h-6 w-6" />,
      path: "/health",
      active: location.pathname === "/health",
    },
  ];
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);
  
  // Handle dropdown menu closing when clicking outside
  const closeMenus = () => {
    if (notificationsOpen) setNotificationsOpen(false);
    if (profileMenuOpen) setProfileMenuOpen(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast({
      title: !darkMode ? "Dark mode enabled" : "Light mode enabled",
      description: !darkMode ? "Welcome to the night side." : "Brightness restored.",
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background" onClick={closeMenus}>
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10 safe-area-top shadow-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            {title ? (
              <h1 className="text-xl font-semibold">{title}</h1>
            ) : (
              <div className="flex items-center gap-2" onClick={() => navigate('/')}>
                <div className="relative w-8 h-8 animate-float">
                  <img 
                    src="/lovable-uploads/0c5b2aa8-9866-4ca4-a90f-8775e517fd3f.png" 
                    alt="Swamped Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h1 className="text-xl font-bold text-gradient">Swamped</h1>
              </div>
            )}
          </div>
          
          {/* Quick Access Buttons */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full bg-secondary hover:bg-secondary/80"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/location');
              }}
            >
              <MapPin className="h-5 w-5 text-app-purple" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full bg-secondary hover:bg-secondary/80"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/friends');
              }}
            >
              <Users className="h-5 w-5 text-app-purple" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={toggleDarkMode}
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-amber-300" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setNotificationsOpen(!notificationsOpen);
                  if (profileMenuOpen) setProfileMenuOpen(false);
                }}
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-app-red text-white">
                    {unreadNotifications.length}
                  </Badge>
                )}
              </Button>
              
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 glass-card overflow-hidden z-20 shadow-lg" onClick={e => e.stopPropagation()}>
                  <div className="p-3 border-b">
                    <h3 className="font-medium">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {userNotifications.length > 0 ? (
                      userNotifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`p-3 border-b ${notification.read ? 'bg-card/50' : 'bg-app-purple/10 dark:bg-app-purple/20'}`}
                          onClick={() => navigate(`/notifications/${notification.id}`)}
                        >
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
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
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileMenuOpen(!profileMenuOpen);
                  if (notificationsOpen) setNotificationsOpen(false);
                }}
              >
                <Avatar className="h-8 w-8 ring-2 ring-app-purple/20">
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : (
                    <AvatarFallback className="bg-app-purple text-white text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Button>
              
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 glass-card overflow-hidden z-20 shadow-lg" onClick={e => e.stopPropagation()}>
                  <div className="p-3 border-b">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 ring-2 ring-app-purple/20">
                        {user.avatar ? (
                          <AvatarImage src={user.avatar} alt={user.name} />
                        ) : (
                          <AvatarFallback className="bg-app-purple text-white">
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
                      className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-app-purple/10"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate("/profile");
                      }}
                    >
                      <User className="h-4 w-4 mr-3 text-app-purple" />
                      Profile
                    </button>
                    
                    <button 
                      className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-app-purple/10"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate("/friends");
                      }}
                    >
                      <Users className="h-4 w-4 mr-3 text-app-purple" />
                      Friends
                    </button>
                    
                    <button 
                      className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-app-purple/10"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate("/gallery");
                      }}
                    >
                      <Camera className="h-4 w-4 mr-3 text-app-purple" />
                      Gallery
                    </button>
                    
                    <button 
                      className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-app-purple/10"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        // Navigate to settings page
                      }}
                    >
                      <Settings className="h-4 w-4 mr-3 text-app-purple" />
                      Settings
                    </button>
                    
                    <div className="border-t my-1"></div>
                    
                    <button 
                      className="flex items-center w-full px-4 py-2 text-sm text-left text-destructive hover:bg-destructive/10"
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
      <main className="flex-1 container py-6">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      {showNavigation && (
        <nav className="sticky bottom-0 bg-card border-t z-10 safe-area-bottom shadow-[0_-2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.2)]">
          <div className="flex justify-around items-center">
            {navItems.map((item) => (
              <button
                key={item.name}
                className={`flex flex-col items-center justify-center py-2 px-4 ${
                  item.active 
                    ? "text-app-purple" 
                    : item.disabled
                      ? "text-muted-foreground/30 pointer-events-none"
                      : "text-muted-foreground"
                }`}
                onClick={() => navigate(item.path)}
                disabled={item.disabled}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.name}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
};

export default Layout;
