import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

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

  // Завантаження даних з localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      setEntries([]);
      setWaterGoalState(2.0);
      return;
    }
    try {
      const raw = localStorage.getItem(storageKeyForToday(user?.id));
      if (raw) {
        setEntries(JSON.parse(raw));
      } else {
        setEntries([]);
      }

      const savedGoal = localStorage.getItem(getWaterGoalKey(user?.id));
      if (savedGoal) {
        setWaterGoalState(parseFloat(savedGoal));
      } else {
        setWaterGoalState(2.0);
      }
    } catch {}
  }, [isAuthenticated, user?.id]);

  // Збереження даних в localStorage
  useEffect(() => {
    if (isAuthenticated) {
      try {
        localStorage.setItem(storageKeyForToday(user?.id), JSON.stringify(entries));
      } catch {}
    }
  }, [entries, isAuthenticated, user?.id]);

  const todayWater = useMemo(() => {
    return entries.reduce((sum, entry) => sum + entry.amount, 0);
  }, [entries]);

  // Sync to backend
  useEffect(() => {
    const token = localStorage.getItem('omomo_auth_token');
    if (token && isAuthenticated) {
      const today = new Date().toISOString().split('T')[0];
      fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ date: today, water: todayWater })
      }).catch(console.error);
    }
  }, [todayWater, isAuthenticated]);

  const addWater = (amount: number) => {

    const now = new Date();
    const entry: WaterEntry = {
      id: crypto.randomUUID(),
      date: now.toISOString().split('T')[0],
      amount,
      time: now.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
    };
    setEntries((prev) => [...prev, entry]);
  };

  const removeWater = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const setWaterGoal = (goal: number) => {
    setWaterGoalState(goal);
    if (isAuthenticated) {
      try {
        localStorage.setItem(getWaterGoalKey(user?.id), goal.toString());
      } catch {}
    }
  };

  const getWaterForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const key = `omomo_water_${user?.id || 'guest'}_${y}-${m}-${day}`;
    
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const dayEntries: WaterEntry[] = JSON.parse(raw);
        return dayEntries.reduce((sum, entry) => sum + entry.amount, 0);
      }
    } catch {}
    
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

