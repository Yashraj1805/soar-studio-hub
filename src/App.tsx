import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AITools from "./pages/AITools";
import Storefront from "./pages/Storefront";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { Layout } from "./components/Layout";

const queryClient = new QueryClient();

const App = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
              <Route path="/storefront" element={<Storefront />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
