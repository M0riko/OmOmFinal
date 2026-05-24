import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Sparkles, 
  Refrigerator, 
  ShoppingCart, 
  Calendar, 
  Clock, 
  Target,
  Utensils,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Scale,
  Leaf,
  Apple,
  Fish,
  Package,
  Milk
} from "lucide-react";
import { MealPlanSettings } from "@/lib/meal-planner";

interface MealPlanGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: MealPlanSettings | null;
  onGenerate: (useFridgeProducts: boolean) => void;
  generating: boolean;
}

export function MealPlanGenerator({ 
  open, 
  onOpenChange, 
  settings, 
  onGenerate, 
  generating 
}: MealPlanGeneratorProps) {
  const [selectedMode, setSelectedMode] = useState<"fridge" | "optimal">("fridge");

  if (!settings) return null;

  const { preferences, targetCalories, targetMacros } = settings;

  const getGoalIcon = (goal: string) => {
    switch (goal) {
      case "weight_loss": return TrendingDown;
      case "weight_gain": return TrendingUp;
      default: return Scale;
    }
  };

  const getDietIcon = (diet: string) => {
    switch (diet) {
      case "vegetarian": return Leaf;
      case "vegan": return Leaf;
      case "keto": return Apple;
      case "paleo": return Utensils;
      case "mediterranean": return Fish;
      case "gluten_free": return Package;
      case "dairy_free": return Milk;
      default: return Utensils;
    }
  };

  const getGoalText = (goal: string) => {
    switch (goal) {
      case "weight_loss": return "Схуднення";
      case "weight_gain": return "Набір маси";
      default: return "Підтримка ваги";
    }
  };

  const getDietText = (diet: string) => {
    switch (diet) {
      case "vegetarian": return "Вегетаріанська";
      case "vegan": return "Веганська";
      case "keto": return "Кето";
      case "paleo": return "Палео";
      case "mediterranean": return "Середземноморська";
      case "gluten_free": return "Без глютену";
      case "dairy_free": return "Без молочних";
      default: return "Стандартна";
    }
  };

  const getCookingTimeText = (time: string) => {
    switch (time) {
      case "quick": return "До 30 хв";
      case "extensive": return "Понад 60 хв";
      default: return "30-60 хв";
    }
  };

  const getBudgetText = (budget: string) => {
    switch (budget) {
      case "low": return "Економний";
      case "high": return "Високий";
      default: return "Середній";
    }
  };

  const handleGenerate = () => {
    onGenerate(selectedMode === "fridge");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Генерація плану харчування
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Settings Summary */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Ваші налаштування
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = getGoalIcon(preferences.goal);
                    return <Icon className="w-4 h-4" />;
                  })()}
                  <span className="font-medium">Мета:</span>
                  <span>{getGoalText(preferences.goal)}</span>
                </div>
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = getDietIcon(preferences.dietType);
                    return <Icon className="w-4 h-4" />;
                  })()}
                  <span className="font-medium">Дієта:</span>
                  <span>{getDietText(preferences.dietType)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Utensils className="w-4 h-4" />
                  <span className="font-medium">Прийоми їжі:</span>
                  <span>{preferences.mealsPerDay} на день</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Час приготування:</span>
                  <span>{getCookingTimeText(preferences.cookingTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">Бюджет:</span>
                  <span>{getBudgetText(preferences.budget)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span className="font-medium">Калорії:</span>
                  <span>{targetCalories} ккал</span>
                </div>
              </div>
            </div>
            
            {preferences.excludedFoods.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <span className="font-medium text-sm">Виключені продукти:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {preferences.excludedFoods.map((food) => (
                    <Badge key={food} variant="secondary" className="text-xs">
                      {food}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Generation Mode Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold">Режим генерації</h3>
            
            <div className="grid gap-4">
              {/* Use Fridge Products Mode */}
              <Card 
                className={`p-4 cursor-pointer transition-all ${
                  selectedMode === "fridge" ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
                onClick={() => setSelectedMode("fridge")}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Refrigerator className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Використати продукти з холодильника</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Створити план на основі продуктів, які у вас вже є. 
                      Недостаючі інгредієнти будуть додані до списку покупок.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">Економно</Badge>
                      <Badge variant="outline" className="text-xs">Персоналізовано</Badge>
                      <Badge variant="outline" className="text-xs">Без відходів</Badge>
                    </div>
                  </div>
                  {selectedMode === "fridge" && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
              </Card>

              {/* Optimal Plan Mode */}
              <Card 
                className={`p-4 cursor-pointer transition-all ${
                  selectedMode === "optimal" ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
                onClick={() => setSelectedMode("optimal")}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Створити оптимальний план</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Згенерувати ідеальний збалансований план харчування 
                      з повним списком покупок для його виконання.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">Збалансовано</Badge>
                      <Badge variant="outline" className="text-xs">Різноманітно</Badge>
                      <Badge variant="outline" className="text-xs">Оптимально</Badge>
                    </div>
                  </div>
                  {selectedMode === "optimal" && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Target Nutrition */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Цільові показники</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-orange-500">{targetCalories}</div>
                <div className="text-xs text-muted-foreground">Калорії</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">{targetMacros.protein}г</div>
                <div className="text-xs text-muted-foreground">Білки</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-500">{targetMacros.fat}г</div>
                <div className="text-xs text-muted-foreground">Жири</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">{targetMacros.carbs}г</div>
                <div className="text-xs text-muted-foreground">Вуглеводи</div>
              </div>
            </div>
          </Card>

          {/* Generation Info */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Що буде згенеровано:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• План харчування на 7 днів</li>
                  <li>• {preferences.mealsPerDay} прийоми їжі на день</li>
                  <li>• Рецепти з урахуванням ваших уподобань</li>
                  <li>• Автоматичний список покупок</li>
                  <li>• Розрахунок КБЖУ для кожного дня</li>
                </ul>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Скасувати
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={generating}
              className="gap-2"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Генерація...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Згенерувати план
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
