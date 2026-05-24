import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Calendar, Target } from "lucide-react";
import { useDaily } from "@/hooks/useDaily";
import { useMealPlanner } from "@/hooks/useMealPlanner";
import { useI18n } from "@/hooks/useI18n";
import { useMemo } from "react";

interface WeeklyPlanProgressWidgetProps {
  onViewPlan: () => void;
}

export function WeeklyPlanProgressWidget({ onViewPlan }: WeeklyPlanProgressWidgetProps) {
  const { t } = useI18n();
  const { entries } = useDaily();
  const { weeklyPlan } = useMealPlanner();

  // Получаем данные по дням недели
  const weekData = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Понедельник

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      // Получаем записи за этот день
      const dayEntries = entries.filter(entry => entry.date === dateString);
      const dayCalories = dayEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0);
      
      // Получаем план на этот день
      const dayPlan = weeklyPlan?.days?.find(day => day.date === dateString);
      const plannedCalories = dayPlan?.totalNutrition?.planned?.calories || 2000;
      
      const progress = plannedCalories > 0 ? (dayCalories / plannedCalories) * 100 : 0;
      const isGoalReached = progress >= 90; // 90% считаем достижением цели
      const isToday = dateString === today.toISOString().split('T')[0];
      
      days.push({
        date: dateString,
        dayName: date.toLocaleDateString('uk-UA', { weekday: 'short' }),
        dayNumber: date.getDate(),
        calories: dayCalories,
        plannedCalories,
        progress: Math.min(progress, 100),
        isGoalReached,
        isToday
      });
    }
    
    return days;
  }, [entries, weeklyPlan]);

  const totalProgress = weekData.reduce((sum, day) => sum + day.progress, 0) / 7;
  const completedDays = weekData.filter(day => day.isGoalReached).length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">План на неделю</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {completedDays}/7 дней
          </Badge>
          <Button variant="outline" size="sm" onClick={onViewPlan}>
            {t('viewPlan')}
          </Button>
        </div>
      </div>

      {/* Общий прогресс */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>Общий прогресс недели</span>
          <span>{Math.round(totalProgress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>

      {/* Дни недели */}
      <div className="grid grid-cols-7 gap-2">
        {weekData.map((day) => (
          <div 
            key={day.date} 
            className={`text-center p-2 rounded-lg transition-all duration-200 ${
              day.isToday 
                ? 'bg-primary/10 border-2 border-primary' 
                : day.isGoalReached 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-muted/50 border border-border'
            }`}
          >
            <div className="text-xs text-muted-foreground mb-1">
              {day.dayName}
            </div>
            <div className={`text-lg font-semibold mb-1 ${
              day.isToday ? 'text-primary' : day.isGoalReached ? 'text-green-600 dark:text-green-400' : 'text-foreground'
            }`}>
              {day.dayNumber}
            </div>
            
            {/* Индикатор прогресса */}
            <div className="relative mb-2">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full transition-all duration-300 ${
                    day.isGoalReached ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${day.progress}%` }}
                />
              </div>
              {day.isGoalReached && (
                <div className="absolute -top-1 -right-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                </div>
              )}
            </div>
            
            {/* Калории */}
            <div className="text-xs text-muted-foreground">
              <div className="font-medium">{Math.round(day.calories)}</div>
              <div className="text-[10px]">/ {Math.round(day.plannedCalories)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Мотивационные сообщения */}
      {completedDays === 7 && (
        <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm text-center">
          Отличная неделя! Все цели достигнуты!
        </div>
      )}
      {completedDays >= 5 && completedDays < 7 && (
        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm text-center">
          Почти идеальная неделя! Осталось {7 - completedDays} дня
        </div>
      )}
      {completedDays < 3 && (
        <div className="mt-4 p-3 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-lg text-sm text-center">
          Можно лучше! Попробуйте достичь цели хотя бы 3 дня
        </div>
      )}
    </Card>
  );
}
