import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { MealPlanHeaderStats } from "@/components/MealPlanHeaderStats";
import { MealPlanTabs } from "@/components/MealPlanTabs";
import { MealPlanSummaryBanner } from "@/components/MealPlanSummaryBanner";
import { MealPlanGrid } from "@/components/MealPlanGrid";
import { MealPlanEmptyState } from "@/components/MealPlanEmptyState";
import { MealPlanRecommendations } from "@/components/MealPlanRecommendations";
import { AINutritionPlanner } from "@/components/AINutritionPlanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecipeDetailsModal } from "@/components/RecipeDetailsModal";
import { generateDetailedRecipe } from "@/lib/openai-ai";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { useState, useEffect, useMemo } from "react";
import { Plus, Clock, Users, Utensils, Coffee, Sun, Moon, Apple } from "lucide-react";
import { apiService, Recipe } from "@/lib/api";
import { toast } from "sonner";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

type MealPlanItem = {
  id: string;
  recipeId?: number;
  name: string;
  mealType: MealType;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  servings: number;
  date: string;
  recipeDetails?: any;
};

type WeeklyPlan = {
  [date: string]: {
    [mealType in MealType]: MealPlanItem[];
  };
};

export default function MealPlan() {
  const { user } = useAuth();
  const { t } = useI18n();
  const targetCalories = user?.targets?.calories || 2100;
  const targetProtein = user?.targets?.protein || 120;
  const targetFat = user?.targets?.fats || 65;
  const targetCarbs = user?.targets?.carbs || 250;

  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>(() => {
    try {
      const saved = localStorage.getItem("omomo_meal_plan");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading meal plan:", error);
    }
    return {};
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMealType, setSelectedMealType] = useState<MealType>("breakfast");
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [selectedRecipeDetails, setSelectedRecipeDetails] = useState<any>(null);
  const [loadingRecipeDetails, setLoadingRecipeDetails] = useState(false);
  const [suggestedRecipes, setSuggestedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"weekly" | "daily">("weekly");

  const KEY = "omomo_meal_plan";

  // Функція обробки кліку на рецепт
  const handleViewRecipe = async (meal: MealPlanItem) => {
    if (meal.recipeDetails) {
      setSelectedRecipeDetails(meal.recipeDetails);
      setRecipeModalOpen(true);
      return;
    }
    
    try {
      setLoadingRecipeDetails(true);
      toast.info("Генеруємо детальний рецепт...");
      
      const aiRecipe = await generateDetailedRecipe(meal.name, meal.calories);
      
      meal.recipeDetails = {
        title: aiRecipe.title || meal.name,
        image: "https://images.unsplash.com/photo-1490818387583-1b5f2223d20d?auto=format&fit=crop&w=800&q=80",
        readyInMinutes: aiRecipe.readyInMinutes || 20,
        servings: aiRecipe.servings || 1,
        nutrition: aiRecipe.nutrition || { calories: meal.calories, protein: meal.protein, fat: meal.fat, carbs: meal.carbs },
        ingredients: aiRecipe.ingredients || [],
        instructions: aiRecipe.instructions || []
      };
      
      setWeeklyPlan(prev => ({...prev}));
      setSelectedRecipeDetails(meal.recipeDetails);
      setRecipeModalOpen(true);
    } catch(e) {
      toast.error("Не вдалося згенерувати рецепт");
    } finally {
      setLoadingRecipeDetails(false);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(weeklyPlan));
    } catch (error) {
      console.error("Error saving meal plan:", error);
    }
  }, [weeklyPlan]);

  // Auto-load recipes when switching to daily tab
  useEffect(() => {
    if (activeTab === "daily" && suggestedRecipes.length === 0 && !loading) {
      loadSuggestedRecipes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
  const mealTypes: { key: MealType; label: string; icon: any }[] = [
    { key: "breakfast", label: "Сніданок", icon: Coffee },
    { key: "lunch", label: "Обід", icon: Sun },
    { key: "dinner", label: "Вечеря", icon: Moon },
    { key: "snack", label: "Перекус", icon: Apple }
  ];

  const getWeekDates = (date: string) => {
    const startDate = new Date(date);
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    const monday = new Date(startDate.setDate(diff));
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date.toISOString().split('T')[0];
    });
  };

  const currentWeekDates = getWeekDates(selectedDate);

  const getDayTotals = (date: string) => {
    const dayMeals = weeklyPlan[date];
    if (!dayMeals) return { calories: 0, protein: 0, fat: 0, carbs: 0 };

    return Object.values(dayMeals).flat().reduce((totals, meal) => ({
      calories: totals.calories + meal.calories,
      protein: totals.protein + meal.protein,
      fat: totals.fat + meal.fat,
      carbs: totals.carbs + meal.carbs
    }), { calories: 0, protein: 0, fat: 0, carbs: 0 });
  };

  const generateMealPlan = async () => {
    setLoading(true);
    try {
      const calorieDistribution = {
        breakfast: Math.round(targetCalories * 0.30),
        lunch: Math.round(targetCalories * 0.40),
        dinner: Math.round(targetCalories * 0.25),
        snack: Math.round(targetCalories * 0.05)
      };

      const macroDistribution = {
        breakfast: { protein: Math.round(targetProtein * 0.25), fat: Math.round(targetFat * 0.25), carbs: Math.round(targetCarbs * 0.30) },
        lunch: { protein: Math.round(targetProtein * 0.40), fat: Math.round(targetFat * 0.40), carbs: Math.round(targetCarbs * 0.40) },
        dinner: { protein: Math.round(targetProtein * 0.30), fat: Math.round(targetFat * 0.30), carbs: Math.round(targetCarbs * 0.25) },
        snack: { protein: Math.round(targetProtein * 0.05), fat: Math.round(targetFat * 0.05), carbs: Math.round(targetCarbs * 0.05) }
      };

      const { chatWithAICoach } = await import("@/lib/openai-ai");
      
      const aiPrompt = `Створи список різноманітних страв для плану харчування на тиждень (7 днів). 
Кожен день має 4 прийоми: сніданок (~${calorieDistribution.breakfast} ккал), обід (~${calorieDistribution.lunch} ккал), вечеря (~${calorieDistribution.dinner} ккал), перекус (~${calorieDistribution.snack} ккал).
Цілі: ${targetCalories} ккал/день, ${targetProtein}г білків, ${targetFat}г жирів, ${targetCarbs}г вуглеводів.
Відповідь ТІЛЬКИ у форматі JSON масив з 28 об'єктами (7 днів × 4 прийоми):
[
  {"day": 1, "mealType": "breakfast", "searchTerm": "овсянка з ягодами", "description": "Сніданок"},
  {"day": 1, "mealType": "lunch", "searchTerm": "куряча грудка з овочами", "description": "Обід"},
  {"day": 1, "mealType": "dinner", "searchTerm": "лосось з овочами", "description": "Вечеря"},
  {"day": 1, "mealType": "snack", "searchTerm": "йогурт з горіхами", "description": "Перекус"},
  ...
]
Кожна страва має бути різною, без повторень. Використовуй українські назви страв.`;

      let mealSuggestions: Array<{day: number, mealType: string, searchTerm: string, description: string}> = [];
      
      try {
        const aiResponse = await chatWithAICoach(aiPrompt);
        let jsonText = aiResponse;
        
        if (jsonText.includes('```json')) {
          jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        } else if (jsonText.includes('```')) {
          jsonText = jsonText.replace(/```\n?/g, '').trim();
        }
        
        const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed)) {
            mealSuggestions = parsed;
          }
        }
      } catch (error) {
        console.error("AI suggestion failed:", error);
        toast.error("Помилка генерації плану. Спробуйте ще раз.");
      }

      const newPlan: WeeklyPlan = {};
      const usedRecipeIds = new Set<number>();

      for (let dayIndex = 0; dayIndex < currentWeekDates.length; dayIndex++) {
        const date = currentWeekDates[dayIndex];
        newPlan[date] = {
          breakfast: [],
          lunch: [],
          dinner: [],
          snack: []
        };

        for (const mealType of mealTypes) {
          const suggestion = mealSuggestions.find(
            m => m.day === dayIndex + 1 && m.mealType === mealType.key
          ) || { searchTerm: "healthy food", description: mealType.label };

          try {
            const searchOptions: any = { 
              number: 10,
              maxReadyTime: 60
            };

            if (mealType.key === "breakfast") {
              searchOptions.dishType = "breakfast";
            } else if (mealType.key === "lunch") {
              searchOptions.dishType = "lunch";
            } else if (mealType.key === "dinner") {
              searchOptions.dishType = "dinner";
            }

            const result = await apiService.searchRecipes(suggestion.searchTerm, searchOptions);
            
            const targetCaloriesForMeal = calorieDistribution[mealType.key];
            const targetMacros = macroDistribution[mealType.key];
            
            const suitableRecipes = result.recipes
              .filter(recipe => {
                const recipeId = recipe.id;
                if (usedRecipeIds.has(recipeId)) return false;
                
                const recipeCalories = Math.round(
                  (recipe.nutrition?.nutrients.find((n: any) => n.name === "Calories")?.amount || 300) / recipe.servings
                );
                const caloriesDiff = Math.abs(recipeCalories - targetCaloriesForMeal);
                return caloriesDiff <= targetCaloriesForMeal * 0.3;
              })
              .slice(0, 1);

            if (suitableRecipes.length > 0) {
              const recipe = suitableRecipes[0];
              usedRecipeIds.add(recipe.id);

              const meal: MealPlanItem = {
                id: crypto.randomUUID(),
                recipeId: recipe.id,
                name: recipe.title,
                mealType: mealType.key,
                calories: Math.round((recipe.nutrition?.nutrients.find((n: any) => n.name === "Calories")?.amount || 300) / recipe.servings),
                protein: Math.round((recipe.nutrition?.nutrients.find((n: any) => n.name === "Protein")?.amount || targetMacros.protein) / recipe.servings),
                fat: Math.round((recipe.nutrition?.nutrients.find((n: any) => n.name === "Fat")?.amount || targetMacros.fat) / recipe.servings),
                carbs: Math.round((recipe.nutrition?.nutrients.find((n: any) => n.name === "Carbohydrates")?.amount || targetMacros.carbs) / recipe.servings),
                servings: 1,
                date
              };
              newPlan[date][mealType.key].push(meal);
            } else {
              toast.warning(`Не знайдено підходящих рецептів для ${mealType.label} на ${date}`);
            }
          } catch (error) {
            console.error(`Помилка пошуку рецепту для ${mealType.label}:`, error);
          }
        }
      }

      setWeeklyPlan(newPlan);
      toast.success("Персоналізований план харчування згенеровано!");
    } catch (error) {
      console.error("Помилка генерації плану:", error);
      toast.error("Помилка при генерації плану. Спробуйте ще раз.");
    } finally {
      setLoading(false);
    }
  };

  const addMealToPlan = (recipe: Recipe) => {
    const meal: MealPlanItem = {
      id: crypto.randomUUID(),
      recipeId: recipe.id,
      name: recipe.title,
      mealType: selectedMealType,
      calories: Math.round((recipe.nutrition?.nutrients.find(n => n.name === "Calories")?.amount || 300) / recipe.servings),
      protein: Math.round((recipe.nutrition?.nutrients.find(n => n.name === "Protein")?.amount || 15) / recipe.servings),
      fat: Math.round((recipe.nutrition?.nutrients.find(n => n.name === "Fat")?.amount || 10) / recipe.servings),
      carbs: Math.round((recipe.nutrition?.nutrients.find(n => n.name === "Carbohydrates")?.amount || 30) / recipe.servings),
      servings: 1,
      date: selectedDate
    };

    setWeeklyPlan(prev => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        [selectedMealType]: [...(prev[selectedDate]?.[selectedMealType] || []), meal]
      }
    }));

    toast.success("Страву додано до плану!");
  };

  const removeMealFromPlan = (mealId: string) => {
    setWeeklyPlan(prev => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        [selectedMealType]: prev[selectedDate]?.[selectedMealType]?.filter(meal => meal.id !== mealId) || []
      }
    }));
    toast.success("Страву видалено з плану!");
  };

  const loadSuggestedRecipes = async () => {
    setLoading(true);
    try {
      const recipes = await apiService.getRandomRecipes(8);
      setSuggestedRecipes(recipes);
    } catch (error) {
      console.error("Error loading suggested recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSettings = () => {
    toast.info("Налаштування плану харчування");
  };

  const handleViewRecipes = () => {
    toast.info("Перехід до рецептів");
  };

  const handleCreatePlan = () => {
    setActiveTab("daily");
    toast.info("Створення плану вручну");
  };

  const handleAIPlanSave = (plan: any) => {
    toast.success(t("aiMealPlanSaved"));
  };

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setActiveTab("daily");
  };

  const handleViewDetails = (date: string) => {
    setSelectedDate(date);
    setActiveTab("daily");
  };

  const getMealProgress = (date: string) => {
    const totals = getDayTotals(date);
    return {
      calories: Math.round((totals.calories / targetCalories) * 100),
      protein: Math.round((totals.protein / targetProtein) * 100),
      fat: Math.round((totals.fat / targetFat) * 100),
      carbs: Math.round((totals.carbs / targetCarbs) * 100)
    };
  };

  const currentDayTotals = getDayTotals(selectedDate);
  const currentDayProgress = getMealProgress(selectedDate);
  const completionPercentage = currentDayProgress.calories;

  const hasPlan = Object.keys(weeklyPlan).length > 0;

  const weeklyPlanData = currentWeekDates.map(date => {
    const totals = getDayTotals(date);
    const progress = getMealProgress(date);
    const mealCount = Object.values(weeklyPlan[date] || {}).flat().length;
    
    return {
      date,
      calories: totals.calories,
      protein: totals.protein,
      fat: totals.fat,
      carbs: totals.carbs,
      progress: progress.calories,
      mealCount
    };
  });

  const getTabContent = () => {
    switch (activeTab) {
      case "weekly":
        return (
          <div className="space-y-6">
            <MealPlanSummaryBanner
              hasPlan={hasPlan}
              completionPercentage={completionPercentage}
              streakDays={3}
            />

            {!hasPlan ? (
              <div className="space-y-6">
                <AINutritionPlanner
                  userGoals={["Похудение", "Здоровье"]}
                  dietaryRestrictions={[]}
                  targetCalories={user?.targets?.calories || 2000}
                  onSavePlan={handleAIPlanSave}
                />
                <MealPlanEmptyState
                  onGeneratePlan={generateMealPlan}
                  onCreatePlan={handleCreatePlan}
                  loading={loading}
                />
              </div>
            ) : (
              <MealPlanGrid
                weeklyPlan={weeklyPlanData}
                onDayClick={handleDayClick}
                onViewDetails={handleViewDetails}
              />
            )}

            <MealPlanRecommendations
              hasPlan={hasPlan}
              completionPercentage={completionPercentage}
              onViewRecipes={handleViewRecipes}
              onGeneratePlan={generateMealPlan}
            />
          </div>
        );

      case "daily":
        return (
          <div className="space-y-4 sm:space-y-6">
            <Card className="p-3 sm:p-4 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium whitespace-nowrap">Дата:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex-1 p-2 sm:p-3 border rounded-lg text-sm h-10 sm:h-12 bg-background/50 backdrop-blur-sm border-2 focus:border-primary/50 focus:outline-none"
                />
              </div>
            </Card>

            <div className="space-y-4 sm:space-y-5">
              {mealTypes.map((mealType) => {
                const IconComponent = mealType.icon;
                const meals = weeklyPlan[selectedDate]?.[mealType.key] || [];
                const mealTotals = meals.reduce((acc, meal) => ({
                  calories: acc.calories + meal.calories,
                  protein: acc.protein + meal.protein,
                  fat: acc.fat + meal.fat,
                  carbs: acc.carbs + meal.carbs
                }), { calories: 0, protein: 0, fat: 0, carbs: 0 });
                const isActive = selectedMealType === mealType.key;
                
                return (
                  <Card 
                    key={mealType.key}
                    className={cn(
                      "p-3 sm:p-4 bg-card/30 backdrop-blur-sm border transition-all",
                      isActive ? "border-primary/50 ring-2 ring-primary/20" : "border-muted/30"
                    )}
                  >
                    <div 
                      className="flex items-center justify-between mb-3 sm:mb-4 cursor-pointer"
                      onClick={() => setSelectedMealType(mealType.key)}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          isActive ? "bg-primary/20" : "bg-muted/30"
                        )}>
                          <IconComponent className={cn(
                            "w-4 h-4 sm:w-5 sm:h-5",
                            isActive ? "text-primary" : "text-muted-foreground"
                          )} />
                        </div>
                        <div>
                          <h4 className={cn(
                            "font-semibold text-sm sm:text-base",
                            isActive ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {mealType.label}
                          </h4>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            {meals.length} {meals.length === 1 ? 'страва' : 'страв'}
                          </div>
                        </div>
                      </div>
                      {mealTotals.calories > 0 && (
                        <div className="text-right">
                          <div className="text-base sm:text-lg font-bold text-orange-500">
                            {mealTotals.calories}
                          </div>
                          <div className="text-[10px] sm:text-xs text-muted-foreground">ккал</div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      {meals.length > 0 ? (
                        meals.map((meal) => (
                          <Card 
                            key={meal.id} 
                            onClick={() => handleViewRecipe(meal)}
                            className="p-2 sm:p-3 border border-muted/20 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all cursor-pointer"
                          >
                            <div className="flex items-start justify-between gap-2 sm:gap-3">
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-sm sm:text-base mb-1.5 sm:mb-2 line-clamp-2">
                                  {meal.name}
                                </h5>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 text-xs">
                                  <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground">Ккал:</span>
                                    <span className="font-medium text-orange-500">{meal.calories}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground">Б:</span>
                                    <span className="font-medium">{meal.protein}г</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground">Ж:</span>
                                    <span className="font-medium">{meal.fat}г</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground">В:</span>
                                    <span className="font-medium">{meal.carbs}г</span>
                                  </div>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeMealFromPlan(meal.id);
                                }}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </Button>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-4 sm:py-6 border border-dashed border-muted/30 rounded-lg">
                          <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Немає страв</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Додайте рецепт нижче</p>
                        </div>
                      )}
                    </div>

                    {isActive && (
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-muted/30">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm sm:text-base font-medium">Пропоновані рецепти</h5>
                            <Button 
                              onClick={loadSuggestedRecipes}
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs sm:text-sm"
                            >
                              Оновити
                            </Button>
                          </div>
                          <div className="space-y-2 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
                            {suggestedRecipes.length > 0 ? (
                              suggestedRecipes.map((recipe) => (
                                <Card 
                                  key={recipe.id} 
                                  className="p-2 sm:p-3 cursor-pointer hover:bg-muted/50 border border-transparent hover:border-primary/20 transition-all"
                                  onClick={() => {
                                    setSelectedMealType(mealType.key);
                                    addMealToPlan(recipe);
                                  }}
                                >
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    <img 
                                      src={recipe.image} 
                                      alt={recipe.title}
                                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100";
                                      }}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <h6 className="font-medium text-xs sm:text-sm line-clamp-1 mb-1">{recipe.title}</h6>
                                      <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          <span>{recipe.readyInMinutes} хв</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Users className="w-3 h-3" />
                                          <span>{recipe.servings} порц.</span>
                                        </div>
                                      </div>
                                    </div>
                                    <Button 
                                      size="sm" 
                                      variant="default" 
                                      className="px-2 sm:px-3 h-8 sm:h-9 flex-shrink-0 text-xs sm:text-sm"
                                    >
                                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                      Додати
                                    </Button>
                                  </div>
                                </Card>
                              ))
                            ) : (
                              <div className="text-center py-4">
                                <p className="text-xs sm:text-sm text-muted-foreground mb-2">Натисніть "Оновити" для завантаження рецептів</p>
                                <Button 
                                  onClick={loadSuggestedRecipes}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs sm:text-sm"
                                >
                                  Завантажити рецепти
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            <Card className="p-4 sm:p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Підсумок дня</h3>
              {(() => {
                const totals = getDayTotals(selectedDate);
                const progress = getMealProgress(selectedDate);
                
                return (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <div className="text-center p-2 sm:p-3 bg-card/50 rounded-lg">
                        <div className="text-base sm:text-2xl font-bold text-orange-500 mb-1">{totals.calories}</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Ккал</div>
                        <div className="text-[10px] text-muted-foreground">{progress.calories}%</div>
                      </div>
                      <div className="text-center p-2 sm:p-3 bg-card/50 rounded-lg">
                        <div className="text-base sm:text-2xl font-bold text-blue-500 mb-1">{totals.protein}г</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Білки</div>
                        <div className="text-[10px] text-muted-foreground">{progress.protein}%</div>
                      </div>
                      <div className="text-center p-2 sm:p-3 bg-card/50 rounded-lg">
                        <div className="text-base sm:text-2xl font-bold text-yellow-500 mb-1">{totals.fat}г</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Жири</div>
                        <div className="text-[10px] text-muted-foreground">{progress.fat}%</div>
                      </div>
                      <div className="text-center p-2 sm:p-3 bg-card/50 rounded-lg">
                        <div className="text-base sm:text-2xl font-bold text-green-500 mb-1">{totals.carbs}г</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Вуглеводи</div>
                        <div className="text-[10px] text-muted-foreground">{progress.carbs}%</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 pt-2 border-t border-muted/30">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Загальні калорії</span>
                        <span className="font-medium">{totals.calories} / {targetCalories} ккал</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 sm:h-2.5">
                        <div 
                          className="bg-primary h-full rounded-full transition-all"
                          style={{ width: `${Math.min(progress.calories, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <DashboardSidebar />
      <div className="flex-1 min-w-0">
        <MobileHeader />
        <main className="p-3 pb-24 md:pb-8 md:p-8 max-w-6xl mx-auto w-full space-y-4 md:space-y-6">
          <MealPlanHeaderStats
            completionPercentage={completionPercentage}
            targetCalories={targetCalories}
            currentCalories={currentDayTotals.calories}
            targetProtein={targetProtein}
            currentProtein={currentDayTotals.protein}
            targetFat={targetFat}
            currentFat={currentDayTotals.fat}
            targetCarbs={targetCarbs}
            currentCarbs={currentDayTotals.carbs}
            onGeneratePlan={generateMealPlan}
            onOpenSettings={handleOpenSettings}
          />

          <div>
            <MealPlanTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          <div>
            {getTabContent()}
          </div>
        </main>
        <MobileBottomNav />
      </div>
      
      <RecipeDetailsModal 
        isOpen={recipeModalOpen} 
        onClose={() => setRecipeModalOpen(false)} 
        recipe={selectedRecipeDetails} 
      />
    </div>
  );
}
