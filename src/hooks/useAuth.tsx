import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.PROD
  ? (import.meta.env.VITE_API_BASE_URL && !import.meta.env.VITE_API_BASE_URL.includes('localhost') ? import.meta.env.VITE_API_BASE_URL : '')
  : (import.meta.env.VITE_API_BASE_URL || '');

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  age?: number;
  weight?: number;
  height?: number;
  role?: 'user' | 'admin';
  isPremium?: boolean;
  onboardingCompleted?: boolean;
  targetWeight?: number;
  calculatedCalories?: number;
  targets?: {
    calories: number;
    protein: number;
    fats: number;
    carbs: number;
  };
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  completeRegistration: (email: string, userData: any) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  activatePremium: () => Promise<void>;
  toggleDevRole: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "omomo_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Validate token and fetch user on load
  useEffect(() => {
    const validateSession = async () => {
      try {
        const token = localStorage.getItem('omomo_auth_token');
        if (token) {
          const res = await fetch(`${API_BASE}/api/user/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (res.ok) {
            const data = await res.json();
            
            // Re-merge with local targets if they exist
            const raw = localStorage.getItem(STORAGE_KEY);
            let localTargets = { calories: 2000, protein: 120, fats: 65, carbs: 250 };
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed.targets) localTargets = parsed.targets;
            }

            setUser({
              id: data.user.id,
              name: data.user.username,
              email: data.user.email,
              age: data.user.age,
              weight: data.user.weight,
              height: data.user.height,
              role: data.user.role,
              isPremium: data.user.isPremium,
              onboardingCompleted: data.user.onboardingCompleted,
              targetWeight: data.user.targetWeight,
              calculatedCalories: data.user.calculatedCalories,
              targets: localTargets
            });
          } else {
            localStorage.removeItem('omomo_auth_token');
            localStorage.removeItem(STORAGE_KEY);
            setUser(null);
          }
        } else {
          localStorage.removeItem(STORAGE_KEY);
          setUser(null);
        }
      } catch (e) {
        console.error("Session validation error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    
    validateSession();
  }, []);

  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, [user]);

  const login = useCallback(async (email: string, password?: string) => {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: password || 'password' })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    
    localStorage.setItem('omomo_auth_token', data.token);
    
    // Attempt to preserve targets if switching users or re-logging
    const raw = localStorage.getItem(STORAGE_KEY);
    let localTargets = { calories: 2000, protein: 120, fats: 65, carbs: 250 };
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.email === data.user.email && parsed.targets) {
        localTargets = parsed.targets;
      }
    }

    setUser({
      id: data.user.id,
      name: data.user.username,
      email: data.user.email,
      age: data.user.age,
      weight: data.user.weight,
      height: data.user.height,
      role: data.user.role,
      isPremium: data.user.isPremium,
      onboardingCompleted: data.user.onboardingCompleted,
      targetWeight: data.user.targetWeight,
      calculatedCalories: data.user.calculatedCalories,
      targets: localTargets
    });
  }, []);

  const register = useCallback(async (name: string, email: string, password?: string) => {
    const res = await fetch(`${API_BASE}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: name || email.split("@")[0], 
        email, 
        password: password || 'password',
        age: 25,
        weight: 70,
        height: 170
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    
    localStorage.setItem('omomo_auth_token', data.token);
    
    setUser({
      id: data.user.id,
      name: data.user.username,
      email: data.user.email,
      age: data.user.age,
      weight: data.user.weight,
      height: data.user.height,
      role: data.user.role,
      isPremium: data.user.isPremium,
      onboardingCompleted: data.user.onboardingCompleted || false,
      targetWeight: data.user.targetWeight,
      calculatedCalories: data.user.calculatedCalories,
      targets: { calories: 2000, protein: 120, fats: 65, carbs: 250 }
    });
  }, []);

  const completeRegistration = useCallback(async (email: string, userData: any) => {
    const { name, calculatedCalories, targetWeight, weight, height, age, goals } = userData;
    
    // Оновлюємо бекенд
    try {
      const token = localStorage.getItem('omomo_auth_token');
      if (token) {
        await fetch(`${API_BASE}/api/user/onboarding`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            username: name,
            calculatedCalories,
            targetWeight,
            weight,
            height,
            age,
            goals
          })
        });
      }
    } catch (e) {
      console.error("Помилка збереження онбордінгу на бекенд:", e);
    }
    
    // This updates the local context properties
    setUser(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        name: name || prev.name,
        onboardingCompleted: true,
        targets: { 
          calories: calculatedCalories || 2000, 
          protein: Math.round((calculatedCalories || 2000) * 0.25 / 4), 
          fats: Math.round((calculatedCalories || 2000) * 0.25 / 9), 
          carbs: Math.round((calculatedCalories || 2000) * 0.5 / 4) 
        }
      };
    });
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        throw new Error("Google OAuth не настроен. Создайте файл .env с VITE_GOOGLE_CLIENT_ID");
      }

      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const scope = "openid email profile";
      const responseType = "code";
      const state = crypto.randomUUID();

      sessionStorage.setItem("google_oauth_state", state);

      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(clientId)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=${responseType}&` +
        `state=${encodeURIComponent(state)}`;

      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error("Ошибка при входе через Google:", error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    // Look up the userId before we forget it
    const userId = user?.id;
    localStorage.removeItem('omomo_auth_token');
    localStorage.removeItem(STORAGE_KEY);
    
    // Clear all user-specific fitness data caches
    if (userId) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(`_${userId}`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    }
    
    // Also clear shared onboarding data
    localStorage.removeItem('omom_profile_extra');
    localStorage.removeItem('omom_google_user_data');
    localStorage.removeItem('omomo_user_settings');
    sessionStorage.clear();
    
    setUser(null);
  }, [user?.id]);

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser((u) => {
      if (!u) {
        return {
          id: updates.id || crypto.randomUUID(),
          name: updates.name || "Пользователь",
          email: updates.email || "",
          avatarUrl: updates.avatarUrl,
          targets: updates.targets || { calories: 2000, protein: 120, fats: 65, carbs: 250 },
        };
      }
      return { ...u, ...updates, targets: { ...u.targets, ...updates.targets } };
    });
  }, []);

  const activatePremium = useCallback(async () => {
    try {
      const token = localStorage.getItem('omomo_auth_token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/user/premium/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(prev => prev ? { ...prev, isPremium: data.user.isPremium } : prev);
      }
    } catch (e) {
      console.error("Premium activation error:", e);
    }
  }, []);

  const toggleDevRole = useCallback(async () => {
    try {
      const token = localStorage.getItem('omomo_auth_token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/user/dev/toggle-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(prev => prev ? { ...prev, role: data.user.role, isPremium: data.user.isPremium } : prev);
      }
    } catch (e) {
      console.error("Dev toggle-role error:", e);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ 
      user, 
      isAuthenticated: !!user, 
      isLoading,
      login, 
      register, 
      completeRegistration, 
      loginWithGoogle, 
      logout, 
      updateUser,
      activatePremium,
      toggleDevRole
    }),
    [user, isLoading, login, register, completeRegistration, loginWithGoogle, logout, updateUser, activatePremium, toggleDevRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


