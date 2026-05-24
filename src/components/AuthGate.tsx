import { useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Проверяем, завершен ли онбординг (мемоизируем результат)
  const isOnboardingComplete = useMemo(() => {
    // 1. Check if user already has profile data in local storage
    const hasLocalProfile = !!localStorage.getItem("omom_profile_extra");
    
    // 2. Check if the user object from backend has profile fields
    // Default values in backend are 25, 70, 170 if not specified during registration.
    // However, if the user has these fields, it means they are already "initialized" in MongoDB.
    const hasBackendProfile = !!(user?.age && user?.weight && user?.height);

    const result = hasLocalProfile || hasBackendProfile;
    console.log("AuthGate: Onboarding status check. Local:", hasLocalProfile, "Backend:", hasBackendProfile, "Final:", result);
    return result;
  }, [user, location.pathname]); // Пересчитываем при смене пользователя или пути

  useEffect(() => {
    if (!isAuthenticated && location.pathname !== "/auth" && location.pathname !== "/auth/google/callback") {
      try { sessionStorage.setItem("omom_post_login", location.pathname + location.search); } catch {}
      navigate("/auth", { replace: true });
    }
  }, [isAuthenticated, navigate, location.pathname]);

  useEffect(() => {
    if (isAuthenticated && location.pathname === "/auth") {
      console.log("AuthGate: User authenticated on /auth, checking onboarding");
      console.log("AuthGate: Onboarding complete:", isOnboardingComplete);
      
      // Если пользователь авторизован, но онбординг не завершен, остаемся на /auth
      if (!isOnboardingComplete) {
        console.log("AuthGate: Staying on /auth for onboarding");
        return;
      }
      
      // Если онбординг завершен, перенаправляем на главную
      console.log("AuthGate: Onboarding complete, redirecting to home");
      let target = "/";
      try { target = sessionStorage.getItem("omom_post_login") || "/"; } catch {}
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate, isOnboardingComplete]);

  // Дополнительная проверка: если пользователь авторизован, но не завершил онбординг,
  // и находится не на странице /auth, перенаправляем на /auth
  useEffect(() => {
    if (isAuthenticated && !isOnboardingComplete && location.pathname !== "/auth") {
      console.log("AuthGate: Redirecting to /auth for onboarding");
      navigate("/auth", { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate, isOnboardingComplete]);

  // Проверяем изменения в localStorage для онбординга
  useEffect(() => {
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
  }, [isAuthenticated, location.pathname, navigate, isOnboardingComplete]);

  return (
    <>{children}</>
  );
}


