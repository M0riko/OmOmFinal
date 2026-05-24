import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Check, Apple, Utensils, Target, Sparkles, Shield, Lock } from "lucide-react";
import { toast } from "sonner";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { OnboardingFlow } from "@/components/OnboardingFlow";

export default function AuthPage() {
  const { t } = useI18n();
  const { login, register, completeRegistration, loginWithGoogle, user, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [pendingUserData, setPendingUserData] = useState<any>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Проверяем, нужно ли показать онбординг для уже авторизованного пользователя
  useEffect(() => {
    if (isAuthenticated && user) {
      const isOnboardingComplete = () => {
        try {
          const profileData = localStorage.getItem("omom_profile_extra");
          return !!profileData;
        } catch {
          return false;
        }
      };

      console.log("Auth: User authenticated, checking onboarding status");
      console.log("Auth: User data:", user);
      console.log("Auth: Onboarding complete:", isOnboardingComplete());
      console.log("Auth: Show onboarding state:", showOnboarding);

      if (!isOnboardingComplete()) {
        console.log("Auth: Showing onboarding for authenticated user");
        
        // Проверяем, есть ли данные Google для онбординга
        const googleUserData = localStorage.getItem("omom_google_user_data");
        if (googleUserData) {
          try {
            const googleData = JSON.parse(googleUserData);
            setPendingUserData({ 
              email: googleData.email,
              name: googleData.name,
              avatarUrl: googleData.avatarUrl
            });
            console.log("Auth: Using Google user data for onboarding");
          } catch (error) {
            console.error("Auth: Error parsing Google user data:", error);
            setPendingUserData({ email: user.email });
          }
        } else {
          setPendingUserData({ email: user.email });
        }
        
        setShowOnboarding(true);
      }
    }
  }, [isAuthenticated, user]);

  async function onLogin() {
    setIsLoading(true);
    try {
      await login(email, password);
      try { sessionStorage.setItem("omom_post_login", "/"); } catch {}
    } catch (error: any) {
      if (error.message?.includes("не найден") || error.message?.includes("не существует")) {
        toast.error("Цей email не зареєстровано. Зареєструватися?", {
          action: {
            label: "Реєстрація",
            onClick: () => {
              // Переключиться на вкладку регистрации
              const registerTab = document.querySelector('[value="register"]') as HTMLElement;
              registerTab?.click();
            }
          }
        });
      } else {
        toast.error("Помилка входу. Перевірте дані.");
      }
    }
    setIsLoading(false);
  }

  async function onRegister() {
    if (!email || !password) {
      toast.error("Заповніть всі поля");
      return;
    }

    setIsLoading(true);
    try {
      // Создаем аккаунт с минимальными данными
      await register("", email, password);
      
      // Сохраняем данные для онбординга
      setPendingUserData({ email, password });
      setShowOnboarding(true);
      
      toast.success("Акаунт створено! Давайте налаштуємо профіль.");
    } catch (error: any) {
      if (error.message?.includes("уже существует") || error.message?.includes("already exists")) {
        toast.error("Цей email вже зареєстровано. Увійти в акаунт?", {
          action: {
            label: "Вхід",
            onClick: () => {
              // Переключиться на вкладку входа
              const loginTab = document.querySelector('[value="login"]') as HTMLElement;
              loginTab?.click();
            }
          }
        });
      } else {
        toast.error("Помилка реєстрації. Спробуйте ще раз.");
      }
    }
    setIsLoading(false);
  }

  async function handleGoogleLogin() {
    try {
      setIsLoading(true);
      await loginWithGoogle();
      try { sessionStorage.setItem("omom_post_login", "/"); } catch {}
    } catch (error) {
      console.error("Ошибка при входе через Google:", error);
      const errorMessage = error instanceof Error ? error.message : "Ошибка при входе через Google";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAppleLogin() {
    // В реальном приложении здесь будет интеграция с Apple Sign In
    toast.info("Apple Sign In буде доступний найближчим часом");
  }

  async function handleOnboardingComplete(onboardingData: any) {
    try {
      // Обновляем пользователя с данными из онбординга
      const { 
        name, 
        goal, 
        gender, 
        age, 
        height, 
        weight, 
        calculatedCalories,
        targetWeight,
        workoutDaysPerWeek,
        workoutDuration,
        language,
        theme,
        units,
        notifications,
        reminderTimes
      } = onboardingData;
      
      // Сохраняем данные профиля
      localStorage.setItem("omom_profile_extra", JSON.stringify({
        name,
        goal,
        gender,
        age,
        height,
        weight,
        calculatedCalories,
        targetWeight,
        workoutDaysPerWeek,
        workoutDuration
      }));

      // Сохраняем настройки пользователя
      localStorage.setItem("omomo_user_settings", JSON.stringify({
        language,
        theme,
        units,
        notifications,
        reminderTimes
      }));

      // Очищаем временные данные Google
      localStorage.removeItem("omom_google_user_data");

      // Persist age/weight/height to backend
      const token = localStorage.getItem('omomo_auth_token');
      if (token) {
        fetch('/api/user/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            username: name || user?.email?.split('@')[0],
            age: age || 25,
            weight: weight || 70,
            height: height || 170,
          })
        }).catch(console.error);
      }

      // Обновляем пользователя с финальными данными
      if (user) {
        // Если пользователь уже создан (например, через Google), обновляем его
        const updatedUser = {
          ...user,
          name: name || user.name,
          targets: { 
            calories: calculatedCalories || 2000, 
            protein: Math.round((calculatedCalories || 2000) * 0.25 / 4), 
            fats: Math.round((calculatedCalories || 2000) * 0.25 / 9), 
            carbs: Math.round((calculatedCalories || 2000) * 0.5 / 4) 
          }
        };
        
        // Обновляем пользователя через updateUser
        updateUser(updatedUser);
      } else {
        // Если пользователь не создан, создаем его
        completeRegistration(pendingUserData?.email || email, {
          name,
          calculatedCalories
        });
      }

      console.log("Auth: Onboarding completed, redirecting to home");
      setShowOnboarding(false);
      toast.success("Профіль налаштовано! Ласкаво просимо в OmOm!");
      
      // Принудительно перенаправляем на главную страницу
      try { 
        sessionStorage.setItem("omom_post_login", "/"); 
        console.log("Auth: Set post-login redirect to /");
        // Небольшая задержка для завершения обновления состояния
        setTimeout(() => {
          console.log("Auth: Redirecting to home page");
          navigate("/", { replace: true });
        }, 100);
      } catch {}
    } catch (error) {
      console.error("Ошибка при завершении онбординга:", error);
      toast.error("Помилка збереження профілю");
    }
  }

  function handleOnboardingSkip() {
    // Очищаем временные данные Google
    localStorage.removeItem("omom_google_user_data");
    
    // Создаем пользователя с базовыми данными
    if (user) {
      // Если пользователь уже создан, обновляем его
      updateUser({
        ...user,
        targets: { 
          calories: 2000, 
          protein: 120, 
          fats: 65, 
          carbs: 250 
        }
      });
    } else {
      // Если пользователь не создан, создаем его
      completeRegistration(pendingUserData?.email || email, {
        name: pendingUserData?.name || pendingUserData?.email?.split("@")[0] || "Користувач",
        calculatedCalories: 2000
      });
    }
    
    console.log("Auth: Onboarding skipped, redirecting to home");
    setShowOnboarding(false);
    toast.success("Ласкаво просимо в OmOm! Ви можете налаштувати профіль пізніше.");
    
    // Принудительно перенаправляем на главную страницу
    try { 
      sessionStorage.setItem("omom_post_login", "/"); 
      console.log("Auth: Set post-login redirect to / (skip)");
        // Небольшая задержка для завершения обновления состояния
        setTimeout(() => {
          console.log("Auth: Redirecting to home page (skip)");
          navigate("/", { replace: true });
        }, 100);
    } catch {}
  }

  // Покращена валідація паролю
  const passwordValidation = {
    minLength: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
  };
  
  const passwordInvalid = password.length > 0 && (!passwordValidation.minLength || !passwordValidation.hasNumber || !passwordValidation.hasUppercase);
  const emailInvalid = email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  // Розрахунок сили паролю
  const getPasswordStrength = () => {
    const validations = Object.values(passwordValidation);
    const validCount = validations.filter(Boolean).length;
    return validCount;
  };
  
  const passwordStrength = getPasswordStrength();
  const isPasswordStrong = passwordStrength >= 3;

  // Функция для очистки данных (для тестирования)
  const clearAllData = () => {
    localStorage.removeItem("omom_profile_extra");
    localStorage.removeItem("omom_google_user_data");
    localStorage.removeItem("omomo_auth_user");
    sessionStorage.clear();
    window.location.reload();
  };

  // {t("onboardingActive")}
  if (showOnboarding) {
    return (
      <OnboardingFlow
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
        initialData={pendingUserData}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Мобильный заголовок */}
      <div className="lg:hidden p-4 border-b bg-gradient-to-r from-background to-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
              <img src="/logo.svg" alt="OmOm" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                OmOm
              </h1>
              <p className="text-xs text-muted-foreground">Розумний трекер харчування</p>
            </div>
          </div>
          <button 
            onClick={clearAllData}
            className="text-xs text-muted-foreground hover:text-foreground underline px-2 py-1 transition-colors"
            title="Очистити всі дані (для тестування)"
          >
            Очистити
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center p-4 lg:p-8 min-h-[calc(100vh-80px)] lg:min-h-screen">
        <main className="w-full max-w-md lg:max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Left brand panel - только для десктопа */}
            <Card className="hidden lg:flex p-8 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20 flex-col justify-between relative overflow-hidden">
              {/* Декоративні елементи */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                      <img src="/logo.svg" alt="OmOm" className="w-10 h-10 object-contain" />
                    </div>
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                      OmOm
                    </h1>
                  </div>
                  <button 
                    onClick={clearAllData}
                    className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
                    title="Очистити всі дані (для тестування)"
                  >
                    Очистити дані
                  </button>
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">
                    Твій розумний помічник
                  </h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Створи здорові звички та досягни своїх цілей з нашим інтелектуальним трекером харчування
                  </p>
                  
                  <div className="mt-8 space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-primary/10">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Target className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">Персональні цілі</h3>
                        <p className="text-xs text-muted-foreground">Розумний розрахунок КБЖУ під ваші цілі</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-primary/10">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Utensils className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">План харчування</h3>
                        <p className="text-xs text-muted-foreground">Автоматичне планування страв на тиждень</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-primary/10">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">Швидке додавання</h3>
                        <p className="text-xs text-muted-foreground">Миттєве сканування та додавання продуктів</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative z-10 flex items-center justify-center mt-8">
                <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
                  <img src="/logo.svg" alt="OmOm" className="w-20 h-20 opacity-90" />
                </div>
              </div>
            </Card>

            {/* Right auth panel */}
            <Card className="p-6 lg:p-8 shadow-xl border-0 bg-gradient-to-br from-background to-background/95 backdrop-blur-sm">
              <div className="space-y-6">
                {/* Заголовок з іконкою */}
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto shadow-lg overflow-hidden">
                    <img src="/logo.svg" alt="OmOm" className="w-12 h-12 object-contain" />
                  </div>
                  <h1 className="text-2xl font-bold">Ласкаво просимо!</h1>
                  <p className="text-muted-foreground">
                    Створи акаунт та розпочни свій шлях до здорового життя
                  </p>
                </div>

                <Tabs defaultValue="register" className="w-full">
                  <TabsList className="w-full grid grid-cols-2 h-12 bg-muted/50 p-1">
                    <TabsTrigger 
                      value="login" 
                      className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
                    >
                      Вхід
                    </TabsTrigger>
                    <TabsTrigger 
                      value="register" 
                      className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
                    >
                      Реєстрація
                    </TabsTrigger>
                  </TabsList>

                {/* Login */}
                <TabsContent value="login" className="mt-6 space-y-6">
                  <Button 
                    disabled={isLoading} 
                    variant="outline" 
                    className="w-full gap-3 h-12 text-base font-medium hover:bg-muted/50 transition-all duration-200 border-2 hover:border-primary/20"
                    onClick={handleGoogleLogin}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {isLoading ? "Завантаження..." : "Увійти через Google"}
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-muted-foreground/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-4 text-muted-foreground font-medium">або</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Email</Label>
                      <Input 
                        placeholder="you@example.com" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 text-base border-2 focus:border-primary/50 transition-colors"
                      />
                      {emailInvalid && (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                          <div className="w-1 h-1 bg-destructive rounded-full"></div>
                          Некоректний email
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Пароль</Label>
                      <div className="relative">
                        <Input 
                          placeholder="••••••" 
                          type={showPass ? "text" : "password"} 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-12 text-base pr-12 border-2 focus:border-primary/50 transition-colors"
                        />
                        <button 
                          type="button" 
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors" 
                          onClick={() => setShowPass((v) => !v)}
                        >
                          {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {passwordInvalid && (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                          <div className="w-1 h-1 bg-destructive rounded-full"></div>
                          Мінімум 6 символів
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200" 
                    disabled={isLoading || !email || !password || emailInvalid || passwordInvalid} 
                    onClick={onLogin}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Завантаження...
                      </div>
                    ) : (
                      "Увійти"
                    )}
                  </Button>
                </TabsContent>

                {/* Register */}
                <TabsContent value="register" className="mt-6 space-y-6">
                  <div className="space-y-3">
                    <Button
                      disabled={isLoading}
                      variant="outline"
                      className="w-full gap-3 h-12 text-base font-medium hover:bg-muted/50 transition-all duration-200 border-2 hover:border-primary/20"
                      onClick={handleGoogleLogin}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      {isLoading ? "Завантаження..." : "Зареєструватися через Google"}
                    </Button>

                    <Button
                      disabled={isLoading}
                      variant="outline"
                      className="w-full gap-3 h-12 text-base font-medium hover:bg-muted/50 transition-all duration-200 border-2 hover:border-primary/20"
                      onClick={handleAppleLogin}
                    >
                      <Apple className="w-5 h-5" />
                      {isLoading ? "Завантаження..." : "Зареєструватися через Apple"}
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-muted-foreground/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-4 text-muted-foreground font-medium">або</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-sm font-medium text-foreground">Email</Label>
                      <Input
                        id="register-email"
                        placeholder="you@example.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 text-base border-2 focus:border-primary/50 transition-colors"
                      />
                      {emailInvalid && (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                          <div className="w-1 h-1 bg-destructive rounded-full"></div>
                          Некоректний email
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-sm font-medium text-foreground">Пароль</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          placeholder="••••••"
                          type={showPass ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-12 text-base pr-12 border-2 focus:border-primary/50 transition-colors"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                          onClick={() => setShowPass((v) => !v)}
                        >
                          {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      
                      {/* Покращений індикатор сили паролю */}
                      {password && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Shield className="w-3 h-3" />
                            <span>Надійність паролю:</span>
                            <span className={`font-medium ${
                              passwordStrength === 4 ? 'text-green-600' :
                              passwordStrength === 3 ? 'text-yellow-600' :
                              passwordStrength === 2 ? 'text-orange-600' :
                              'text-red-600'
                            }`}>
                              {passwordStrength === 4 ? 'Відмінно' :
                               passwordStrength === 3 ? 'Добре' :
                               passwordStrength === 2 ? 'Слабко' :
                               'Дуже слабко'}
                            </span>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              <div className={`w-2 h-2 rounded-full ${passwordValidation.minLength ? 'bg-green-500' : 'bg-muted'}`}></div>
                              <span className={passwordValidation.minLength ? 'text-green-600' : 'text-muted-foreground'}>
                                Мінімум 8 символів
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <div className={`w-2 h-2 rounded-full ${passwordValidation.hasNumber ? 'bg-green-500' : 'bg-muted'}`}></div>
                              <span className={passwordValidation.hasNumber ? 'text-green-600' : 'text-muted-foreground'}>
                                Містить цифру
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <div className={`w-2 h-2 rounded-full ${passwordValidation.hasUppercase ? 'bg-green-500' : 'bg-muted'}`}></div>
                              <span className={passwordValidation.hasUppercase ? 'text-green-600' : 'text-muted-foreground'}>
                                Містить велику літеру
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading || !email || !password || emailInvalid || passwordInvalid || !isPasswordStrong}
                    onClick={onRegister}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Створення акаунту...
                      </div>
                    ) : (
                      "Зареєструватися"
                    )}
                  </Button>
                  
                  <div className="text-center space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Реєструючись, ви погоджуєтесь з нашими{" "}
                      <a href="#" className="text-primary hover:text-primary/80 underline font-medium transition-colors">
                        Умовами використання
                      </a>{" "}
                      та{" "}
                      <a href="#" className="text-primary hover:text-primary/80 underline font-medium transition-colors">
                        Політикою конфіденційності
                      </a>
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Lock className="w-3 h-3" />
                      <span>Ваші дані захищені та зашифровані</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}


