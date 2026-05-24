import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  MealPlanSettings, 
  MealPlanPreferences,
  DailyPlan, 
  WeeklyPlan, 
  PlannedMeal,
  MealTemplate,
  MealSwapOptions,
  calculateTargetMacros,
  calculateDailyProgress,
  getDailyStatus,
  generateMealTimes,
  DEFAULT_MEAL_TEMPLATES,
  MEAL_PLAN_STORAGE_KEYS
} from "@/lib/meal-planner";
import { useSmartFridge } from "./useSmartFridge";
import { useAuth } from "./useAuth";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

export function useMealPlanner() {
  const { user } = useAuth();
  const { products, addToShoppingList } = useSmartFridge();
  
  const [settings, setSettings] = useState<MealPlanSettings | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [dailyPlans, setDailyPlans] = useState<Map<string, DailyPlan>>(new Map());
  const [templates, setTemplates] = useState<MealTemplate[]>(DEFAULT_MEAL_TEMPLATES);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(MEAL_PLAN_STORAGE_KEYS.SETTINGS);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }

      const savedWeeklyPlan = localStorage.getItem(MEAL_PLAN_STORAGE_KEYS.WEEKLY_PLAN);
      if (savedWeeklyPlan) {
        setWeeklyPlan(JSON.parse(savedWeeklyPlan));
      }

      const savedDailyPlans = localStorage.getItem(MEAL_PLAN_STORAGE_KEYS.DAILY_PLANS);
      if (savedDailyPlans) {
        const plansMap = new Map<string, DailyPlan>(JSON.parse(savedDailyPlans));
        setDailyPlans(plansMap);
      }
    } catch (error) {
      console.error("Error loading meal planner data:", error);
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    try {
      if (settings) {
        localStorage.setItem(MEAL_PLAN_STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      }
    } catch (error) {
      console.error("Error saving meal planner settings:", error);
    }
  }, [settings]);

  useEffect(() => {
    try {
      if (weeklyPlan) {
        localStorage.setItem(MEAL_PLAN_STORAGE_KEYS.WEEKLY_PLAN, JSON.stringify(weeklyPlan));
      }
    } catch (error) {
      console.error("Error saving weekly plan:", error);
    }
  }, [weeklyPlan]);

  useEffect(() => {
    try {
      if (dailyPlans.size > 0) {
        localStorage.setItem(MEAL_PLAN_STORAGE_KEYS.DAILY_PLANS, JSON.stringify([...dailyPlans]));
      }
    } catch (error) {
      console.error("Error saving daily plans:", error);
    }
  }, [dailyPlans]);

  // Initialize settings with user data
  const initializeSettings = useCallback((preferences: MealPlanPreferences) => {
    if (!user) return;

    // Calculate target calories based on user goals
    let targetCalories = 2000; // Default
    if (user.targets?.calories) {
      targetCalories = user.targets.calories;
    }

    const targetMacros = calculateTargetMacros(preferences.goal, targetCalories);

    const newSettings: MealPlanSettings = {
      preferences,
      targetCalories,
      targetMacros,
      planningPeriod: "week",
      useFridgeProducts: true,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    setSettings(newSettings);
    toast.success("Налаштування плану збережено!");
  }, [user]);

  // Generate meal plan
  const generateMealPlan = useCallback(async (useFridgeProducts: boolean = true) => {
    if (!settings) {
      toast.error("Спочатку налаштуйте план харчування");
      return;
    }

    setGenerating(true);
    try {
      const { preferences, targetCalories, targetMacros } = settings;
      const mealTimes = generateMealTimes(preferences.mealsPerDay);
      
      // Generate plan for the week
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start from Sunday
      
      const days: DailyPlan[] = [];
      
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(currentDate.getDate() + i);
        const dateString = currentDate.toISOString().split('T')[0];
        
        const dailyMeals: PlannedMeal[] = [];
        
        // Generate meals for each meal type
        const mealTypes: PlannedMeal["mealType"][] = ["breakfast", "lunch", "dinner"];
        if (preferences.mealsPerDay > 3) {
          mealTypes.push("snack");
        }
        if (preferences.mealsPerDay > 4) {
          mealTypes.push("snack");
        }
        
        for (let j = 0; j < mealTypes.length; j++) {
          const mealType = mealTypes[j];
          const scheduledTime = mealTimes[j] || "12:00";
          
          // Generate recipe for this meal
          const recipe = await generateRecipeForMeal(
            mealType,
            preferences,
            targetCalories / preferences.mealsPerDay,
            useFridgeProducts
          );
          
          if (recipe) {
            const plannedMeal: PlannedMeal = {
              id: `${dateString}-${mealType}-${j}`,
              mealType,
              recipe,
              scheduledTime,
              isCompleted: false
            };
            
            dailyMeals.push(plannedMeal);
          }
        }
        
        // Calculate daily nutrition
        const totalNutrition = dailyMeals.reduce((total, meal) => ({
          planned: {
            calories: total.planned.calories + meal.recipe.nutrition.calories,
            protein: total.planned.protein + meal.recipe.nutrition.protein,
            fat: total.planned.fat + meal.recipe.nutrition.fat,
            carbs: total.planned.carbs + meal.recipe.nutrition.carbs
          },
          actual: total.actual
        }), {
          planned: { calories: 0, protein: 0, fat: 0, carbs: 0 },
          actual: { calories: 0, protein: 0, fat: 0, carbs: 0 }
        });
        
        const progress = calculateDailyProgress(totalNutrition.planned, totalNutrition.actual);
        const status = getDailyStatus(progress);
        
        const dailyPlan: DailyPlan = {
          date: dateString,
          meals: dailyMeals,
          totalNutrition,
          progress,
          status
        };
        
        days.push(dailyPlan);
      }
      
      // Create weekly plan
      const newWeeklyPlan: WeeklyPlan = {
        weekStart: weekStart.toISOString().split('T')[0],
        days,
        totalNutrition: {
          planned: {
            calories: days.reduce((sum, day) => sum + day.totalNutrition.planned.calories, 0),
            protein: days.reduce((sum, day) => sum + day.totalNutrition.planned.protein, 0),
            fat: days.reduce((sum, day) => sum + day.totalNutrition.planned.fat, 0),
            carbs: days.reduce((sum, day) => sum + day.totalNutrition.planned.carbs, 0)
          },
          actual: {
            calories: days.reduce((sum, day) => sum + day.totalNutrition.actual.calories, 0),
            protein: days.reduce((sum, day) => sum + day.totalNutrition.actual.protein, 0),
            fat: days.reduce((sum, day) => sum + day.totalNutrition.actual.fat, 0),
            carbs: days.reduce((sum, day) => sum + day.totalNutrition.actual.carbs, 0)
          }
        },
        averageProgress: {
          caloriesProgress: Math.round(days.reduce((sum, day) => sum + day.progress.caloriesProgress, 0) / days.length),
          proteinProgress: Math.round(days.reduce((sum, day) => sum + day.progress.proteinProgress, 0) / days.length),
          fatProgress: Math.round(days.reduce((sum, day) => sum + day.progress.fatProgress, 0) / days.length),
          carbsProgress: Math.round(days.reduce((sum, day) => sum + day.progress.carbsProgress, 0) / days.length)
        },
        adherence: 0 // Will be calculated based on completed meals
      };
      
      setWeeklyPlan(newWeeklyPlan);
      
      // Update daily plans map
      const newDailyPlans = new Map(dailyPlans);
      days.forEach(day => {
        newDailyPlans.set(day.date, day);
      });
      setDailyPlans(newDailyPlans);
      
      // Generate shopping list if not using fridge products
      if (!useFridgeProducts) {
        await generateShoppingList(newWeeklyPlan);
      }
      
      toast.success("План харчування згенеровано!");
      
    } catch (error) {
      console.error("Error generating meal plan:", error);
      toast.error("Помилка генерації плану харчування");
    } finally {
      setGenerating(false);
    }
  }, [settings, products, dailyPlans]);

  // Generate recipe for specific meal
  const generateRecipeForMeal = async (
    mealType: PlannedMeal["mealType"],
    preferences: MealPlanPreferences,
    targetCalories: number,
    useFridgeProducts: boolean
  ): Promise<PlannedMeal["recipe"] | null> => {
    try {
      // Search for recipes based on meal type and preferences
      const searchTerms = getSearchTermsForMeal(mealType, preferences);
      
      for (const term of searchTerms) {
        try {
          const result = await apiService.searchRecipes(term, { number: 5 });
          if (result.recipes.length > 0) {
            const recipe = result.recipes[0];
            
            // Check if ingredients are available in fridge
            const ingredients = recipe.extendedIngredients?.map((ing: any) => ({
              name: ing.name,
              amount: ing.amount,
              unit: ing.unit,
              isAvailable: useFridgeProducts ? checkIngredientAvailability(ing.name) : false
            })) || [];
            
            return {
              id: String(recipe.id),
              title: recipe.title,
              image: recipe.image,
              readyInMinutes: recipe.readyInMinutes,
              servings: recipe.servings,
              nutrition: {
                calories: Math.round(recipe.nutrition?.nutrients?.find((n: any) => n.name === "Calories")?.amount || 300),
                protein: Math.round(recipe.nutrition?.nutrients?.find((n: any) => n.name === "Protein")?.amount || 15),
                fat: Math.round(recipe.nutrition?.nutrients?.find((n: any) => n.name === "Fat")?.amount || 10),
                carbs: Math.round(recipe.nutrition?.nutrients?.find((n: any) => n.name === "Carbohydrates")?.amount || 30)
              },
              ingredients,
              instructions: recipe.analyzedInstructions?.[0]?.steps?.map((step: any) => step.step) || []
            };
          }
        } catch (error) {
          console.error(`Error searching for ${term}:`, error);
        }
      }
      
      throw new Error("Не вдалося знайти рецепт");
    } catch (error) {
      console.error("Error generating recipe:", error);
      throw error;
    }
  };

  // Check if ingredient is available in fridge
  const checkIngredientAvailability = (ingredientName: string): boolean => {
    return products.some(product => 
      product.name.toLowerCase().includes(ingredientName.toLowerCase()) ||
      ingredientName.toLowerCase().includes(product.name.toLowerCase())
    );
  };

  // Get search terms for meal type
  const getSearchTermsForMeal = (mealType: PlannedMeal["mealType"], preferences: MealPlanPreferences): string[] => {
    const baseTerms = {
      breakfast: ["breakfast", "oatmeal", "eggs", "pancakes", "smoothie"],
      lunch: ["lunch", "salad", "sandwich", "soup", "pasta"],
      dinner: ["dinner", "chicken", "fish", "beef", "vegetables"],
      snack: ["snack", "nuts", "fruit", "yogurt", "cheese"]
    };
    
    let terms = baseTerms[mealType] || ["meal"];
    
    // Adjust based on diet type
    if (preferences.dietType === "vegetarian") {
      terms = terms.filter(term => !["chicken", "beef", "fish"].includes(term));
      terms.push("vegetarian", "tofu", "beans");
    } else if (preferences.dietType === "vegan") {
      terms = terms.filter(term => !["chicken", "beef", "fish", "eggs", "cheese", "yogurt"].includes(term));
      terms.push("vegan", "plant-based", "tofu", "beans");
    } else if (preferences.dietType === "keto") {
      terms.push("keto", "low-carb", "high-fat");
    }
    
    return terms;
  };


  // Generate shopping list from meal plan
  const generateShoppingList = async (plan: WeeklyPlan) => {
    const allIngredients = new Map<string, { amount: number; unit: string; recipe: string }>();
    
    plan.days.forEach(day => {
      day.meals.forEach(meal => {
        meal.recipe.ingredients.forEach(ingredient => {
          if (!ingredient.isAvailable) {
            const key = ingredient.name.toLowerCase();
            if (allIngredients.has(key)) {
              const existing = allIngredients.get(key)!;
              existing.amount += ingredient.amount;
            } else {
              allIngredients.set(key, {
                amount: ingredient.amount,
                unit: ingredient.unit,
                recipe: meal.recipe.title
              });
            }
          }
        });
      });
    });
    
    // Add ingredients to shopping list
    allIngredients.forEach((ingredient, name) => {
      addToShoppingList({
        id: `meal-plan-${Date.now()}`,
        name: name,
        category: "Інше" as any,
        quantity: { amount: ingredient.amount, unit: ingredient.unit as any },
        addedDate: new Date().toISOString(),
        isInPantry: false,
        nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0 }
      }, "recipe_missing");
    });
    
    toast.success(`Додано ${allIngredients.size} інгредієнтів до списку покупок`);
  };

  // Mark meal as completed
  const markMealCompleted = useCallback((mealId: string, date: string) => {
    const dailyPlan = dailyPlans.get(date);
    if (!dailyPlan) return;
    
    const updatedMeals = dailyPlan.meals.map(meal => {
      if (meal.id === mealId) {
        return {
          ...meal,
          isCompleted: true,
          completedAt: new Date().toISOString()
        };
      }
      return meal;
    });
    
    // Recalculate nutrition
    const actualNutrition = updatedMeals
      .filter(meal => meal.isCompleted)
      .reduce((total, meal) => ({
        calories: total.calories + meal.recipe.nutrition.calories,
        protein: total.protein + meal.recipe.nutrition.protein,
        fat: total.fat + meal.recipe.nutrition.fat,
        carbs: total.carbs + meal.recipe.nutrition.carbs
      }), { calories: 0, protein: 0, fat: 0, carbs: 0 });
    
    const updatedDailyPlan: DailyPlan = {
      ...dailyPlan,
      meals: updatedMeals,
      totalNutrition: {
        ...dailyPlan.totalNutrition,
        actual: actualNutrition
      },
      progress: calculateDailyProgress(dailyPlan.totalNutrition.planned, actualNutrition),
      status: getDailyStatus(calculateDailyProgress(dailyPlan.totalNutrition.planned, actualNutrition))
    };
    
    const newDailyPlans = new Map(dailyPlans);
    newDailyPlans.set(date, updatedDailyPlan);
    setDailyPlans(newDailyPlans);
    
    toast.success("Прийом їжі відмічено як завершений!");
  }, [dailyPlans]);

  // Get meal swap options
  const getMealSwapOptions = useCallback(async (meal: PlannedMeal): Promise<MealSwapOptions> => {
    // This would generate alternative recipes with similar nutrition
    // TODO: Implement real meal swap options via API
    throw new Error("Функція заміни страв ще не реалізована через API");
  }, []);

  // Computed values
  const currentWeekPlan = useMemo(() => {
    if (!weeklyPlan) return null;
    
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date(weeklyPlan.weekStart);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const todayDate = new Date(today);
    if (todayDate >= weekStart && todayDate <= weekEnd) {
      return weeklyPlan;
    }
    
    return null;
  }, [weeklyPlan]);

  const todayPlan = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return dailyPlans.get(today) || null;
  }, [dailyPlans]);

  const isSetupComplete = useMemo(() => {
    return settings !== null;
  }, [settings]);

  return {
    // Data
    settings,
    weeklyPlan: currentWeekPlan,
    dailyPlans,
    todayPlan,
    templates,
    isSetupComplete,
    
    // Loading states
    loading,
    generating,
    
    // Actions
    initializeSettings,
    generateMealPlan,
    markMealCompleted,
    getMealSwapOptions,
    
    // Computed
    adherence: weeklyPlan ? Math.round((weeklyPlan.days.reduce((sum, day) => 
      sum + day.meals.filter(meal => meal.isCompleted).length, 0) / 
      (weeklyPlan.days.length * 3)) * 100) : 0
  };
}
