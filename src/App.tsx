import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/components/LanguageProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import FloatingChatbot from "@/components/FloatingChatbot";
import Home from "./pages/Home";
import CropPlanning from "./pages/CropPlanning";
import Weather from "./pages/Weather";
import WeatherForecast from "./pages/WeatherForecast";
import MarketPrices from "./pages/MarketPrices";
import Schemes from "./pages/Schemes";
import Marketplace from "./pages/Marketplace";
import SupplyChain from "./pages/SupplyChain";
import FinanceTracker from "./pages/FinanceTracker";
import DiseaseDetection from "./pages/DiseaseDetection";
import Community from "./pages/Community";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Navigation />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/Auth" element={<Auth />} />
                <Route path="/community" element={<Community />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/crop-planning" element={<ProtectedRoute><CropPlanning /></ProtectedRoute>} />
                <Route path="/weather" element={<ProtectedRoute><WeatherForecast /></ProtectedRoute>} />
                {/* <Route path="/weather-forecast" element={<WeatherForecast />} /> */}
                <Route path="/market-prices" element={<ProtectedRoute><MarketPrices /></ProtectedRoute>} />
                <Route path="/schemes" element={<ProtectedRoute><Schemes /></ProtectedRoute>} />
                <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
                <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
                <Route path="/supply-chain" element={<ProtectedRoute><SupplyChain /></ProtectedRoute>} />
                <Route path="/finance-tracker" element={<ProtectedRoute><FinanceTracker /></ProtectedRoute>} />
                <Route path="/disease-detection" element={<ProtectedRoute><DiseaseDetection /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              {/* Floating Chatbot - appears on all pages */}
              <FloatingChatbot />
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
