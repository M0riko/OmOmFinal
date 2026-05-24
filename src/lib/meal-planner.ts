// Intelligent Meal Planner - Data structures and utilities

export interface MealPlanPreferences {
  goal: "weight_loss" | "maintenance" | "weight_gain";
  dietType: "standard" | "vegetarian" | "vegan" | "keto" | "paleo" | "mediterranean" | "gluten_free" | "dairy_free";
  excludedFoods: string[]; // Allergens and disliked foods
  mealsPerDay: 3 | 4 | 5 | 6;
  cookingTime: "quick" | "moderate" | "extensive"; // <30min, 30-60min, >60min
  cookingSkill: "beginner" | "intermediate" | "advanced";
  budget: "low" | "medium" | "high";
}

export interface MealPlanSettings {
  preferences: MealPlanPreferences;
  targetCalories: number;
  targetMacros: {
    protein: number; // grams
    fat: number; // grams
    carbs: number; // grams
  };
  planningPeriod: "3_days" | "week" | "month";
  useFridgeProducts: boolean;
  createdAt: string;
  lastUpdated: string;
}

export interface PlannedMeal {
  id: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  recipe: {
    id: string;
    title: string;
    image: string;
    readyInMinutes: number;
    servings: number;
    nutrition: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
    };
    ingredients: Array<{
      name: string;
      amount: number;
      unit: string;
      isAvailable: boolean; // From fridge
    }>;
    instructions: string[];
  };
  scheduledTime?: string; // "08:00", "13:00", etc.
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
}

export interface DailyPlan {
  date: string; // YYYY-MM-DD
  meals: PlannedMeal[];
  totalNutrition: {
    planned: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
    };
    actual: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
    };
  };
  progress: {
    caloriesProgress: number; // percentage
    proteinProgress: number;
    fatProgress: number;
    carbsProgress: number;
  };
  status: "on_track" | "under" | "over" | "not_started";
}

export interface WeeklyPlan {
  weekStart: string; // YYYY-MM-DD
  days: DailyPlan[];
  totalNutrition: {
    planned: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
    };
    actual: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
    };
  };
  averageProgress: {
    caloriesProgress: number;
    proteinProgress: number;
    fatProgress: number;
    carbsProgress: number;
  };
  adherence: number; // percentage of completed meals
}

export interface MealTemplate {
  id: string;
  name: string;
  description: string;
  category: "weight_loss" | "muscle_gain" | "maintenance" | "diet_specific" | "quick_meals";
  dietType: MealPlanPreferences["dietType"];
  targetCalories: {
    min: number;
    max: number;
  };
  duration: "3_days" | "week" | "2_weeks" | "month";
  mealsPerDay: MealPlanPreferences["mealsPerDay"];
  cookingTime: MealPlanPreferences["cookingTime"];
  features: string[]; // ["high_protein", "low_carb", "quick_prep", etc.]
  sampleRecipes: string[]; // Recipe IDs
  popularity: number; // 0-100
}

export interface MealSwapOptions {
  originalMeal: PlannedMeal;
  alternatives: Array<{
    recipe: PlannedMeal["recipe"];
    similarity: number; // 0-100, based on nutrition similarity
    reason: string; // "Similar calories", "Same protein content", etc.
  }>;
}

// Utility functions
export function calculateTargetMacros(
  goal: MealPlanPreferences["goal"],
  targetCalories: number,
  weight?: number
): MealPlanSettings["targetMacros"] {
  let proteinRatio = 0.25; // 25% of calories
  let fatRatio = 0.30; // 30% of calories
  let carbsRatio = 0.45; // 45% of calories

  // Adjust ratios based on goal
  switch (goal) {
    case "weight_loss":
      proteinRatio = 0.30; // Higher protein for satiety
      fatRatio = 0.25;
      carbsRatio = 0.45;
      break;
    case "weight_gain":
      proteinRatio = 0.20;
      fatRatio = 0.35; // Higher fat for calorie density
      carbsRatio = 0.45;
      break;
    case "maintenance":
      // Default ratios
      break;
  }

  return {
    protein: Math.round((targetCalories * proteinRatio) / 4), // 4 cal/g protein
    fat: Math.round((targetCalories * fatRatio) / 9), // 9 cal/g fat
    carbs: Math.round((targetCalories * carbsRatio) / 4) // 4 cal/g carbs
  };
}

export function calculateDailyProgress(
  planned: DailyPlan["totalNutrition"]["planned"],
  actual: DailyPlan["totalNutrition"]["actual"]
): DailyPlan["progress"] {
  return {
    caloriesProgress: Math.round((actual.calories / planned.calories) * 100),
    proteinProgress: Math.round((actual.protein / planned.protein) * 100),
    fatProgress: Math.round((actual.fat / planned.fat) * 100),
    carbsProgress: Math.round((actual.carbs / planned.carbs) * 100)
  };
}

export function getDailyStatus(progress: DailyPlan["progress"]): DailyPlan["status"] {
  const { caloriesProgress } = progress;
  
  if (caloriesProgress === 0) return "not_started";
  if (caloriesProgress >= 90 && caloriesProgress <= 110) return "on_track";
  if (caloriesProgress < 90) return "under";
  return "over";
}

export function generateMealTimes(mealsPerDay: MealPlanPreferences["mealsPerDay"]): string[] {
  switch (mealsPerDay) {
    case 3:
      return ["08:00", "13:00", "19:00"];
    case 4:
      return ["08:00", "12:00", "16:00", "19:00"];
    case 5:
      return ["08:00", "11:00", "14:00", "17:00", "20:00"];
    case 6:
      return ["08:00", "10:30", "13:00", "15:30", "18:00", "20:30"];
    default:
      return ["08:00", "13:00", "19:00"];
  }
}

export function getMealTypeName(mealType: PlannedMeal["mealType"]): string {
  const names = {
    breakfast: "Сніданок",
    lunch: "Обід",
    dinner: "Вечеря",
    snack: "Перекус"
  };
  return names[mealType];
}

export function getMealTypeIcon(mealType: PlannedMeal["mealType"]): string {
  // Return icon names instead of emojis for proper styling
  const icons = {
    breakfast: "sunrise",
    lunch: "sun",
    dinner: "moon",
    snack: "apple"
  };
  return icons[mealType];
}

export function getStatusColor(status: DailyPlan["status"]): string {
  const colors = {
    on_track: "text-green-500",
    under: "text-yellow-500",
    over: "text-red-500",
    not_started: "text-gray-500"
  };
  return colors[status];
}

export function getStatusText(status: DailyPlan["status"]): string {
  const texts = {
    on_track: "В межах норми",
    under: "Недобір",
    over: "Перебір",
    not_started: "Не розпочато"
  };
  return texts[status];
}

// Default meal templates
export const DEFAULT_MEAL_TEMPLATES: MealTemplate[] = [
  {
    id: "high_protein_weight_loss",
    name: "Високобілковий план для схуднення",
    description: "План з акцентом на білки для збереження м'язової маси при схудненні",
    category: "weight_loss",
    dietType: "standard",
    targetCalories: { min: 1200, max: 1800 },
    duration: "week",
    mealsPerDay: 4,
    cookingTime: "moderate",
    features: ["high_protein", "low_calorie", "satiety"],
    sampleRecipes: [],
    popularity: 85
  },
  {
    id: "keto_plan",
    name: "Кето дієта",
    description: "Низьковуглеводний план з високим вмістом жирів",
    category: "diet_specific",
    dietType: "keto",
    targetCalories: { min: 1500, max: 2500 },
    duration: "week",
    mealsPerDay: 3,
    cookingTime: "moderate",
    features: ["low_carb", "high_fat", "ketosis"],
    sampleRecipes: [],
    popularity: 70
  },
  {
    id: "vegan_balanced",
    name: "Веганський збалансований план",
    description: "Повністю рослинний план з усіма необхідними поживними речовинами",
    category: "diet_specific",
    dietType: "vegan",
    targetCalories: { min: 1800, max: 2200 },
    duration: "week",
    mealsPerDay: 4,
    cookingTime: "moderate",
    features: ["plant_based", "balanced", "sustainable"],
    sampleRecipes: [],
    popularity: 60
  },
  {
    id: "quick_meals",
    name: "Швидкі страви",
    description: "План для зайнятих людей з рецептами до 30 хвилин",
    category: "quick_meals",
    dietType: "standard",
    targetCalories: { min: 1500, max: 2000 },
    duration: "week",
    mealsPerDay: 3,
    cookingTime: "quick",
    features: ["quick_prep", "simple", "time_saving"],
    sampleRecipes: [],
    popularity: 90
  },
  {
    id: "muscle_gain",
    name: "План для набору маси",
    description: "Висококалорійний план для набору м'язової маси",
    category: "muscle_gain",
    dietType: "standard",
    targetCalories: { min: 2500, max: 3500 },
    duration: "week",
    mealsPerDay: 5,
    cookingTime: "moderate",
    features: ["high_calorie", "high_protein", "muscle_building"],
    sampleRecipes: [],
    popularity: 75
  }
];

// Storage keys
export const MEAL_PLAN_STORAGE_KEYS = {
  SETTINGS: "omomo_meal_plan_settings",
  WEEKLY_PLAN: "omomo_weekly_plan",
  DAILY_PLANS: "omomo_daily_plans",
  TEMPLATES: "omomo_meal_templates"
} as const;
