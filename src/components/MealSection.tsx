import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Coffee, Sun, Moon, Apple } from "lucide-react";
import { Recipe } from "@/lib/api";
import { cn } from "@/lib/utils";

interface MealSectionProps {
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  meals: Array<{
    id: string;
    recipeId?: number;
    name: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    image?: string;
  }>;
  onAddMeal: () => void;
  onRemoveMeal: (id: string) => void;
}

const mealIcons = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
  snack: Apple
};

const mealLabels = {
  breakfast: "Сніданок",
  lunch: "Обід",
  dinner: "Вечеря",
  snack: "Перекус"
};

export function MealSection({ mealType, meals, onAddMeal, onRemoveMeal }: MealSectionProps) {
  const Icon = mealIcons[mealType];
  const label = mealLabels[mealType];

  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      fat: acc.fat + meal.fat,
      carbs: acc.carbs + meal.carbs
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground">{label}</h3>
            {meals.length > 0 && (
              <p className="text-xs sm:text-sm text-muted-foreground">
                {totals.calories} ккал • {meals.length} {meals.length === 1 ? "страва" : "страв"}
              </p>
            )}
          </div>
        </div>
        <Button
          size="sm"
          onClick={onAddMeal}
          className="h-9 sm:h-10"
        >
          <Plus className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Додати</span>
        </Button>
      </div>

      {meals.length === 0 ? (
        <div className="text-center py-8 sm:py-12 border border-dashed border-border rounded-lg">
          <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm sm:text-base text-muted-foreground mb-2">Немає страв</p>
          <Button
            size="sm"
            variant="outline"
            onClick={onAddMeal}
          >
            <Plus className="w-4 h-4 mr-1" />
            Додати страву
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {meals.map((meal) => (
            <Card
              key={meal.id}
              className="p-3 sm:p-4 group"
            >
              <div className="flex gap-3 sm:gap-4">
                {meal.image && (
                  <img
                    src={meal.image}
                    alt={meal.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100";
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-medium text-sm sm:text-base line-clamp-2">{meal.name}</h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveMeal(meal.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs bg-orange-500/10 border-orange-500/20 text-orange-400">
                      {meal.calories} ккал
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-blue-500/10 border-blue-500/20 text-blue-400">
                      Б: {meal.protein}г
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-yellow-500/10 border-yellow-500/20 text-yellow-400">
                      Ж: {meal.fat}г
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-green-500/10 border-green-500/20 text-green-400">
                      В: {meal.carbs}г
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
}

