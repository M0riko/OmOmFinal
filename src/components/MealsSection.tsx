import { Plus, Coffee, Sun, Moon, Apple, Flame, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDaily } from "@/hooks/useDaily";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";

interface MealsSectionProps {
  onAddMeal: (mealType: "breakfast" | "lunch" | "dinner" | "snack") => void;
}

export function MealsSection({ onAddMeal }: MealsSectionProps) {
  const { entries } = useDaily();
  const { user } = useAuth();
  const { t } = useI18n();
  const targetCalories = user?.targets?.calories || 2000;
  
  // Группировка записей по приемам пищи
  const meals = {
    breakfast: entries.filter(e => e.mealType === "breakfast"),
    lunch: entries.filter(e => e.mealType === "lunch"),
    dinner: entries.filter(e => e.mealType === "dinner"),
    snack: entries.filter(e => e.mealType === "snack"),
  };
  
  const mealConfig = [
    { 
      key: "breakfast" as const, 
      label: t("breakfast"), 
      icon: Coffee, 
      color: "from-orange-400 to-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
      borderColor: "border-orange-200 dark:border-orange-800/50"
    },
    { 
      key: "lunch" as const, 
      label: t("lunch"), 
      icon: Sun, 
      color: "from-yellow-400 to-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
      borderColor: "border-yellow-200 dark:border-yellow-800/50"
    },
    { 
      key: "dinner" as const, 
      label: t("dinner"), 
      icon: Moon, 
      color: "from-purple-400 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      borderColor: "border-purple-200 dark:border-purple-800/50"
    },
    { 
      key: "snack" as const, 
      label: t("snack"), 
      icon: Apple, 
      color: "from-green-400 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      borderColor: "border-green-200 dark:border-green-800/50"
    },
  ];
  
  const getMealCalories = (mealEntries: typeof entries) => {
    return mealEntries.reduce((sum, entry) => sum + entry.calories, 0);
  };
  
  const getMealProgress = (calories: number) => {
    const targetPerMeal = targetCalories / 4; // Равномерное распределение
    return Math.min((calories / targetPerMeal) * 100, 100);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{t("meals")}</h3>
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mealConfig.map((meal) => {
          const IconComponent = meal.icon;
          const mealEntries = meals[meal.key];
          const mealCalories = getMealCalories(mealEntries);
          const progress = getMealProgress(mealCalories);
          const hasEntries = mealEntries.length > 0;
          
          return (
            <Card 
              key={meal.key}
              className={`p-4 bg-card/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group ${
                hasEntries ? `${meal.bgColor} ${meal.borderColor} border-2` : ''
              }`}
              onClick={() => onAddMeal(meal.key)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${meal.color} flex items-center justify-center shadow-lg`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{meal.label}</h4>
                    {hasEntries && (
                      <p className="text-sm text-muted-foreground">
                        {mealEntries.length} {mealEntries.length === 1 ? 'страва' : 'страви'}
                      </p>
                    )}
                  </div>
                </div>
                
                {hasEntries && (
                  <Badge variant="outline" className="text-xs">
                    {mealCalories} ккал
                  </Badge>
                )}
              </div>
              
              {hasEntries ? (
                <div className="space-y-2">
                  {/* Прогресс-бар */}
                  <div className="w-full bg-muted/30 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${meal.color} transition-all duration-500`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  
                  {/* Список блюд */}
                  <div className="space-y-1">
                    {mealEntries.slice(0, 2).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Flame className="w-3 h-3 text-orange-500" />
                          <span className="text-foreground">{entry.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {entry.time && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span className="text-xs">{entry.time}</span>
                            </div>
                          )}
                          <span className="text-xs font-medium">{entry.calories} ккал</span>
                        </div>
                      </div>
                    ))}
                    {mealEntries.length > 2 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{mealEntries.length - 2} ще
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/30 flex items-center justify-center">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Немає записів</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Додати
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
