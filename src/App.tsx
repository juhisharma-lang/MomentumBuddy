import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import CheckIn from "./pages/CheckIn";
import WeeklySummary from "./pages/WeeklySummary";
import Settings from "./pages/Settings";
import MilestoneComplete from "./pages/MilestoneComplete";
import NotFound from "./pages/NotFound";
import DemoLauncher from "./pages/DemoLauncher";
import DevModeBar, { useDevMode } from "@/components/DevModeBar";
import DashboardV2Layout from './pages/DashboardV2Layout';
import OnboardingV2 from "./pages/OnboardingV2";
import { Navigate } from 'react-router-dom';
import OnboardingV3 from "./pages/OnboardingV3";
import DashboardV3 from "./pages/DashboardV3";
import HeroScreen from "./pages/HeroScreen";

const queryClient = new QueryClient();

const AppInner = () => {
  const devMode = useDevMode();
  return (
    <BrowserRouter>
      <DevModeBar />
      <Routes>
        <Route path="/" element={<Navigate to="/welcome" replace />} />        <Route path="/welcome" element={<HeroScreen />} />        
        <Route path="/onboarding" element={devMode === 'newui' ? <OnboardingV2 /> : <Onboarding />} />
        <Route path="/dashboard" element={devMode === 'newui' ? <DashboardV2Layout /> : <Dashboard />} />
        <Route path="/checkin" element={<CheckIn />} />
        <Route path="/weekly" element={<WeeklySummary />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/complete" element={<MilestoneComplete />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/onboarding" element={devMode === 'newui' ? <Navigate to="/dashboard" replace /> : <Onboarding />} />
        <Route path="/onboarding-v3" element={<OnboardingV3 />} />
        <Route path="/dashboard" element={devMode === 'newui' ? <DashboardV2Layout /> : <Dashboard />} />
        <Route path="/dashboard-v3" element={<DashboardV3 />} />
        <Route path="/welcome" element={<HeroScreen />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <AppInner />
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;