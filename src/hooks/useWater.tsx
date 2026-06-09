import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const API_BASE = import.meta.env.PROD
  ? (import.meta.env.VITE_API_BASE_URL && !import.meta.env.VITE_API_BASE_URL.includes('localhost') ? import.meta.env.VITE_API_BASE_URL : '')
  : (import.meta.env.VITE_API_BASE_URL || '');

type WaterEntry = {
  id: string;
  date: string;
  amount: number; // в літрах
  time: string;
};

type WaterContextValue = {
  todayWater: number;
  waterGoal: number;
  entries: WaterEntry[];
  addWater: (amount: number) => void;
  removeWater: (id: string) => void;
  setWaterGoal: (goal: number) => void;
  getWaterForDate: (date: Date) => number;
};

const WaterContext = createContext<WaterContextValue | undefined>(undefined);

const storageKeyForToday = (userId?: string) => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `omomo_water_${userId || 'guest'}_${y}-${m}-${day}`;
};

const getWaterGoalKey = (userId?: string) => `omomo_water_goal_${userId || 'guest'}`;

export function WaterProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<WaterEntry[]>([]);
  const [waterGoal, setWaterGoalState] = useState<number>(2.0);
  const { user, isAuthenticated } = useAuth();

  // Завантаження даних з API
  useEffect(() => {
    if (!isAuthenticated) {
      setEntries([]);
      setWaterGoalState(2.0);
      return;
    }

    // Load from database
    const token = localStorage.getItem('omomo_auth_token');
    if (token) {
      const today = new Date().toISOString().split('T')[0];
      fetch(`${API_BASE}/api/water?date=${today}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.waterLogs) {
          setEntries(data.waterLogs.map((w: any) => ({
            id: w._id,
            date: w.date,
            amount: w.amount,
            time: w.time
          })));
        }
      })
      .catch(console.error);

      const savedGoal = localStorage.getItem(getWaterGoalKey(user?.id));
      if (savedGoal) {
        setWaterGoalState(parseFloat(savedGoal));
      } else {
        setWaterGoalState(2.0);
      }
    }
  }, [isAuthenticated, user?.id]);

  // Local Storage syncing is removed, relying strictly on DB

  const todayWater = useMemo(() => {
    return entries.reduce((sum, entry) => sum + entry.amount, 0);
  }, [entries]);

  // Sync to backend daily stats
  useEffect(() => {
    const token = localStorage.getItem('omomo_auth_token');
    if (token && isAuthenticated) {
      const today = new Date().toISOString().split('T')[0];
      fetch(`${API_BASE}/api/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ date: today, water: todayWater })
      }).catch(console.error);
    }
  }, [todayWater, isAuthenticated]);

  const addWater = (amount: number) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

    const token = localStorage.getItem('omomo_auth_token');
    if (isAuthenticated && token) {
      fetch(`${API_BASE}/api/water`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: dateStr,
          amount,
          time: timeStr
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.waterLog) {
          setEntries((prev) => [...prev, {
            id: data.waterLog._id,
            date: dateStr,
            amount,
            time: timeStr
          }]);
        }
      })
      .catch(console.error);
    } else {
      const entry: WaterEntry = {
        id: crypto.randomUUID(),
        date: dateStr,
        amount,
        time: timeStr,
      };
      setEntries((prev) => [...prev, entry]);
    }
  };

  const removeWater = (id: string) => {
    const token = localStorage.getItem('omomo_auth_token');
    if (isAuthenticated && token) {
      fetch(`${API_BASE}/api/water/${id}`, {
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

  const setWaterGoal = (goal: number) => {
    setWaterGoalState(goal);
    try {
      localStorage.setItem(getWaterGoalKey(user?.id), goal.toString());
    } catch {}
  };

  const getWaterForDate = (date: Date) => {
    // В ідеалі повинно братися з бекенду (api/stats history). 
    // Наразі повертаємо 0 для минулих днів, які не в поточному стані.
    return 0;
  };

  const value: WaterContextValue = useMemo(
    () => ({
      todayWater,
      waterGoal,
      entries,
      addWater,
      removeWater,
      setWaterGoal,
      getWaterForDate,
    }),
    [todayWater, waterGoal, entries]
  );

  return <WaterContext.Provider value={value}>{children}</WaterContext.Provider>;
}

export function useWater() {
  const ctx = useContext(WaterContext);
  if (!ctx) throw new Error("useWater must be used within WaterProvider");
  return ctx;
}

