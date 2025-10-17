import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Suspense, lazy } from "react";
import { LoadingScreen } from "./components/LoadingScreen";
import Auth from "./pages/Auth";
import { Layout } from "./components/Layout";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const AITools = lazy(() => import("./pages/AITools"));
const VideoEditor = lazy(() => import("./pages/VideoEditor"));
const PublishInsights = lazy(() => import("./pages/PublishInsights"));
const Monetization = lazy(() => import("./pages/Monetization"));
const Storefront = lazy(() => import("./pages/Storefront"));
const HelpDesk = lazy(() => import("./pages/HelpDesk"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route
                path="/"
                element={
                  isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />
                }
              />
              <Route path="/auth" element={<Auth />} />
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/ai-tools" element={<AITools />} />
                <Route path="/video-editor" element={<VideoEditor />} />
                <Route path="/publish-insights" element={<PublishInsights />} />
                <Route path="/monetization" element={<Monetization />} />
                <Route path="/storefront" element={<Storefront />} />
                <Route path="/help-desk" element={<HelpDesk />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
