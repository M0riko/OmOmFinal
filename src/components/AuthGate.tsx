import { useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Проверяем, завершен ли онбординг (мемоизируем результат)
  const isOnboardingComplete = useMemo(() => {
    return !!user?.onboardingCompleted;
  }, [user, location.pathname]); // Пересчитываем при смене пользователя или пути

  useEffect(() => {
    if (isLoading) return;

    const publicRoutes = ["/auth", "/auth/google/callback", "/terms", "/privacy", "/reset-password", "/verify-email"];
    if (!isAuthenticated && !publicRoutes.includes(location.pathname)) {
      try { sessionStorage.setItem("omom_post_login", location.pathname + location.search); } catch {}
      navigate("/auth", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate, location.pathname]);

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && location.pathname === "/auth") {
      // Если пользователь авторизован, но онбординг не завершен, остаемся на /auth
      if (!isOnboardingComplete) {
        return;
      }
      
      // Если онбординг завершен, перенаправляем на главную
      let target = "/";
      try { target = sessionStorage.getItem("omom_post_login") || "/"; } catch {}
      navigate(target, { replace: true });
    }
  }, [isLoading, isAuthenticated, location.pathname, navigate, isOnboardingComplete]);

  // Дополнительная проверка: если пользователь авторизован, но не завершил онбординг,
  // и находится не на странице /auth, перенаправляем на /auth
  useEffect(() => {
    if (isLoading) return;

    const publicRoutes = ["/auth", "/auth/google/callback", "/terms", "/privacy", "/reset-password", "/verify-email"];
    if (isAuthenticated && !isOnboardingComplete && !publicRoutes.includes(location.pathname)) {
      navigate("/auth", { replace: true });
    }
  }, [isLoading, isAuthenticated, location.pathname, navigate, isOnboardingComplete]);

  // Проверяем изменения в localStorage для онбординга
  useEffect(() => {
    if (isLoading) return;

    const handleStorageChange = () => {
      if (isAuthenticated && isOnboardingComplete && location.pathname === "/auth") {
        console.log("AuthGate: Onboarding completed, redirecting to home");
        let target = "/";
        try { target = sessionStorage.getItem("omom_post_login") || "/"; } catch {}
        navigate(target, { replace: true });
      }
    };

    // Слушаем изменения в localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Также проверяем при каждом рендере
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isLoading, isAuthenticated, location.pathname, navigate, isOnboardingComplete]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground animate-pulse font-medium">Завантаження сесії...</p>
        </div>
      </div>
    );
  }

  return (
    <>{children}</>
  );
}



