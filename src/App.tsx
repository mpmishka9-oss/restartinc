import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AppProvider } from "@/context/AppContext";
import { useProfile } from "@/hooks/useProfile";
import AuthScreen from "./components/AuthScreen";
import SplashScreen from "./pages/SplashScreen";
import OnboardingFlow from "./pages/OnboardingFlow";
import HomeScreen from "./pages/HomeScreen";
import JourneyScreen from "./pages/JourneyScreen";
import CheckInScreen from "./pages/CheckInScreen";
import PracticesScreen from "./pages/PracticesScreen";
import ProfileScreen from "./pages/ProfileScreen";
import CommunityScreen from "./pages/CommunityScreen";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import ConsentForm from "@/components/ConsentForm";
import DevTestPage from "./pages/DevTestPage";
import AdminScreen from "./pages/AdminScreen";
import DemoBanner from "@/components/DemoBanner";
import DoshaQuizScreen from "./pages/DoshaQuizScreen";
import CompletionScreen from "./pages/CompletionScreen";

 import Terms from "./pages/Terms";
 import Privacy from "./pages/Privacy";
 import Refund from "./pages/Refund";
 
const queryClient = new QueryClient();

const Gate = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  const { profile, loading: pl } = useProfile();
  if (loading || pl) return <div className="phone-frame min-h-screen flex items-center justify-center"><div className="dot-loader"><span/><span/><span/></div></div>;
  if (!user) return <AuthScreen />;
  if (!profile?.onboarding_completed) return <Navigate to="/" replace />;
  return children;
};

const Root = () => {
  const { user, loading } = useAuth();
  const { profile, loading: pl } = useProfile();
  if (loading || pl) return <div className="phone-frame min-h-screen flex items-center justify-center"><div className="dot-loader"><span/><span/><span/></div></div>;
  if (!user) return <AuthScreen />;
  if (profile?.onboarding_completed) return <Navigate to="/home" replace />;
  return <SplashScreen />;
};

const RoutedApp = () => {
  const loc = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={loc} key={loc.pathname}>
        <Route path="/" element={<Root />} />
        <Route path="/onboarding" element={<OnboardingFlow />} />
        <Route path="/home" element={<Gate><HomeScreen /></Gate>} />
        <Route path="/journey" element={<Gate><JourneyScreen /></Gate>} />
        <Route path="/completion" element={<Gate><CompletionScreen /></Gate>} />
        <Route path="/checkin" element={<Gate><CheckInScreen /></Gate>} />
        <Route path="/practices" element={<Gate><PracticesScreen /></Gate>} />
        <Route path="/admin" element={<AdminScreen />} />
         <Route path="/terms" element={<Terms />} />
         <Route path="/privacy" element={<Privacy />} />
         <Route path="/refund" element={<Refund />} />
        <Route path="/profile" element={<Gate><ProfileScreen /></Gate>} />
        <Route path="/dosha-quiz" element={<Gate><DoshaQuizScreen /></Gate>} />
        <Route path="/community" element={<Gate><CommunityScreen /></Gate>} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/test-consent" element={<ConsentForm onAccept={() => console.log("Consent accepted (test)")} />} />
        <Route path="/dev-test" element={<DevTestPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <DemoBanner />
            <RoutedApp />
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
