import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { useModals } from "@/hooks/useModals";
import { AddItemModal } from "@/components/AddItemModal";
import Index from "./pages/Index";
import Recipes from "./pages/Recipes";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Statistics from "./pages/Statistics";
import AuthPage from "./pages/Auth";
import Fridge from "./pages/Fridge";
import SmartFridge from "./pages/SmartFridge";
import MealPlan from "./pages/MealPlanNew";
import Shopping from "./pages/Shopping";
import Training from "./pages/Training";
import Articles from "./pages/Articles";
import AICoach from "./pages/AICoach";
import Settings from "./pages/Settings";
import GoogleCallback from "./pages/GoogleCallback";
import SpotifyCallback from "./pages/SpotifyCallback";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import { useAuth } from "./hooks/useAuth";
import Trainers from "./pages/Trainers";
import Music from "./pages/Music";
import AdminPage from "./pages/Admin";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

function Protected({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<Error | null>(null);
  if (error) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-bold mb-2">Щось пішло не так</h1>
        <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
        <button className="px-3 py-2 border rounded" onClick={() => window.location.reload()}>Перезавантажити</button>
      </div>
    );
  }
  return (
    <ErrorCatcher onError={setError}>{children}</ErrorCatcher>
  );
}

function ErrorCatcher({ children, onError }: { children: React.ReactNode; onError: (e: Error) => void }) {
  try {
    return <>{children}</>;
  } catch (e: any) {
    onError(e);
    return null;
  }
}

import { SmartFridgeProvider } from "@/hooks/useSmartFridge";
import { ShoppingListProvider } from "@/hooks/useShoppingList";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthGate>
        <AppErrorBoundary>
          <SmartFridgeProvider>
            <ShoppingListProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/auth/google/callback" element={<GoogleCallback />} />
                <Route path="/spotify-callback" element={<SpotifyCallback />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/recipes" element={<Recipes />} />
                <Route path="/fridge" element={<SmartFridge />} />
                <Route path="/meal-plan" element={<MealPlan />} />
                <Route path="/shopping" element={<Shopping />} />
                <Route path="/training" element={<Training />} />
                <Route path="/trainers" element={<Trainers />} />
                <Route path="/music" element={<Music />} />
                <Route path="/articles" element={<Articles />} />
                <Route path="/ai-coach" element={<AICoach />} />
                <Route
                  path="/profile"
                  element={
                    <Protected>
                      <Profile />
                    </Protected>
                  }
                />
                <Route
                  path="/statistics"
                  element={
                    <Protected>
                      <Statistics />
                    </Protected>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <Protected>
                      <Settings />
                    </Protected>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <Protected>
                      <AdminPage />
                    </Protected>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ShoppingListProvider>
          </SmartFridgeProvider>
        </AppErrorBoundary>
        </AuthGate>
        <GlobalModals />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

function GlobalModals() {
  const { addItemOpen, setAddItemOpen, addItemPreset } = useModals();
  return <AddItemModal open={addItemOpen} onOpenChange={setAddItemOpen} presetType={addItemPreset} />;
}
