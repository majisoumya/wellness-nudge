import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { useWellnessTracker } from "@/hooks/use-wellness-tracker";
import Index from "./pages/Index";
import AuthPage from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import TimerPage from "./pages/TimerPage";
import WellnessPage from "./pages/WellnessPage";
import HistoryPage from "./pages/HistoryPage";
import PostureReminder from "./pages/PostureReminder";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Helper component to initialize notifications hook and handle route protection
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  useNotifications(); // Mounts the websocket listener globally when logged in
  useWellnessTracker(); // Mounts the session duration tracker globally
  return <>{children}</>;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  
  if (session === undefined) return <div className="min-h-screen flex items-center justify-center">Loading...</div>; // Still checking
  if (!session) return <Navigate to="/login" replace />; // Not logged in
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<AuthPage />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/timer" element={<ProtectedRoute><TimerPage /></ProtectedRoute>} />
                <Route path="/wellness" element={<ProtectedRoute><WellnessPage /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                <Route path="/posture" element={<ProtectedRoute><PostureReminder /></ProtectedRoute>} />
                <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
