import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAchievements } from "@/hooks/useAchievements";
import { useAuth } from "@/hooks/useAuth";

export type DailyEntry = {
  id: string;
  type: "meal" | "product";
  name: string;
  time?: string;
  mealType?: "breakfast" | "lunch" | "dinner" | "snack";
  foodId?: string;
  grams?: number;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
};

type DailyContextValue = {
  entries: DailyEntry[];
  totals: { 
    calories: number; 
    protein: number; 
    fats: number; 
    carbs: number;
    steps: number;
    heartRate: number;
    sleepHours: number;
  };
  streakDays: number;
  addEntry: (entry: Omit<DailyEntry, "id">) => void;
  updateEntry: (id: string, updates: Partial<Omit<DailyEntry, "id">>) => void;
  removeEntry: (id: string) => void;
  clearDay: () => void;
  updateStats: (updates: Partial<{ steps: number; heartRate: number; sleepHours: number }>) => void;
};

const DailyContext = createContext<DailyContextValue | undefined>(undefined);

const storageKeyForToday = (userId?: string) => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `omomo_daily_${userId || "guest"}_${y}-${m}-${day}`;
};

export function DailyProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [stats, setStats] = useState({ steps: 0, heartRate: 0, sleepHours: 0 });
  const { earn, has } = useAchievements();
  const { user, isAuthenticated } = useAuth();
  const [backendCalories, setBackendCalories] = useState<number>(0);

  const currentStorageKey = useMemo(() => storageKeyForToday(user?.id), [user?.id]);

  // Load from local storage and backend on init or user change
  useEffect(() => {
    if (!isAuthenticated) {
      setEntries([]);
      setStats({ steps: 0, heartRate: 0, sleepHours: 0 });
      setBackendCalories(0);
      return;
    }

    try {
      const raw = localStorage.getItem(currentStorageKey);
      if (raw) setEntries(JSON.parse(raw));
      else setEntries([]);

      const rawStats = localStorage.getItem(`${currentStorageKey}_stats`);
      if (rawStats) setStats(JSON.parse(rawStats));
    } catch {}

    const token = localStorage.getItem('omomo_auth_token');
    if (token) {
      fetch('/api/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.dailyStat) {
          setBackendCalories(data.dailyStat.calories || 0);
          setStats({
            steps: data.dailyStat.steps || 0,
            heartRate: data.dailyStat.heartRate || 0,
            sleepHours: data.dailyStat.sleepHours || 0
          });
        }
      })
      .catch(console.error);
    }
  }, [isAuthenticated, user?.id, currentStorageKey]);

  useEffect(() => {
    if (isAuthenticated) {
      try {
        localStorage.setItem(currentStorageKey, JSON.stringify(entries));
        localStorage.setItem(`${currentStorageKey}_stats`, JSON.stringify(stats));
      } catch {}
    }
  }, [entries, stats, isAuthenticated, currentStorageKey]);

  const addEntry: DailyContextValue["addEntry"] = (entry) => {
    setEntries((prev) => [
      {
        id: crypto.randomUUID(),
        ...entry,
      },
      ...prev,
    ]);
  };

  const clearDay = () => setEntries([]);

  const updateEntry: DailyContextValue["updateEntry"] = (id, updates) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const removeEntry: DailyContextValue["removeEntry"] = (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const updateStats = (updates: Partial<{ steps: number; heartRate: number; sleepHours: number }>) => {
    setStats(prev => ({ ...prev, ...updates }));
  };

  const totals = useMemo(() => {
    const calcTotals = entries.reduce(
      (acc, e) => ({
        calories: acc.calories + (e.calories || 0),
        protein: acc.protein + (e.protein || 0),
        fats: acc.fats + (e.fats || 0),
        carbs: acc.carbs + (e.carbs || 0),
      }),
      { calories: 0, protein: 0, fats: 0, carbs: 0 },
    );
    
    // Merge with backend calories if entries are completely missing locally but exist on backend
    if (entries.length === 0 && backendCalories > 0) {
      calcTotals.calories = backendCalories;
    }
    
    return {
      ...calcTotals,
      steps: stats.steps,
      heartRate: stats.heartRate,
      sleepHours: stats.sleepHours
    };
  }, [entries, backendCalories, stats]);
  
  // Sync totals and stats to backend when changed
  useEffect(() => {
    const token = localStorage.getItem('omomo_auth_token');
    if (token && isAuthenticated) {
      const today = new Date().toISOString().split('T')[0];
      fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          date: today,
          calories: totals.calories,
          steps: stats.steps,
          heartRate: stats.heartRate,
          sleepHours: stats.sleepHours
        })
      }).catch(console.error);
    }
  }, [totals.calories, stats, isAuthenticated]);

  // Розрахунок streak days (днів підряд з додаванням їжі)
  const streakDays = useMemo(() => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let streak = 0;
      let checkDate = new Date(today);
      
      // Перевіряємо дні назад, поки знаходимо записи
      while (true) {
        const y = checkDate.getFullYear();
        const m = String(checkDate.getMonth() + 1).padStart(2, "0");
        const day = String(checkDate.getDate()).padStart(2, "0");
        const key = `omomo_daily_${user?.id || "guest"}_${y}-${m}-${day}`;
        
        const raw = localStorage.getItem(key);
        if (raw) {
          const dayEntries: DailyEntry[] = JSON.parse(raw);
          if (dayEntries.length > 0) {
            streak++;
            // Переходимо на попередній день
            checkDate.setDate(checkDate.getDate() - 1);
            checkDate.setHours(0, 0, 0, 0);
          } else {
            break;
          }
        } else {
          // Якщо перевіряємо сьогодні і немає записів - streak = 0
          if (checkDate.getTime() === today.getTime()) {
            streak = 0;
          }
          break;
        }
        
        // Захист від нескінченного циклу
        if (streak > 365) break;
      }
      
      return streak;
    } catch {
      return 0;
    }
  }, [entries, user?.id]);

  useEffect(() => {
    if (!has("five_meals") && entries.length >= 5) {
      earn("five_meals");
    }
  }, [entries, earn, has]);

  const value: DailyContextValue = useMemo(
    () => ({ entries, totals, streakDays, addEntry, updateEntry, removeEntry, clearDay, updateStats }),
    [entries, totals, streakDays],
  );

  return <DailyContext.Provider value={value}>{children}</DailyContext.Provider>;
}


export function useDaily() {
  const ctx = useContext(DailyContext);
  if (!ctx) throw new Error("useDaily must be used within DailyProvider");
  return ctx;
}


