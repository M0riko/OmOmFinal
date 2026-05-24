import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export type Achievement = {
  id: string;
  title: string;
  description?: string;
  earnedAt?: string; // ISO
};

type AchievementsContextValue = {
  achievements: Achievement[];
  earn: (id: string, data?: Partial<Achievement>) => void;
  has: (id: string) => boolean;
  reset: () => void;
};

const KEY = "omomo_achievements";

const AchievementsContext = createContext<AchievementsContextValue | undefined>(undefined);

const DEFAULTS: Record<string, Pick<Achievement, "title" | "description">> = {
  first_meal: { title: "Перша страва", description: "Додайте першу страву у щоденник" },
  five_meals: { title: "5 записів", description: "Додайте 5 записів за день" },
  first_fridge_item: { title: "Перший продукт", description: "Додайте перший продукт у холодильник" },
  first_workout: { title: "Перше тренування", description: "Додайте перше тренування" },
  shopping_3: { title: "Список покупок", description: "Додайте 3 пункти у список покупок" },
};

export function AchievementsProvider({ children }: { children: React.ReactNode }) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setAchievements(JSON.parse(raw)); } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(achievements)); } catch {}
  }, [achievements]);

  function has(id: string) {
    return achievements.some((a) => a.id === id);
  }

  function earn(id: string, data?: Partial<Achievement>) {
    if (has(id)) return;
    const base = DEFAULTS[id] || { title: id };
    setAchievements((prev) => [
      { id, title: base.title, description: base.description, earnedAt: new Date().toISOString(), ...data },
      ...prev,
    ]);
    toast.success(`Досягнення: ${base.title}`);
  }

  function reset() { setAchievements([]); }

  const value = useMemo<AchievementsContextValue>(() => ({ achievements, earn, has, reset }), [achievements]);

  return <AchievementsContext.Provider value={value}>{children}</AchievementsContext.Provider>;
}

export function useAchievements() {
  const ctx = useContext(AchievementsContext);
  if (!ctx) throw new Error("useAchievements must be used within AchievementsProvider");
  return ctx;
}


