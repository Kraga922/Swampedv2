
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";

import Index from "./pages/Index";
import CurrentNight from "./pages/CurrentNight";
import Groups from "./pages/Groups";
import Location from "./pages/Location";
import Health from "./pages/Health";
import NightDetails from "./pages/NightDetails";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Friends from "./pages/Friends";
import Venues from "./pages/Venues";
import Gallery from "./pages/Gallery";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Index />} />
            <Route path="/current" element={<CurrentNight />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/location" element={<Location />} />
            <Route path="/health" element={<Health />} />
            <Route path="/night/:nightId" element={<NightDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/venues" element={<Venues />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/night/:nightId/gallery" element={<Gallery />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
