
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/current" element={<CurrentNight />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/location" element={<Location />} />
            <Route path="/health" element={<Health />} />
            <Route path="/night/:nightId" element={<NightDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
