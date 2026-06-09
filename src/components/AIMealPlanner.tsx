import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  Target, 
  ChefHat, 
  Sparkles, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  Flame,
  Users,
  Star,
  TrendingUp,
  Heart,
  Copy
} from "lucide-react";
import { toast } from "sonner";
import { getOpenAIService, MealPlanRequest, GeneratedMealPlan } from "@/lib/openai-ai";
import { useSmartFridge } from "@/hooks/useSmartFridge";
import { useAuth } from "@/hooks/useAuth";

interface AIMealPlannerProps {
  onMealPlanGenerated?: (mealPlan: GeneratedMealPlan[]) => void;
  onAddToFavorites?: (recipe: any) => void;
}

export function AIMealPlanner({ onMealPlanGenerated, onAddToFavorites }: AIMealPlannerProps) {
  const { products } = useSmartFridge();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMealPlan, setGeneratedMealPlan] = useState<GeneratedMealPlan[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("");
  
  // Form state
  const [targetCalories, setTargetCalories] = useState<number>(2000);
  const [targetProtein, setTargetProtein] = useState<number>(150);
  const [targetFat, setTargetFat] = useState<number>(65);
  const [targetCarbs, setTargetCarbs] = useState<number>(250);
  const [mealsPerDay, setMealsPerDay] = useState<number>(4);
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [budget, setBudget] = useState<"low" | "medium" | "high">("medium");
  const [cookingTime, setCookingTime] = useState<"quick" | "moderate" | "extensive">("moderate");

  const dietaryOptions = [
    "Вегетарианство",
    "Веганство", 
    "Кето",
    "Палео",
    "Средиземноморская",
    "Без глютена",
    "Без лактозы",
    "Низкоуглеводная",
    "Высокобелковая"
  ];

  const allergyOptions = [
    "Орехи",
    "Молочные продукты",
    "Яйца",
    "Рыба",
    "Морепродукты",
    "Соя",
    "Глютен",
    "Кунжут"
  ];

  // Load user preferences
  useEffect(() => {
    if (user?.targets) {
      setTargetCalories(user.targets.calories || 2000);
      setTargetProtein(user.targets.protein || 150);
      setTargetFat(user.targets.fats || 65);
      setTargetCarbs(user.targets.carbs || 250);
    }
  }, [user]);

  const availableIngredients = products
    .filter(p => !p.isInPantry)
    .map(p => p.name);

  const handleDietaryToggle = (preference: string) => {
    setDietaryPreferences(prev => 
      prev.includes(preference) 
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    );
  };

  const handleAllergyToggle = (allergy: string) => {
    setAllergies(prev => 
      prev.includes(allergy) 
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
  };

  const generateMealPlan = async () => {
    if (availableIngredients.length === 0) {
      toast.error("Добавьте продукты в холодильник для генерации плана");
      return;
    }

    setIsGenerating(true);
    try {
      const openaiService = getOpenAIService();
      
      const request: MealPlanRequest = {
        targetCalories,
        targetProtein,
        targetFat,
        targetCarbs,
        mealsPerDay,
        dietaryPreferences,
        allergies,
        availableIngredients,
        budget,
        cookingTime
      };

      const mealPlan = await openaiService.generateMealPlan(request);
      setGeneratedMealPlan(mealPlan);
      onMealPlanGenerated?.(mealPlan);
      toast.success("План питания успешно сгенерирован!");
    } catch (error) {
      console.error("Error generating meal plan:", error);
      toast.error("Ошибка при генерации плана питания. Попробуйте еще раз.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyMealPlan = () => {
    if (generatedMealPlan.length === 0) return;
    
    const mealPlanText = generatedMealPlan.map(day => `
${day.day}
${day.meals.map(meal => `
${meal.mealType.toUpperCase()} (${meal.scheduledTime})
${meal.recipe.title}
${meal.recipe.description}

Ингредиенты:
${meal.recipe.ingredients.map(ing => `- ${ing.amount} ${ing.unit} ${ing.name}`).join('\n')}

Инструкции:
${meal.recipe.instructions.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Пищевая ценность: ${meal.recipe.nutrition.calories} ккал, Б: ${meal.recipe.nutrition.protein}г, Ж: ${meal.recipe.nutrition.fat}г, В: ${meal.recipe.nutrition.carbs}г
`).join('\n')}

Итого за день: ${day.totalNutrition.calories} ккал, Б: ${day.totalNutrition.protein}г, Ж: ${day.totalNutrition.fat}г, В: ${day.totalNutrition.carbs}г
`).join('\n');

    navigator.clipboard.writeText(mealPlanText);
    toast.success("План питания скопирован в буфер обмена!");
  };

  const getMealTypeLabel = (mealType: string) => {
    const labels = {
      breakfast: "Завтрак",
      lunch: "Обед", 
      dinner: "Ужин",
      snack: "Перекус"
    };
    return labels[mealType as keyof typeof labels] || mealType;
  };

  const getMealTypeIcon = (mealType: string) => {
    const icons = {
      breakfast: Sun,
      lunch: Clock,
      dinner: Moon,
      snack: Apple
    };
    return icons[mealType as keyof typeof icons] || Utensils;
  };

  return (
    <div className="space-y-6">
      {/* AI Meal Planner Card */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-blue-900">AI Планировщик Питания</h3>
            <p className="text-sm text-blue-700">
              Создавайте персональные планы питания на неделю
            </p>
          </div>
        </div>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">Настройки</TabsTrigger>
            <TabsTrigger value="plan">План</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6">
            {/* Nutrition Targets */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Цели по питанию
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Калории</Label>
                  <Input
                    type="number"
                    value={targetCalories}
                    onChange={(e) => setTargetCalories(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Белки (г)</Label>
                  <Input
                    type="number"
                    value={targetProtein}
                    onChange={(e) => setTargetProtein(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Жиры (г)</Label>
                  <Input
                    type="number"
                    value={targetFat}
                    onChange={(e) => setTargetFat(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Углеводы (г)</Label>
                  <Input
                    type="number"
                    value={targetCarbs}
                    onChange={(e) => setTargetCarbs(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Meal Settings */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Настройки приема пищи
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Приемов пищи в день</Label>
                  <Select value={mealsPerDay.toString()} onValueChange={(value) => setMealsPerDay(Number(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="6">6</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Бюджет</Label>
                  <Select value={budget} onValueChange={(value: any) => setBudget(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Низкий</SelectItem>
                      <SelectItem value="medium">Средний</SelectItem>
                      <SelectItem value="high">Высокий</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Время приготовления</Label>
                  <Select value={cookingTime} onValueChange={(value: any) => setCookingTime(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quick">Быстро (&lt;30 мин)</SelectItem>
                      <SelectItem value="moderate">Умеренно (30-60 мин)</SelectItem>
                      <SelectItem value="extensive">Долго (&gt;60 мин)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Dietary Preferences */}
            <div>
              <h4 className="font-semibold mb-3">Диетические предпочтения</h4>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map(option => (
                  <Badge
                    key={option}
                    variant={dietaryPreferences.includes(option) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleDietaryToggle(option)}
                  >
                    {option}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div>
              <h4 className="font-semibold mb-3">Аллергии</h4>
              <div className="flex flex-wrap gap-2">
                {allergyOptions.map(option => (
                  <Badge
                    key={option}
                    variant={allergies.includes(option) ? "destructive" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleAllergyToggle(option)}
                  >
                    {option}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Available Ingredients */}
            <div>
              <h4 className="font-semibold mb-3">
                Доступные ингредиенты ({availableIngredients.length})
              </h4>
              <div className="max-h-32 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {availableIngredients.map(ingredient => (
                    <Badge key={ingredient} variant="secondary" className="text-xs">
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Button 
              onClick={generateMealPlan}
              disabled={isGenerating || availableIngredients.length === 0}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Генерируем план...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Создать план питания
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="plan" className="space-y-4">
            {generatedMealPlan.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Недельный план питания</h4>
                  <Button size="sm" variant="outline" onClick={copyMealPlan}>
                    <Copy className="w-4 h-4 mr-2" />
                    Копировать
                  </Button>
                </div>

                <div className="space-y-4">
                  {generatedMealPlan.map((day, dayIndex) => (
                    <Card key={dayIndex} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-semibold text-lg">{day.day}</h5>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Flame className="w-4 h-4" />
                            {day.totalNutrition.calories} ккал
                          </span>
                          <span>Б: {day.totalNutrition.protein}г</span>
                          <span>Ж: {day.totalNutrition.fat}г</span>
                          <span>В: {day.totalNutrition.carbs}г</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {day.meals.map((meal, mealIndex) => (
                          <Card key={mealIndex} className="p-3 border-2 border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                              {(() => {
                                const Icon = getMealTypeIcon(meal.mealType);
                                return <Icon className="w-5 h-5" />;
                              })()}
                              <span className="font-medium">{getMealTypeLabel(meal.mealType)}</span>
                              <span className="text-sm text-muted-foreground">({meal.scheduledTime})</span>
                            </div>
                            
                            <h6 className="font-semibold mb-1">{meal.recipe.title}</h6>
                            <p className="text-sm text-muted-foreground mb-2">{meal.recipe.description}</p>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {meal.recipe.cookingTime} мин
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {meal.recipe.servings} порций
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                {meal.recipe.difficulty}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <span className="flex items-center gap-1 text-orange-600">
                                <Flame className="w-3 h-3" />
                                {meal.recipe.nutrition.calories} ккал
                              </span>
                              <span>Б: {meal.recipe.nutrition.protein}г</span>
                              <span>Ж: {meal.recipe.nutrition.fat}г</span>
                              <span>В: {meal.recipe.nutrition.carbs}г</span>
                            </div>

                            <div className="flex gap-1 mt-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1 text-xs"
                                onClick={() => onAddToFavorites?.(meal.recipe)}
                              >
                                <Heart className="w-3 h-3 mr-1" />
                                В избранное
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Сгенерируйте план питания, чтобы увидеть его здесь</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

