import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sunrise, 
  Sun, 
  Moon, 
  Apple,
  CheckCircle, 
  RefreshCw, 
  Edit3,
  Plus,
  Clock
} from "lucide-react";
import { useDaily } from "@/hooks/useDaily";
import { useMealPlanner } from "@/hooks/useMealPlanner";
import { useState } from "react";

interface InteractiveMealsWidgetProps {
  onAddMeal: (mealType?: string) => void;
  onEditMeal: (mealId: string) => void;
  onReplaceMeal: (mealId: string) => void;
}

export function InteractiveMealsWidget({ onAddMeal, onEditMeal, onReplaceMeal }: InteractiveMealsWidgetProps) {
  const { entries } = useDaily();
  const { todayPlan } = useMealPlanner();
  const [completedMeals, setCompletedMeals] = useState<Set<string>>(new Set());

  const mealTypes = [
    { key: 'breakfast', name: 'Завтрак', icon: Sunrise, color: 'orange' },
    { key: 'lunch', name: 'Обед', icon: Sun, color: 'yellow' },
    { key: 'dinner', name: 'Ужин', icon: Moon, color: 'blue' },
    { key: 'snack', name: 'Перекус', icon: Apple, color: 'green' }
  ];

  // Получаем запланированные блюда для каждого приема пищи
  const getPlannedMeal = (mealType: string) => {
    if (!todayPlan?.meals) return null;
    return todayPlan.meals.find(meal => meal.mealType === mealType);
  };

  // Получаем съеденные блюда для каждого приема пищи
  const getEatenMeals = (mealType: string) => {
    return entries.filter(entry => entry.mealType === mealType);
  };

  const handleMealComplete = (mealId: string) => {
    setCompletedMeals(prev => new Set([...prev, mealId]));
    
    // Добавляем анимацию и уведомление
    const mealElement = document.getElementById(`meal-${mealId}`);
    if (mealElement) {
      mealElement.style.transition = 'all 0.3s ease';
      mealElement.style.opacity = '0.7';
      mealElement.style.transform = 'scale(0.98)';
      
      setTimeout(() => {
        mealElement.style.opacity = '1';
        mealElement.style.transform = 'scale(1)';
      }, 300);
    }
    
    // Здесь можно добавить логику для автоматического добавления в дневник
    // и обновления статистики КБЖУ
  };

  const handleMealReplace = (mealId: string) => {
    onReplaceMeal(mealId);
  };

  const handleMealEdit = (mealId: string) => {
    onEditMeal(mealId);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Приемы пищи</h3>
        <Badge variant="outline" className="text-xs">
          {entries.length} записей
        </Badge>
      </div>

      <div className="space-y-4">
        {mealTypes.map((mealType) => {
          const plannedMeal = getPlannedMeal(mealType.key);
          const eatenMeals = getEatenMeals(mealType.key);
          const IconComponent = mealType.icon;
          const isCompleted = plannedMeal && completedMeals.has(plannedMeal.id);

          return (
            <div 
              key={mealType.key} 
              id={plannedMeal ? `meal-${plannedMeal.id}` : undefined}
              className={`flex items-center gap-4 p-3 rounded-lg border transition-all duration-300 ${
                isCompleted 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 opacity-75' 
                  : 'bg-card hover:bg-muted/50'
              }`}
            >
              <div className={`p-2 rounded-lg bg-${mealType.color}-100 dark:bg-${mealType.color}-900/20`}>
                <IconComponent className={`w-5 h-5 text-${mealType.color}-600 dark:text-${mealType.color}-400`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{mealType.name}</h4>
                  {plannedMeal && (
                    <Badge variant="secondary" className="text-xs">
                      По плану
                    </Badge>
                  )}
                  {isCompleted && (
                    <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                      Выполнено
                    </Badge>
                  )}
                </div>
                
                {plannedMeal ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{plannedMeal.recipe.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {plannedMeal.recipe.nutrition.calories} ккал • 
                          {plannedMeal.recipe.nutrition.protein}г белка
                        </p>
                      </div>
                      {plannedMeal.scheduledTime && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                          <Clock className="w-3 h-3" />
                          <span>{plannedMeal.scheduledTime}</span>
                        </div>
                      )}
                    </div>
                    
                    {isCompleted ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Записано</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 text-xs gap-1"
                          onClick={() => handleMealEdit(plannedMeal.id)}
                        >
                          <Edit3 className="w-3 h-3" />
                          Изменить
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="h-8 text-xs gap-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleMealComplete(plannedMeal.id)}
                        >
                          <CheckCircle className="w-3 h-3" />
                          Съел(а)
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 text-xs gap-1"
                          onClick={() => handleMealReplace(plannedMeal.id)}
                        >
                          <RefreshCw className="w-3 h-3" />
                          Заменить
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 text-xs gap-1"
                          onClick={() => handleMealEdit(plannedMeal.id)}
                        >
                          <Edit3 className="w-3 h-3" />
                          Изменить
                        </Button>
                      </div>
                    )}
                  </div>
                ) : eatenMeals.length > 0 ? (
                  <div className="space-y-1">
                    {eatenMeals.map((meal, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{meal.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {meal.calories} ккал • {meal.protein}г белка
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Записано
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Нет записей</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 text-xs gap-1"
                      onClick={() => onAddMeal(mealType.key)}
                    >
                      <Plus className="w-3 h-3" />
                      Добавить
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
