import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const API_BASE = import.meta.env.PROD
  ? (import.meta.env.VITE_API_BASE_URL && !import.meta.env.VITE_API_BASE_URL.includes('localhost') ? import.meta.env.VITE_API_BASE_URL : '')
  : (import.meta.env.VITE_API_BASE_URL || '');

type WeightEntry = {
  id: string;
  date: string;
  weight: number; // в кг
  time: string;
  notes?: string;
};

type WeightContextValue = {
  currentWeight: number | null;
  entries: WeightEntry[];
  addWeight: (weight: number, notes?: string) => void;
  removeWeight: (id: string) => void;
  getWeightForDate: (date: Date) => number | null;
  getWeightHistory: (days?: number) => WeightEntry[];
  getWeightTrend: () => number | null; // різниця в кг за останній тиждень
};

const WeightContext = createContext<WeightContextValue | undefined>(undefined);

const getWeightEntriesKey = (userId?: string) => `omomo_weight_entries_${userId || 'guest'}`;

export function WeightProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const { user, isAuthenticated } = useAuth();

  // Завантаження даних з API
  useEffect(() => {
    if (!isAuthenticated) {
      setEntries([]);
      return;
    }

    // Load from database
    const token = localStorage.getItem('omomo_auth_token');
    if (token) {
      fetch(`${API_BASE}/api/weight-logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.weightLogs) {
          setEntries(data.weightLogs.map((w: any) => ({
            id: w._id,
            date: w.date,
            weight: w.weight,
            time: w.time,
            notes: w.notes
          })));
        }
      })
      .catch(console.error);
    }
  }, [isAuthenticated, user?.id]);

  // Збереження даних в localStorage відключено, працюємо з БД

  const currentWeight = useMemo(() => {
    if (entries.length === 0) return null;
    return entries[0].weight;
  }, [entries]);

  // Sync to backend profile
  useEffect(() => {
    if (isAuthenticated && currentWeight !== null) {
      const token = localStorage.getItem('omomo_auth_token');
      if (token) {
        fetch(`${API_BASE}/api/user/me`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ weight: currentWeight })
        }).catch(console.error);
      }
    }
  }, [currentWeight, isAuthenticated]);

  const addWeight = (weight: number, notes?: string) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

    const token = localStorage.getItem('omomo_auth_token');
    if (isAuthenticated && token) {
      fetch(`${API_BASE}/api/weight-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: dateStr,
          weight,
          time: timeStr,
          notes
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.weightLog) {
          setEntries((prev) => {
            const updated = [{
              id: data.weightLog._id,
              date: dateStr,
              weight,
              time: timeStr,
              notes
            }, ...prev];
            updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            return updated;
          });
        }
      })
      .catch(console.error);
    } else {
      const entry: WeightEntry = {
        id: crypto.randomUUID(),
        date: dateStr,
        weight,
        time: timeStr,
        notes,
      };
      setEntries((prev) => {
        const updated = [entry, ...prev];
        updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return updated;
      });
    }
  };

  const removeWeight = (id: string) => {
    const token = localStorage.getItem('omomo_auth_token');
    if (isAuthenticated && token) {
      fetch(`${API_BASE}/api/weight-logs/${id}`, {
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

  const getWeightForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const entry = entries.find((e) => e.date === dateString);
    return entry ? entry.weight : null;
  };

  const getWeightHistory = (days: number = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return entries.filter((entry) => new Date(entry.date) >= cutoffDate);
  };

  const getWeightTrend = () => {
    if (entries.length < 2) return null;
    
    const recent = entries.slice(0, 7); // останні 7 записів
    if (recent.length < 2) return null;
    
    const oldest = recent[recent.length - 1].weight;
    const newest = recent[0].weight;
    
    return newest - oldest;
  };

  const value: WeightContextValue = useMemo(
    () => ({
      currentWeight,
      entries,
      addWeight,
      removeWeight,
      getWeightForDate,
      getWeightHistory,
      getWeightTrend,
    }),
    [currentWeight, entries]
  );

  return <WeightContext.Provider value={value}>{children}</WeightContext.Provider>;
}

export function useWeight() {
  const ctx = useContext(WeightContext);
  if (!ctx) throw new Error("useWeight must be used within WeightProvider");
  return ctx;
}

