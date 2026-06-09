import { Utensils, Target, Apple, Clock, Brain, Sparkles, ChefHat, TrendingUp, Sun, Moon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";

interface MealPlan {
  id: string;
  name: string;
  meals: Array<{
    type: "breakfast" | "lunch" | "dinner" | "snack";
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    ingredients: string[];
    prepTime: number;
  }>;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  description: string;
}

interface AINutritionPlannerProps {
  userGoals?: string[];
  dietaryRestrictions?: string[];
  targetCalories?: number;
  onSavePlan?: (plan: MealPlan) => void;
}

export function AINutritionPlanner({ 
  userGoals = ["Схуднення"], 
  dietaryRestrictions = [],
  targetCalories = 2000,
  onSavePlan 
}: AINutritionPlannerProps) {
  const { t } = useI18n();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<MealPlan | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(userGoals);

  const goalOptions = [
    "Схуднення", "Набір ваги", "Підтримка ваги", "Набір м'язової маси",
    "Покращення здоров'я", "Підвищення енергії", "Детокс"
  ];

  const restrictionOptions = [
    "Вегетаріанство", "Веганство", "Без глютену", "Без лактози", 
    "Кето", "Палео", "Низьковуглеводна", "Високобілкова"
  ];

  const generateMealPlan = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const plan: MealPlan = {
        id: "1",
        name: "Персональний план харчування",
        meals: [
          {
            type: "breakfast",
            name: "Вівсянка з ягодами та горіхами",
            calories: 350,
            protein: 12,
            carbs: 45,
            fat: 8,
            ingredients: ["Вівсяні пластівці", "Молоко", "Ягоди", "Волоські горіхи", "Мед"],
            prepTime: 10
          },
          {
            type: "lunch",
            name: "Куряча грудка з овочами",
            calories: 450,
            protein: 35,
            carbs: 25,
            fat: 12,
            ingredients: ["Куряча грудка", "Броколі", "Морква", "Оливкова олія", "Спеції"],
            prepTime: 25
          },
          {
            type: "dinner",
            name: "Лосось з кіноа та салатом",
            calories: 500,
            protein: 30,
            carbs: 35,
            fat: 20,
            ingredients: ["Лосось", "Кіноа", "Салат", "Авокадо", "Лимон"],
            prepTime: 30
          },
          {
            type: "snack",
            name: "Грецький йогурт з горіхами",
            calories: 200,
            protein: 15,
            carbs: 12,
            fat: 8,
            ingredients: ["Грецький йогурт", "Мигдаль", "Мед"],
            prepTime: 5
          }
        ],
        totalCalories: 1500,
        totalProtein: 92,
        totalCarbs: 117,
        totalFat: 48,
        description: `План створено для досягнення цілі: ${selectedGoals.join(", ")}. Збалансоване харчування з оптимальним співвідношенням БЖВ.`
      };
      
      setGeneratedPlan(plan);
      setIsGenerating(false);
    }, 2500);
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const getMealTypeIcon = (type: string) => {
    switch (type) {
      case "breakfast": return Sun;
      case "lunch": return Clock;
      case "dinner": return Moon;
      case "snack": return Apple;
      default: return Utensils;
    }
  };

  const getMealTypeLabel = (type: string) => {
    switch (type) {
      case "breakfast": return "Сніданок";
      case "lunch": return "Обід";
      case "dinner": return "Вечеря";
      case "snack": return "Перекус";
      default: return "Прийом їжі";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-6 bg-gradient-to-r from-green-500/5 to-green-500/10 border-2 border-green-500/20 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">{t("aiNutritionPlanner")}</h3>
              <p className="text-sm text-muted-foreground">Створюю персональне меню на основі ваших цілей</p>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-500 font-medium">{t("aiActive")}</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Goals Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              <h4 className="font-semibold text-foreground">Оберіть цілі харчування</h4>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {goalOptions.map((goal) => (
                <Badge
                  key={goal}
                  variant={selectedGoals.includes(goal) ? "default" : "outline"}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedGoals.includes(goal) 
                      ? "bg-green-500 text-white" 
                      : "hover:bg-green-500/10"
                  }`}
                  onClick={() => toggleGoal(goal)}
                >
                  {goal}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Generate Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Button 
          onClick={generateMealPlan}
          disabled={isGenerating || selectedGoals.length === 0}
          className="w-full gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Створюю план харчування...
            </>
          ) : (
            <>
              <ChefHat className="w-4 h-4" />
              Створити персональне меню
            </>
          )}
        </Button>
      </motion.div>

      {/* Generated Meal Plan */}
      {generatedPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-foreground">{generatedPlan.name}</h4>
                <p className="text-sm text-muted-foreground">{generatedPlan.description}</p>
              </div>

              {/* Nutrition Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <Apple className="w-5 h-5 text-red-500 mx-auto mb-1" />
                  <p className="text-sm text-muted-foreground">Калорії</p>
                  <p className="font-semibold text-foreground">{generatedPlan.totalCalories}</p>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <Target className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-sm text-muted-foreground">Білки</p>
                  <p className="font-semibold text-foreground">{generatedPlan.totalProtein}г</p>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <p className="text-sm text-muted-foreground">Вуглеводи</p>
                  <p className="font-semibold text-foreground">{generatedPlan.totalCarbs}г</p>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <Utensils className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                  <p className="text-sm text-muted-foreground">Жири</p>
                  <p className="font-semibold text-foreground">{generatedPlan.totalFat}г</p>
                </div>
              </div>

              {/* Meals List */}
              <div className="space-y-4">
                <h5 className="font-semibold text-foreground">План харчування:</h5>
                {generatedPlan.meals.map((meal, index) => (
                  <div key={index} className="p-4 bg-muted/10 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const Icon = getMealTypeIcon(meal.type);
                          return <Icon className="w-5 h-5" />;
                        })()}
                        <div>
                          <h6 className="font-semibold text-foreground">{getMealTypeLabel(meal.type)}</h6>
                          <p className="text-sm text-muted-foreground">{meal.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{meal.calories} ккал</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {meal.prepTime} хв
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center p-2 bg-muted/20 rounded">
                        <p className="text-xs text-muted-foreground">Білки</p>
                        <p className="text-sm font-medium text-foreground">{meal.protein}г</p>
                      </div>
                      <div className="text-center p-2 bg-muted/20 rounded">
                        <p className="text-xs text-muted-foreground">Вуглеводи</p>
                        <p className="text-sm font-medium text-foreground">{meal.carbs}г</p>
                      </div>
                      <div className="text-center p-2 bg-muted/20 rounded">
                        <p className="text-xs text-muted-foreground">Жири</p>
                        <p className="text-sm font-medium text-foreground">{meal.fat}г</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Інгредієнти:</p>
                      <div className="flex flex-wrap gap-1">
                        {meal.ingredients.map((ingredient, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {ingredient}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Save Button */}
              <Button 
                onClick={() => onSavePlan?.(generatedPlan)}
                className="w-full gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                <Utensils className="w-4 h-4" />
                Зберегти план харчування
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
