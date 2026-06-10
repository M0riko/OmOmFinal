import { HugeiconsIcon } from '@hugeicons/react';
import { Notification03Icon, UserIcon, FireIcon } from '@hugeicons/core-free-icons';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { useDaily } from "@/hooks/useDaily";
import { useWater } from "@/hooks/useWater";
import { useNotifications } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export const getDaysPlural = (days: number) => {
  if (days % 10 === 1 && days % 100 !== 11) return `${days} день`;
  if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) return `${days} дні`;
  return `${days} днів`;
};

export function DashboardHeader() {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  
  let todayLabel = new Date().toLocaleDateString("uk-UA", { 
    day: "numeric", 
    month: "long",
    weekday: "long"
  });
  // Capitalize first letter
  todayLabel = todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);
  
  const { totals, streakDays = 0 } = useDaily ? useDaily() : { totals: { calories: 0, steps: 0 }, streakDays: 3 };
  const { todayWater, waterGoal } = useWater();
  const { notify } = useNotifications();
  
  const targetCalories = user?.targets?.calories || 2000;
  
  // Згенерувати реальні сповіщення
  const notifications = useMemo(() => {
    const notifs = [];
    
    if (todayWater >= waterGoal && waterGoal > 0) {
      notifs.push({ id: 'water-goal', title: 'Виконано ціль по воді! 💧', time: 'Щойно' });
    } else if (todayWater > 0 && todayWater < waterGoal) {
      notifs.push({ id: `water-progress-${todayWater}`, title: 'Ви на шляху до цілі по воді! 💧', time: 'Сьогодні' });
    }
    
    if (totals.calories >= targetCalories) {
      notifs.push({ id: 'calories-goal', title: 'Денну норму калорій досягнуто! 🍽️', time: 'Щойно' });
    }
    
    if (streakDays > 0) {
      if (streakDays % 5 === 0 || streakDays === 1) {
        notifs.push({ id: `streak-goal-${streakDays}`, title: `Нове досягнення: ${streakDays} днів підряд! 🏆`, time: 'Сьогодні' });
      }
    }
    
    if (notifs.length === 0) {
      notifs.push({ id: 'welcome', title: 'Гарного дня та продуктивного тренування! 💪', time: 'Сьогодні' });
    }
    return notifs;
  }, [todayWater, waterGoal, totals.calories, targetCalories, streakDays]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const key = `omom_notified_${today}`;
    let notifiedGoals: string[] = [];
    try {
      notifiedGoals = JSON.parse(localStorage.getItem(key) || '[]');
    } catch(e) {}

    let updated = false;
    notifications.forEach(notif => {
      if (!notifiedGoals.includes(notif.id) && notif.id !== 'welcome') {
        notify(notif.title, { body: 'Відкрийте OmOm, щоб побачити деталі!' });
        notifiedGoals.push(notif.id);
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem(key, JSON.stringify(notifiedGoals));
    }
  }, [notifications, notify]);
  
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("hello")}, <span className="text-primary">
              {user?.name || t("guest")}
            </span>
          </h1>
          {streakDays > 0 && (
            <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15">
              <HugeiconsIcon icon={FireIcon} size={14} className="mr-1" />
              {getDaysPlural(streakDays)}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground text-sm md:text-base">
          {todayLabel}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              size="icon" 
              variant="ghost" 
              className="relative rounded-full w-11 h-11 hover:bg-muted/50"
            >
              <HugeiconsIcon icon={Notification03Icon} size={22} strokeWidth={1.5} />
              {notifications.length > 0 && notifications[0].id !== 'welcome' && (
                <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-destructive rounded-full"></div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Сповіщення</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((notif) => (
              <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                <span className="font-medium text-sm">{notif.title}</span>
                <span className="text-xs text-muted-foreground">{notif.time}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          size="icon" 
          variant="ghost" 
          className="rounded-full w-11 h-11 hover:bg-muted/50"
          onClick={() => navigate("/profile")}
        >
          <HugeiconsIcon icon={UserIcon} size={22} strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  );
}
