import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAchievements } from "@/hooks/useAchievements";
import { useAuth } from "@/hooks/useAuth";

const API_BASE = import.meta.env.PROD
  ? (import.meta.env.VITE_API_BASE_URL && !import.meta.env.VITE_API_BASE_URL.includes('localhost') ? import.meta.env.VITE_API_BASE_URL : '')
  : (import.meta.env.VITE_API_BASE_URL || '');

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
  const [isStatsLoaded, setIsStatsLoaded] = useState(false);

  const currentStorageKey = "omomo_daily_disabled"; // Deprecated local storage key

  // Load from local storage and backend on init or user change
  useEffect(() => {
    if (!isAuthenticated) {
      setEntries([]);
      setStats({ steps: 0, heartRate: 0, sleepHours: 0 });
      setBackendCalories(0);
      return;
    }

    const token = localStorage.getItem('omomo_auth_token');
    if (token) {
      const today = new Date().toISOString().split('T')[0];
      
      // Load meals from database
      fetch(`${API_BASE}/api/meals?date=${today}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.meals) {
          setEntries(data.meals.map((m: any) => ({
            id: m._id,
            type: m.type,
            name: m.name,
            time: m.time,
            mealType: m.mealType,
            foodId: m.foodId,
            grams: m.grams,
            calories: m.calories,
            protein: m.protein,
            fats: m.fats,
            carbs: m.carbs
          })));
        }
      })
      .catch(console.error);
      
      // Load stats from database
      fetch(`${API_BASE}/api/stats?date=${today}`, {
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
        setIsStatsLoaded(true);
      })
      .catch(err => {
        console.error(err);
        setIsStatsLoaded(true);
      });
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    // Local storage sync is disabled in favor of MongoDB
  }, [entries, stats]);

  const addEntry: DailyContextValue["addEntry"] = (entry) => {
    const token = localStorage.getItem('omomo_auth_token');
    if (isAuthenticated && token) {
      const today = new Date().toISOString().split('T')[0];
      fetch(`${API_BASE}/api/meals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: today,
          ...entry
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.meal) {
          setEntries((prev) => [
            {
              id: data.meal._id,
              ...entry,
            },
            ...prev,
          ]);
        }
      })
      .catch(console.error);
    } else {
      setEntries((prev) => [
        {
          id: crypto.randomUUID(),
          ...entry,
        },
        ...prev,
      ]);
    }
  };

  const clearDay = () => {
    setEntries([]);
  };

  const updateEntry: DailyContextValue["updateEntry"] = (id, updates) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const removeEntry: DailyContextValue["removeEntry"] = (id) => {
    const token = localStorage.getItem('omomo_auth_token');
    if (isAuthenticated && token) {
      fetch(`${API_BASE}/api/meals/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEntries((prev) => prev.filter((e) => e.id !== id));
        }
      })
      .catch(console.error);
    } else {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
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
    if (token && isAuthenticated && isStatsLoaded) {
      const today = new Date().toISOString().split('T')[0];
      fetch(`${API_BASE}/api/stats`, {
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
  }, [totals.calories, stats, isAuthenticated, isStatsLoaded]);

  // Розрахунок streak days (днів підряд з додаванням їжі)
  const streakDays = useMemo(() => {
    // В ідеалі це має розраховуватись на бекенді, 
    // але для простоти беремо з історії 
    return entries.length > 0 ? 1 : 0; // Спрощений варіант, повний розрахунок потребує /api/streak
  }, [entries]);

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


