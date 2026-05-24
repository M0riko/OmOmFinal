import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sunrise, 
  Sun, 
  Moon, 
  CheckCircle, 
  Clock, 
  Target, 
  TrendingUp,
  Utensils,
  Activity,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDaily } from "@/hooks/useDaily";
import { useMealPlanner } from "@/hooks/useMealPlanner";
import { useI18n } from "@/hooks/useI18n";
import { useState } from "react";

interface TodayFocusWidgetProps {
  onAddMeal: (mealType?: string) => void;
  onStartWorkout: () => void;
  onViewPlan: () => void;
}

export function TodayFocusWidget({ onAddMeal, onStartWorkout, onViewPlan }: TodayFocusWidgetProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { totals } = useDaily();
  const { weeklyPlan, todayPlan } = useMealPlanner();
  const [currentTime] = useState(new Date());

  const targetCalories = user?.targets?.calories || 2000;
  const progress = targetCalories ? (totals.calories / targetCalories) * 100 : 0;
  
  // Определяем время суток
  const hour = currentTime.getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  
  // Получаем следующую запланированную еду
  const getNextMeal = () => {
    if (!todayPlan?.meals) return null;
    
    const now = new Date();
    const currentHour = now.getHours();
    
    // Находим следующую еду по времени
    const nextMeal = todayPlan.meals.find(meal => {
      if (!meal.scheduledTime) return false;
      const [hours] = meal.scheduledTime.split(':').map(Number);
      return hours > currentHour && !meal.isCompleted;
    });
    
    return nextMeal || todayPlan.meals.find(meal => !meal.isCompleted);
  };

  const nextMeal = getNextMeal();
  
  // Определяем состояние виджета
  const getWidgetState = () => {
    // Если есть план и следующая еда
    if (nextMeal) {
      const mealTypeNames = {
        breakfast: 'завтрак',
        lunch: 'обед', 
        dinner: 'ужин',
        snack: 'перекус'
      };
      
      return {
        type: 'next_meal',
        title: `Время для ${mealTypeNames[nextMeal.mealType as keyof typeof mealTypeNames]}`,
        subtitle: nextMeal.recipe.title,
        icon: nextMeal.mealType === 'breakfast' ? Sunrise : 
              nextMeal.mealType === 'lunch' ? Sun :
              nextMeal.mealType === 'dinner' ? Moon : Utensils,
        action: 'Записать',
        onAction: () => onAddMeal(nextMeal.mealType),
        color: 'primary'
      };
    }
    
    // Если цель по калориям почти достигнута
    if (progress >= 90) {
      return {
        type: 'goal_almost_reached',
        title: 'Отличная работа!',
        subtitle: `Цель по калориям достигнута на ${Math.round(progress)}%`,
        icon: CheckCircle,
        action: t('viewPlan'),
        onAction: onViewPlan,
        color: 'success'
      };
    }
    
    // Если цель по калориям превышена
    if (progress > 100) {
      return {
        type: 'goal_exceeded',
        title: 'Цель превышена',
        subtitle: `На ${Math.round(progress - 100)}% больше запланированного`,
        icon: AlertCircle,
        action: t('viewPlan'),
        onAction: onViewPlan,
        color: 'warning'
      };
    }
    
    // Если мало калорий
    if (progress < 50) {
      return {
        type: 'low_calories',
        title: 'Нужно подкрепиться',
        subtitle: `Осталось ${Math.round(targetCalories - totals.calories)} ккал до цели`,
        icon: Target,
        action: 'Добавить еду',
        onAction: () => onAddMeal(),
        color: 'info'
      };
    }
    
    // По умолчанию - общее приветствие
    const greetings = {
      morning: 'Доброе утро',
      afternoon: 'Добрый день', 
      evening: 'Добрый вечер'
    };
    
    const motivationalMessages = {
      morning: 'Отличный день для достижения целей!',
      afternoon: 'Продолжайте в том же духе!',
      evening: 'Завершите день на высокой ноте!'
    };
    
    return {
      type: 'greeting',
      title: `${greetings[timeOfDay as keyof typeof greetings]}, ${user?.name || 'Гость'}!`,
      subtitle: `${motivationalMessages[timeOfDay as keyof typeof motivationalMessages]} Сегодня: ${Math.round(totals.calories)} из ${targetCalories} ккал`,
      icon: timeOfDay === 'morning' ? Sunrise : timeOfDay === 'afternoon' ? Sun : Moon,
      action: 'Добавить еду',
      onAction: () => onAddMeal(),
      color: 'default'
    };
  };

  const state = getWidgetState();
  const IconComponent = state.icon;

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-${state.color === 'primary' ? 'primary' : state.color === 'success' ? 'green' : state.color === 'warning' ? 'orange' : 'gray'}-100 dark:bg-${state.color === 'primary' ? 'primary' : state.color === 'success' ? 'green' : state.color === 'warning' ? 'orange' : 'gray'}-900/20`}>
            <IconComponent className={`w-5 h-5 text-${state.color === 'primary' ? 'primary' : state.color === 'success' ? 'green' : state.color === 'warning' ? 'orange' : 'gray'}-600 dark:text-${state.color === 'primary' ? 'primary' : state.color === 'success' ? 'green' : state.color === 'warning' ? 'orange' : 'gray'}-400`} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{state.title}</h3>
            <p className="text-sm text-muted-foreground">{state.subtitle}</p>
          </div>
        </div>
        <Badge variant={state.color === 'success' ? 'default' : 'secondary'} className="text-xs">
          {timeOfDay === 'morning' ? 'Утро' : timeOfDay === 'afternoon' ? 'День' : 'Вечер'}
        </Badge>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{currentTime.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <Button onClick={state.onAction} size="sm" className="gap-2">
          {state.action}
        </Button>
      </div>
    </Card>
  );
}
