
import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, User, Calendar, Clock, Beer, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";

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
  const { userNotifications, activeNight } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
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
      icon: <User className="h-6 w-6" />,
      path: "/groups",
      active: location.pathname === "/groups",
    },
    {
      name: "Location",
      icon: <MapPin className="h-6 w-6" />,
      path: "/location",
      active: location.pathname === "/location",
    },
    {
      name: "Health",
      icon: <Beer className="h-6 w-6" />,
      path: "/health",
      active: location.pathname === "/health",
    },
  ];
  
  return (
    <div className="min-h-screen flex flex-col bg-app-background">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 safe-area-top">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            {title ? (
              <h1 className="text-xl font-semibold">{title}</h1>
            ) : (
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gradient">SafeNight</h1>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-app-red text-white">
                    {unreadNotifications.length}
                  </Badge>
                )}
              </Button>
              
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg overflow-hidden z-20 border">
                  <div className="p-3 border-b">
                    <h3 className="font-medium">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {userNotifications.length > 0 ? (
                      userNotifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`p-3 border-b ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                          onClick={() => navigate(`/notifications/${notification.id}`)}
                        >
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No notifications
                      </div>
                    )}
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
        <nav className="sticky bottom-0 bg-white border-t z-10 safe-area-bottom">
          <div className="flex justify-around items-center">
            {navItems.map((item) => (
              <button
                key={item.name}
                className={`flex flex-col items-center justify-center py-2 px-4 ${
                  item.active 
                    ? "text-app-purple" 
                    : item.disabled
                      ? "text-gray-300 pointer-events-none"
                      : "text-gray-500"
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
