import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { MealSection } from "@/components/MealSection";
import { AddMealModal } from "@/components/AddMealModal";
import { AIPlanGenerator } from "@/components/AIPlanGenerator";
import { NutritionSummary } from "@/components/NutritionSummary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useMemo } from "react";
import { Plus, Sparkles, Save, Calendar, Utensils } from "lucide-react";
import { Recipe } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { RecipeDetailsModal } from "@/components/RecipeDetailsModal";
import { generateDetailedRecipe } from "@/lib/openai-ai";

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
  image?: string;
  date: string;
};

type DailyPlan = {
  [mealType in MealType]: MealPlanItem[];
};

type SavedPlan = {
  date: string;
  plan: DailyPlan;
  totals: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
};

export default function MealPlanNew() {
  const { user } = useAuth();
  const targetCalories = user?.targets?.calories || 2100;
  const targetProtein = user?.targets?.protein || 120;
  const targetFat = user?.targets?.fats || 65;
  const targetCarbs = user?.targets?.carbs || 250;

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [dailyPlan, setDailyPlan] = useState<DailyPlan>({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: []
  });
  
  const [addMealModalOpen, setAddMealModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>("breakfast");
  const [aiGeneratorOpen, setAiGeneratorOpen] = useState(false);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [selectedRecipeDetails, setSelectedRecipeDetails] = useState<any>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);

  const STORAGE_KEY = "omomo_meal_plans";

  // Load saved plans
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const plans = JSON.parse(saved);
        setSavedPlans(plans);
      }
    } catch (error) {
      console.error("Error loading saved plans:", error);
    }
  }, []);

  // Load plan for selected date
  useEffect(() => {
    const datePlan = savedPlans.find(p => p.date === selectedDate);
    if (datePlan) {
      setDailyPlan(datePlan.plan);
    } else {
      setDailyPlan({ breakfast: [], lunch: [], dinner: [], snack: [] });
    }
  }, [selectedDate, savedPlans]);

  // Calculate totals
  const totals = useMemo(() => {
    return Object.values(dailyPlan).flat().reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        fat: acc.fat + meal.fat,
        carbs: acc.carbs + meal.carbs
      }),
      { calories: 0, protein: 0, fat: 0, carbs: 0 }
    );
  }, [dailyPlan]);

  // Get day name
  const getDayName = (date: string) => {
    const days = ["Неділя", "Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота"];
    const dayIndex = new Date(date).getDay();
    return days[dayIndex];
  };

  const getDateLabel = (date: string) => {
    const d = new Date(date);
    const months = [
      "січня", "лютого", "березня", "квітня", "травня", "червня",
      "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"
    ];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  };

  // Calculate macro balance
  const macroBalance = useMemo(() => {
    const proteinPercent = totals.protein > 0 ? Math.round((totals.protein / targetProtein) * 100) : 0;
    const fatPercent = totals.fat > 0 ? Math.round((totals.fat / targetFat) * 100) : 0;
    const carbsPercent = totals.carbs > 0 ? Math.round((totals.carbs / targetCarbs) * 100) : 0;
    return `${proteinPercent}% / ${fatPercent}% / ${carbsPercent}%`;
  }, [totals, targetProtein, targetFat, targetCarbs]);

  const handleAddMeal = (mealType: MealType) => {
    setSelectedMealType(mealType);
    setAddMealModalOpen(true);
  };

  const handleMealAdded = (recipe: Recipe) => {
    const meal: MealPlanItem = {
      id: crypto.randomUUID(),
      recipeId: recipe.id,
      name: recipe.title,
      mealType: selectedMealType,
      calories: Math.round((recipe.nutrition?.nutrients.find((n: any) => n.name === "Calories")?.amount || 300) / recipe.servings),
      protein: Math.round((recipe.nutrition?.nutrients.find((n: any) => n.name === "Protein")?.amount || 15) / recipe.servings),
      fat: Math.round((recipe.nutrition?.nutrients.find((n: any) => n.name === "Fat")?.amount || 10) / recipe.servings),
      carbs: Math.round((recipe.nutrition?.nutrients.find((n: any) => n.name === "Carbohydrates")?.amount || 30) / recipe.servings),
      image: recipe.image,
      date: selectedDate
    };

    setDailyPlan(prev => ({
      ...prev,
      [selectedMealType]: [...prev[selectedMealType], meal]
    }));

    toast.success("Страву додано!");
  };

  const handleManualMealAdded = (meal: { name: string; calories: number; protein: number; fat: number; carbs: number }) => {
    const mealItem: MealPlanItem = {
      id: crypto.randomUUID(),
      name: meal.name,
      mealType: selectedMealType,
      calories: meal.calories,
      protein: meal.protein,
      fat: meal.fat,
      carbs: meal.carbs,
      date: selectedDate
    };

    setDailyPlan(prev => ({
      ...prev,
      [selectedMealType]: [...prev[selectedMealType], mealItem]
    }));

    toast.success("Страву додано вручну!");
  };

  const handleRemoveMeal = (mealType: MealType, mealId: string) => {
    setDailyPlan(prev => ({
      ...prev,
      [mealType]: prev[mealType].filter(meal => meal.id !== mealId)
    }));
    toast.success("Страву видалено");
  };

  const handleSavePlan = () => {
    const planToSave: SavedPlan = {
      date: selectedDate,
      plan: dailyPlan,
      totals
    };

    const updatedPlans = savedPlans.filter(p => p.date !== selectedDate);
    updatedPlans.push(planToSave);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlans));
      setSavedPlans(updatedPlans);
      toast.success("План збережено!");
    } catch (error) {
      console.error("Error saving plan:", error);
      toast.error("Помилка збереження");
    }
  };

  const handleViewRecipe = async (meal: any) => {
    if (meal.recipeDetails) {
      setSelectedRecipeDetails(meal.recipeDetails);
      setRecipeModalOpen(true);
      return;
    }
    
    try {
      setLoadingRecipe(true);
      toast.info("Генеруємо детальний рецепт...");
      
      const userDietType = (user as any)?.preferences?.dietType || 'всі';
      const userAllergies = (user as any)?.preferences?.excludedFoods?.join(', ') || '';
      
      const aiRecipe = await generateDetailedRecipe(meal.name, meal.calories, userDietType, userAllergies);
      
      meal.recipeDetails = {
        title: aiRecipe.title || meal.name,
        image: meal.image || `https://loremflickr.com/150/150/food,dish?random=${encodeURIComponent(meal.name)}`,
        readyInMinutes: aiRecipe.readyInMinutes || 20,
        servings: aiRecipe.servings || 1,
        nutrition: aiRecipe.nutrition || { calories: meal.calories, protein: meal.protein, fat: meal.fat, carbs: meal.carbs },
        ingredients: aiRecipe.ingredients || [],
        instructions: aiRecipe.instructions || []
      };
      
      setSelectedRecipeDetails(meal.recipeDetails);
      setRecipeModalOpen(true);
    } catch(e: any) {
      toast.error(e.message || "Не вдалося згенерувати рецепт");
    } finally {
      setLoadingRecipe(false);
    }
  };

  const handleAIPlanGenerated = (plan: any) => {
    const calcCals = (target: number, ratio: number) => Math.round(target * ratio);
    const cb = calcCals(targetCalories, 0.30);
    const cl = calcCals(targetCalories, 0.40);
    const cd = calcCals(targetCalories, 0.25);
    const cs = calcCals(targetCalories, 0.05);

    const calcMacs = (target: number, ratio: number) => Math.round(target * ratio);
    
    // Convert AI plan to our format
    const newPlan: DailyPlan = {
      breakfast: plan.breakfast?.map((meal: Recipe, i: number, arr: any[]) => ({
        id: crypto.randomUUID(),
        recipeId: meal.id,
        name: meal.title,
        mealType: "breakfast" as MealType,
        calories: Math.round(cb / arr.length),
        protein: Math.round(calcMacs(targetProtein, 0.25) / arr.length),
        fat: Math.round(calcMacs(targetFat, 0.25) / arr.length),
        carbs: Math.round(calcMacs(targetCarbs, 0.30) / arr.length),
        image: meal.image,
        date: selectedDate
      })) || [],
      lunch: plan.lunch?.map((meal: Recipe, i: number, arr: any[]) => ({
        id: crypto.randomUUID(),
        recipeId: meal.id,
        name: meal.title,
        mealType: "lunch" as MealType,
        calories: Math.round(cl / arr.length),
        protein: Math.round(calcMacs(targetProtein, 0.40) / arr.length),
        fat: Math.round(calcMacs(targetFat, 0.40) / arr.length),
        carbs: Math.round(calcMacs(targetCarbs, 0.40) / arr.length),
        image: meal.image,
        date: selectedDate
      })) || [],
      dinner: plan.dinner?.map((meal: Recipe, i: number, arr: any[]) => ({
        id: crypto.randomUUID(),
        recipeId: meal.id,
        name: meal.title,
        mealType: "dinner" as MealType,
        calories: Math.round(cd / arr.length),
        protein: Math.round(calcMacs(targetProtein, 0.30) / arr.length),
        fat: Math.round(calcMacs(targetFat, 0.30) / arr.length),
        carbs: Math.round(calcMacs(targetCarbs, 0.25) / arr.length),
        image: meal.image,
        date: selectedDate
      })) || [],
      snack: plan.snack?.map((meal: Recipe, i: number, arr: any[]) => ({
        id: crypto.randomUUID(),
        recipeId: meal.id,
        name: meal.title,
        mealType: "snack" as MealType,
        calories: Math.round(cs / arr.length),
        protein: Math.round(calcMacs(targetProtein, 0.05) / arr.length),
        fat: Math.round(calcMacs(targetFat, 0.05) / arr.length),
        carbs: Math.round(calcMacs(targetCarbs, 0.05) / arr.length),
        image: meal.image,
        date: selectedDate
      })) || []
    };

    setDailyPlan(newPlan);
    toast.success("План з AI додано!");
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <DashboardSidebar />
      <div className="flex-1 min-w-0">
        <MobileHeader />
        <main className="p-3 sm:p-4 md:p-8 pb-24 md:pb-8 max-w-6xl mx-auto w-full">
          {/* Sticky Header */}
          <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border mb-4 sm:mb-6 -mx-3 sm:-mx-4 md:-mx-8 px-3 sm:px-4 md:px-8 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 sm:gap-3 mb-1">
                  <Utensils className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">План харчування</h1>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{getDayName(selectedDate)}, {getDateLabel(selectedDate)}</span>
                  <span className="mx-1">•</span>
                  <span>Баланс: {macroBalance}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Day/Week Toggle */}
                <div className="flex items-center gap-1 p-1 bg-card rounded-lg border border-border">
                  <Button
                    size="sm"
                    variant={viewMode === "day" ? "default" : "ghost"}
                    onClick={() => setViewMode("day")}
                    className="h-8 px-3 text-xs sm:text-sm"
                  >
                    День
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === "week" ? "default" : "ghost"}
                    onClick={() => setViewMode("week")}
                    className="h-8 px-3 text-xs sm:text-sm"
                  >
                    Тиждень
                  </Button>
                </div>

                {/* Action Buttons */}
                <Button
                  size="sm"
                  onClick={() => setAiGeneratorOpen(true)}
                  className="h-9 sm:h-10 hidden sm:flex"
                >
                  <Sparkles className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">З AI</span>
                </Button>
                <Button
                  size="sm"
                  onClick={handleSavePlan}
                  variant="outline"
                  className="h-9 sm:h-10"
                >
                  <Save className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Зберегти</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Action Buttons */}
          <div className="flex gap-2 mb-4 sm:hidden">
            <Button
              size="sm"
              onClick={() => setAiGeneratorOpen(true)}
              className="flex-1"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              З AI
            </Button>
            <Button
              size="sm"
              onClick={handleSavePlan}
              variant="outline"
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Зберегти
            </Button>
          </div>

          {/* Date Selector */}
          <Card className="p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-foreground whitespace-nowrap">Дата:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex-1 p-2 sm:p-3 border rounded-lg text-sm bg-background border-border focus:border-primary focus:outline-none text-foreground"
              />
            </div>
          </Card>

          {/* Meal Sections */}
          {viewMode === "day" ? (
            <div className="space-y-4 sm:space-y-6">
              <MealSection
                mealType="breakfast"
                meals={dailyPlan.breakfast}
                onAddMeal={() => handleAddMeal("breakfast")}
                onRemoveMeal={(id) => handleRemoveMeal("breakfast", id)}
                onViewRecipe={handleViewRecipe}
              />
              
              <MealSection
                mealType="lunch"
                meals={dailyPlan.lunch}
                onAddMeal={() => handleAddMeal("lunch")}
                onRemoveMeal={(id) => handleRemoveMeal("lunch", id)}
                onViewRecipe={handleViewRecipe}
              />
              
              <MealSection
                mealType="dinner"
                meals={dailyPlan.dinner}
                onAddMeal={() => handleAddMeal("dinner")}
                onRemoveMeal={(id) => handleRemoveMeal("dinner", id)}
                onViewRecipe={handleViewRecipe}
              />
              
              <MealSection
                mealType="snack"
                meals={dailyPlan.snack}
                onAddMeal={() => handleAddMeal("snack")}
                onRemoveMeal={(id) => handleRemoveMeal("snack", id)}
                onViewRecipe={handleViewRecipe}
              />

              {/* Nutrition Summary */}
              <NutritionSummary
                targetCalories={targetCalories}
                currentCalories={totals.calories}
                targetProtein={targetProtein}
                currentProtein={totals.protein}
                targetFat={targetFat}
                currentFat={totals.fat}
                targetCarbs={targetCarbs}
                currentCarbs={totals.carbs}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <Card className="p-6">
                <p className="text-muted-foreground text-center">Режим тижня в розробці</p>
              </Card>
            </div>
          )}

          {/* Modals */}
          <AddMealModal
            open={addMealModalOpen}
            onOpenChange={setAddMealModalOpen}
            presetMealType={selectedMealType}
            onAddMeal={handleMealAdded}
            onAddManual={handleManualMealAdded}
          />

          <AIPlanGenerator
            open={aiGeneratorOpen}
            onOpenChange={setAiGeneratorOpen}
            targetCalories={targetCalories}
            targetProtein={targetProtein}
            targetFat={targetFat}
            targetCarbs={targetCarbs}
            onPlanGenerated={handleAIPlanGenerated}
          />

          <RecipeDetailsModal 
            isOpen={recipeModalOpen} 
            onClose={() => setRecipeModalOpen(false)} 
            recipe={selectedRecipeDetails} 
          />
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}

